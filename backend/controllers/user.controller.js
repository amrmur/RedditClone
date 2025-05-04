import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const username = req.params?.username;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await User.findOne({ handle: username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { handle, email, name, oldPassword, newPassword } = req.body;
    let { avatar } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if ((!newPassword && oldPassword) || (newPassword && !oldPassword)) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // TODO: this can only be tested after front end upload image is implemented
    if (avatar) {
      const uploadedResponse = await cloudinary.uploader.upload(avatar);
      avatar = uploadedResponse.secure_url;
    }

    if (handle) {
      const existingUser = await User.findOne({ handle });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Handle already exists" });
      }
    }
    if (email) {
      const existingEmailUser = await User.findOne({ email });
      if (
        existingEmailUser &&
        existingEmailUser._id.toString() !== userId.toString()
      ) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.handle = handle || user.handle;
    user.email = email || user.email;

    await user.save();
    return res.status(200).json({ message: "user updated successfully" });
  } catch (error) {
    console.log("Error in updateUserProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("comments");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ comments: user.comments });
  } catch (error) {
    console.log("Error in getUserComments controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserCommunities = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("communities");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ communities: user.communities });
  } catch (error) {
    console.log("Error in getUserCommunities controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("posts");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ posts: user.posts });
  } catch (error) {
    console.log("Error in getUserPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "notifications",
      populate: {
        path: "from",
        select: "handle avatar _id",
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update notifications to isRead: true
    await Notification.updateMany({ to: userId, read: false }, { read: true });

    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.log("Error in getUserNotifications controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });
    await User.findByIdAndUpdate(userId, { $set: { notifications: [] } });

    res
      .status(200)
      .json({ message: "User notifications deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUserNotifications controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = req.body?.query;
    if (query?.length === 0) {
      return res.status(200).json([]);
    }
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    let userPattern = new RegExp(query, "i");
    const results = await User.find({
      handle: { $regex: userPattern },
    }).select("_id handle");
    return res.status(200).json(results);
  } catch (error) {
    console.log("Error in searchUsers controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
