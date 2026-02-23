import { CommentStatus, Post, PostStatus, Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
}

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

  const andConditions: Prisma.PostWhereInput[] = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          }
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          }
        },
        {
          tags: {
            has: search as string,
          }
        }
      ]
    },)
  }
  if (tags && tags.length > 0) {
    andConditions.push({
      tags: {
        hasSome: tags,
      }
    });
  }

  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured: isFeatured,
    });
  }

  if (status) {
    andConditions.push({
      status: status,
    });
  }

  if (authorId) {
    andConditions.push({
      authorId: authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    skip,
    take: limit,
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

const getPostById = async (postId: string) => {
  console.log("getPostById called");
  return await prisma.$transaction(async (tx) => {
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
    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            STATUS: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                STATUS: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
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

const getMyPosts = async (authorId: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    }
  })
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
  // count method simple ebong efficient
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

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  })
  return result;
}

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
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

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};