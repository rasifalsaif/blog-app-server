import { CommentStatus } from "@prisma/client"
import { prisma } from "../../lib/prisma"


const createComment = async (payload: {
    content: string,
    authorId: string,
    postId: string,
    parentId?: string,
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })
    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }
    const result = await prisma.comment.create({
        data: payload
    })
    return result;
}

const getCommentById = async (commentId: string) => {
    const result = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true,
                }
            }
        }
    })
    return result;
}

const getCommentByAuthor = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId: authorId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
    return result;
}

const deleteComment = async (commentId: string, userId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: userId
        },
        select: {
            id: true
        }
    })
    if (!commentData) {
        throw new Error("Your provided data input is invalid")
    }
    const result = await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })
    return result;
}
const updateComment = async (commentId: string, data: { content?: string, STATUS?: CommentStatus }, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Your provided input is invalid!")
    }

    return await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })
}
const moderateComment = async (commentId: string, data: { STATUS: CommentStatus }) => {
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        },
        select: {
            id: true,
            STATUS: true
        }
    })
    if (commentData.STATUS === data.STATUS) {
        throw new Error("Your provided status is same as current status")
    }
    return await prisma.comment.update({
        where: {
            id: commentId
        },
        data
    })
}

export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    moderateComment,
}
