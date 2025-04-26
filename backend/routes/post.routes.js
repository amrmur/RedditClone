import express from "express";

import {
  createPost,
  //commentOnPost,
  deletePost,
  downVotePost,
  upVotePost,
} from "../controllers/post.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.post("/upvote/:id", protectRoute, upVotePost);
router.post("/downvote/:id", protectRoute, downVotePost);
//router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/delete/:id", protectRoute, deletePost);

export default router;
