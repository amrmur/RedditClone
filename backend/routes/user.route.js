import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  updateUserProfile,
  getUserComments,
  getUserCommunities,
  getUserPosts,
  getUserNotifications,
  deleteUserNotifications,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/comments/:id", protectRoute, getUserComments);
router.get("/communities/:id", protectRoute, getUserCommunities);
router.get("/posts/:id", protectRoute, getUserPosts);
router.get("/notifications", protectRoute, getUserNotifications);
router.delete("/deleteNotifications", protectRoute, deleteUserNotifications);
router.put("/update", protectRoute, updateUserProfile);

export default router;
