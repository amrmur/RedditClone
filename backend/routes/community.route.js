import express from "express";
import {
  createCommunity,
  deleteCommunity,
  editDescription,
  followCommunity,
  getCommunity,
  getCommunityPosts,
} from "../controllers/community.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createCommunity);
router.patch("/editDescription", protectRoute, editDescription);
router.put("/follow", protectRoute, followCommunity);
router.get("/get/:communityId", protectRoute, getCommunity);
router.get("/getPosts/:id", protectRoute, getCommunityPosts);
router.delete("/delete/:communityId", protectRoute, deleteCommunity);

export default router;
