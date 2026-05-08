/**\n * Post Controller Layer\n * \n * Handles HTTP request/response for post-related endpoints:\n * - Request validation and parsing\n * - Extracting query/path parameters\n * - Calling service layer methods\n * - Formatting and sending responses\n * - Error handling via next(error)\n */\n\nimport { NextFunction, Request, Response } from "express";\nimport { postService } from "./post.service";\nimport { PostStatus } from "@prisma/client";\nimport paginationSortingHelper from "../../helpers/paginationSortingHelper";\nimport { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user information found in request" });
        }
        console.log(req.user);
        const result = await postService.createPost(req.body, req.user.id);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}
const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query;
        console.log("search query:", search);
        const searchString = typeof search === "string" ? search : undefined;
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : undefined
            : undefined;

        const status = req.query.status as PostStatus | undefined;
        const authorId = req.query.authorId as string | undefined;



        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query)



        const result = await postService.getAllPosts({
            ...(searchString && { search: searchString }),
            tags: tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder
        });

        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { postId } = req.params;
        if (!postId) {
            throw new Error("Post ID is required");
        }
        const result = await postService.getPostById(postId as string);
        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        const result = await postService.getMyPosts(user?.id as string);

        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        const { postId } = req.params;
        const isAdmin = user.role === UserRole.ADMIN;
        console.log("user is: ", user)
        if (!postId) {
            throw new Error("Post ID is required");
        }
        const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin);
        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        const { postId } = req.params;
        const isAdmin = user.role === UserRole.ADMIN;
        // console.log("user is: ", user)
        if (!postId) {
            throw new Error("Post ID is required");
        }
        const result = await postService.deletePost(postId as string, user.id, isAdmin);
        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await postService.getStats();
        res.status(200).json({
            success: true,
            message: "Stats retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const postController = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStats,
};