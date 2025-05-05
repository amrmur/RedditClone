import express from "express";
import {
  createCommunity,
  deleteCommunity,
  editDescription,
  followCommunity,
  getCommunity,
  searchCommunities,
} from "../controllers/community.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createCommunity);
router.patch("/editDescription", protectRoute, editDescription);
router.put("/follow", protectRoute, followCommunity);
router.get("/:handle", protectRoute, getCommunity);

router.delete("/delete/:communityId", protectRoute, deleteCommunity);
router.post("/search", protectRoute, searchCommunities);

export default router;
