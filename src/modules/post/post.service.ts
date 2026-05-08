/**\n * Post Service Layer\n * \n * Handles all business logic for blog post operations:\n * - CRUD operations (Create, Read, Update, Delete)\n * - Post filtering and search\n * - Pagination and sorting\n * - Statistics aggregation\n * - Access control validation\n */\n\nimport { CommentStatus, Post, PostStatus, Prisma } from \"@prisma/client\";\nimport { prisma } from \"../../lib/prisma\";\n\n/**\n * Create a new blog post\n * \n * @param data - Post data (title, content, tags, etc.)\n * @param userId - ID of the user creating the post (set as author)\n * @returns Created post object with generated ID and timestamps\n */\nconst createPost = async (data: Omit<Post, \"id\" | \"createdAt\" | \"updatedAt\" | \"authorId\">, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
}

/**
 * Retrieve all posts with advanced filtering, searching, and pagination
 * 
 * Supports filtering by:
 * - Search term (title, content, tags)
 * - Tags (multiple)
 * - Featured status
 * - Publication status (Draft, Published, Archived)
 * - Author ID
 * 
 * @param options - Filter, search, pagination, and sorting parameters
 * @returns Posts data with pagination metadata
 */
const getAllPosts = async ({ search, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder }
  : {
    search?: string,
    tags?: string[] | [],
    isFeatured?: boolean | undefined,
    status: PostStatus | undefined,
    authorId?: string | undefined,
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string
  }) => {

  // Build dynamic WHERE conditions based on provided filters
  const andConditions: Prisma.PostWhereInput[] = [];
  
  // Add search condition if provided
  if (search) {
    andConditions.push({
      OR: [
        // Search in title (case-insensitive)
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          }
        // Search in content (case-insensitive)
        {
            contains: search as string,
            mode: "insensitive",
          }
        },
        // Search in tags array
        {
            has: search as string,
          }
        }
      ]
    },)
  }
  // Filter by tags (post must have at least one of the specified tags)
  if (tags && tags.length > 0) {
    andConditions.push({
      tags: {
        hasSome: tags,
      }
    });
  }

  // Filter by featured status
  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured: isFeatured,
    });
  }

  // Filter by publication status
  if (status) {
    andConditions.push({
      status: status,
    });
  }

  // Filter by author
  if (authorId) {
    andConditions.push({
      authorId: authorId,
    });
  }

  // Execute main query with pagination and sorting
  const allPost = await prisma.post.findMany({
    skip,        // Skip records based on page and limit
    take: limit, // Take only this many records
    where: andConditions.length > 0 ? { AND: andConditions } : {},
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          comments: true,
        }
      }
    }
  });

  const total = await prisma.post.count({
    where: { AND: andConditions }
  });

  return {
    data: allPost,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
};

/**
 * Retrieve a specific post by ID and increment view count
 * 
 * Uses a database transaction to ensure atomicity:
 * 1. Increment post views
 * 2. Fetch post with nested approved comments (threaded replies)
 * 
 * @param postId - ID of the post to retrieve
 * @returns Post with nested comment threads and view count
 */
const getPostById = async (postId: string) => {
  console.log("getPostById called");
  return await prisma.$transaction(async (tx) => {
    // Increment the views counter
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        }
      }
    })
    
    // Fetch post with nested approved comments and replies
    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        // Get top-level comments (parentId: null) that are approved
        comments: {
          where: {
            parentId: null,
            STATUS: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            // Include replies to each top-level comment
            replies: {
              where: {
                STATUS: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                // Include nested replies (replies to replies)
                replies: {
                  where: {
                    STATUS: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                }
              }
            }
          }
        },
        // Include comment count
        _count: {
          select: {
            comments: true,
          }
        }
      }
    });
    return postData;
  })

}

/**
 * Retrieve all posts authored by a specific user
 * 
 * @param authorId - ID of the post author
 * @returns Array of user's posts with comment counts and total count
 */
const getMyPosts = async (authorId: string) => {
  // Verify user exists and is active
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    }
  })
  
  // Fetch user's posts sorted by creation date (newest first)
  const result = await prisma.post.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        }
      }
    }
  })
  
  // Get total post count for this author
  const total = await prisma.post.count({
    where: {
      authorId: authorId,
    },
  });

  return {
    data: result,
    total,
  }
}

/**
 * Update an existing post with authorization checks
 * 
 * Authorization rules:
 * - Post author can always update their own posts
 * - Only admins can change the "featured" status
 * - Only admins can update posts they don't own
 * 
 * @param postId - ID of the post to update
 * @param data - Partial post data to update
 * @param authorId - ID of the user requesting the update
 * @param isAdmin - Whether the user is an admin
 * @returns Updated post object
 * @throws Error if user is not authorized
 */
const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    }
  })

  if (!isAdmin && (postData.authorId !== authorId)) {
    throw new Error("You are not authorized to update this post");
  }
  
  // Non-admins cannot change featured status
  if (!isAdmin) {
    delete data.isFeatured
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: data,
  })
  return result;
}

/**
 * Delete a post with authorization checks
 * 
 * Authorization rules:
 * - Post author can delete their own posts
 * - Only admins can delete posts they don't own
 * 
 * @param postId - ID of the post to delete
 * @param authorId - ID of the user requesting deletion
 * @param isAdmin - Whether the user is an admin
 * @returns Deleted post object
 * @throws Error if user is not authorized
 */
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    }
  })

  if (!isAdmin && (postData.authorId !== authorId)) {
    throw new Error("You are not authorized to delete this post");
  }

  // Perform deletion
  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  })
  return result;
}

/**
 * Get platform statistics
 * 
 * Aggregates:
 * - Post counts by status (published, draft, archived)
 * - Comment counts (total and approved)
 * - User counts by role (admin, user)
 * - Total views across all posts
 * 
 * Uses database transaction for consistency
 * 
 * @returns Object containing all platform statistics
 */
const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    // Execute all count queries in parallel
    const [totalPosts, publlishedPosts, draftPosts, archivedPosts, totalComments, approvedComment, totalUsers, adminCount, userCount, totalViews] =
      await Promise.all([
        await tx.post.count(),
        await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
        await tx.post.count({ where: { status: PostStatus.DRAFT } }),
        await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
        await tx.comment.count(),
        await tx.comment.count({ where: { STATUS: CommentStatus.APPROVED } }),
        await tx.user.count(),
        await tx.user.count({ where: { role: "ADMIN" } }),
        await tx.user.count({ where: { role: "USER" } }),
        // Sum all post views
        await tx.post.aggregate({
          _sum: { views: true }
        })
      ])

    return {
      totalPosts,
      publlishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComment,
      totalUsers,
      adminCount,
      userCount,
      totalViews: totalViews._sum.views
    }
  })

}


// Export all service methods
export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};