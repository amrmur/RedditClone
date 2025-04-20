import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { handle, name, password } = req.body;

    if (!handle || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const sameHandleUser = await User.findOne({ handle });
    if (sameHandleUser) {
      return res.status(400).json({ message: "Handle already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      handle,
      name,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      const savedUser = await newUser.save();
      const { password, ...userWithoutPassword } = savedUser._doc;

      res.status(201).json({ user: userWithoutPassword });
    } else {
      res.status(400).json({ error: "Invalid user data" }); // inside model validation
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { handle, password } = req.body;
    if (!handle || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ handle });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    generateTokenAndSetCookie(user._id, res);
    const { password: userPassword, ...userWithoutPassword } = user._doc;

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
