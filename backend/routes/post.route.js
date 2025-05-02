import express from "express";

import {
  createPost,
  getPost,
  deletePost,
  downVotePost,
  upVotePost,
} from "../controllers/post.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create/:communityId", protectRoute, createPost);
router.post("/upvote/:id", protectRoute, upVotePost);
router.post("/downvote/:id", protectRoute, downVotePost);
router.get("/:id", protectRoute, getPost);
router.delete("/delete/:postId/:communityId", protectRoute, deletePost);

export default router;
