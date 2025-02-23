import express from "express";
import {getRelatedPosts,createPost,deletePost,getPost,createComment,createLike,deleteComment} from "../controllers/post_controllers.js";
import protectRoute from "../middlewares/protectRoute.js";
const router=express.Router();

router.get("/",protectRoute,getRelatedPosts);
router.post("/create",protectRoute,createPost);
router.delete("/delete/:id",protectRoute,deletePost);
router.get("/:id",protectRoute,getPost);
router.post("/:id/comment",protectRoute,createComment);
router.post("/:id/like",protectRoute,createLike);
router.delete("/:id/comment/:commentId",protectRoute,deleteComment);

export default router