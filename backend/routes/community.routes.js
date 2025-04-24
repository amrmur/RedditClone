import express from "express";
import {
  createCommunity,
  editDescription,
  followCommunity,
} from "../controllers/community.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/createCommunity", protectRoute, createCommunity);
router.patch("/editDescription", protectRoute, editDescription);
router.put("/followCommunity", protectRoute, followCommunity);

export default router;
