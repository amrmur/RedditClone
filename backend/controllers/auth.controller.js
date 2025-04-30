import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import User from "../models/user.model.js";

import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { handle, name, email, password } = req.body;

    if (!handle || !name || !email || !password) {
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

    const sameEmailUser = await User.findOne({ email });
    if (sameEmailUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      handle,
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      const savedUser = await newUser.save();
      const { password, ...userWithoutPassword } = savedUser._doc;

      // Send welcome email using SendGrid
      const msg = {
        to: [email],
        from: { email: process.env.EMAIL },
        subject: "Welcome to the Reddit Clone!",
        text: `Your account with the handle ${handle} has been created successfully!`,
        html: `<strong>Your account with the handle ${handle} has been created successfully!</strong>`,
      };

      try {
        await sgMail.send(msg);
      } catch (error) {
        try {
          await User.deleteOne({ email });
        } catch (error) {
          return res
            .status(500)
            .json({ error: "Error deleting user after email failure" });
        }

        return res.status(500).json({ error: "Error sending email" });
      }
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
    const { handleOrEmail, password } = req.body;
    if (!handleOrEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ handle: handleOrEmail });
    if (!user) {
      user = await User.findOne({ email: handleOrEmail });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
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

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    const generateResetToken = () => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
          if (err) {
            reject(err);
          }
          resolve(buffer.toString("hex"));
        });
      });
    };

    // In the resetPassword function:
    const token = await generateResetToken();
    if (!email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const msg = {
      to: [email],
      from: { email: process.env.EMAIL },
      subject: "Password reset for Reddit Clone",
      text: `You requested for a password reset.`,
      html: `
        <p>You requested a password reset</p>
        <h5>Click on this <a href="${process.env.RESET_PASSWORD_URL}/reset/${token}">link</a> to reset your password</h5>
        <p>This link will expire in 1 hour</p>
      `,
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      return res.status(500).json({ error: "Error sending email" });
    }
    return res.status(200).json({ message: "check your email" });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const newPassword = async (req, res) => {
  const { newPassword, sentToken } = req.body;
  if (!newPassword || !sentToken) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(404).json({ message: "Invalid token or token expired" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.expireToken = undefined;
  await user.save();
  res.status(200).json({ message: "password updated success" });
};
