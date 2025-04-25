import express from "express";
import {
  createPost,
  getPosts,
  votePost,
  deletePost,
  editPost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
//router.get("/getPosts", getPosts);
//router.post("/votePost", votePost);
//router.delete("/deletePost", deletePost);
//router.patch("/editPost", editPost);

export default router;
