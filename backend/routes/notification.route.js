import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserNotifications,
  deleteUserNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get", protectRoute, getUserNotifications);
router.delete("/delete", protectRoute, deleteUserNotifications);

export default router;
