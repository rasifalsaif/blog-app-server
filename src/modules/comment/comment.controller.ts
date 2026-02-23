import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { CommentStatus } from "@prisma/client";



const createComment = async (req: Request, res: Response) => {

    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await commentService.createComment(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create comment",
            error: error
        })
    }

}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const result = await commentService.getCommentById(commentId as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: "Failed to get comment by id",
            error: error
        })
    }
}

const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params;
        const result = await commentService.getCommentByAuthor(authorId as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: "Failed to get comment by author",
            error: error
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.deleteComment(commentId as string, user?.id as string);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete comment",
            error: error
        })
    }
}

const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string)
        res.status(200).json(result)
    } catch (e) {
        console.log(e)
        res.status(400).json({
            error: "Comment update failed!",
            details: e
        })
    }
}

const moderateComment = async (req: Request, res: Response) => {
    try {
        // const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.moderateComment(commentId as string, req.body)
        res.status(200).json(result)
    } catch (e: any) {
        // console.log(e)
        res.status(400).json({
            error: e.message || "Comment moderation failed!",
            details: e
        })
    }
}

export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    moderateComment,
}