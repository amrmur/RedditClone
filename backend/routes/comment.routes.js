import express from "express";

import {
  createComment,
  deleteComment,
  downVoteComment,
  upVoteComment,
} from "../controllers/comment.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createComment);
router.post("/upvote/:id", protectRoute, upVoteComment);
router.post("/downvote/:id", protectRoute, downVoteComment);
router.delete("/delete/:id", protectRoute, deleteComment);

export default router;
