import express, { NextFunction, Request, Response } from 'express';
import { postController } from './post.controller';
import auth, { UserRole } from '../../middlewares/auth';



const router = express.Router();

console.log("post.router loaded");



router.post('/', auth(UserRole.USER, UserRole.ADMIN), postController.createPost);

router.get("/my-posts", auth(UserRole.USER, UserRole.ADMIN), postController.getMyPosts);

router.get("/", postController.getAllPosts);

router.get("/:postId", postController.getPostById);

router.patch("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);

router.delete("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.deletePost);

export const postRouter = router;