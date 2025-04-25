import express from "express";
import {
  createCommunity,
  deleteCommunity,
  editDescription,
  followCommunity,
  getCommunity,
} from "../controllers/community.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/createCommunity", protectRoute, createCommunity);
router.patch("/editDescription", protectRoute, editDescription);
router.put("/followCommunity", protectRoute, followCommunity);
router.get("/getCommunity/:communityId", protectRoute, getCommunity);
router.delete("/deleteCommunity/:communityId", protectRoute, deleteCommunity);

export default router;
