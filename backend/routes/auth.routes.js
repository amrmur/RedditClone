import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  resetPassword,
  newPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.post("/resetPassword", resetPassword);
router.post("/newPassword", newPassword);

export default router;
