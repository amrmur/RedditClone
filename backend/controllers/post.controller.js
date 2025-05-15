//import notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    const community = await Community.findById(communityId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!text && !img) {
      return res.status(400).json({ error: "Text or image is required" });
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      community: communityId,
      title,
      text,
      img,
    });

    await newPost.save();

    user.posts.push(newPost._id);
    await user.save();

    community.posts.push(newPost._id);
    await community.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createPost controller:", error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { communityId, postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(postId);

    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
    await Community.findByIdAndUpdate(communityId, {
      $pull: { posts: postId },
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deletePost controller:", error);
  }
};

export const downVotePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userDownVotedPost = post.downVotes.includes(userId);
    if (userDownVotedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { downVotes: userId } });
      const updatedPost = await Post.findById(postId);
      res
        .status(200)
        .json({ updatedPost, message: "Post un-down voted successfully" });
    } else {
      const userUpVotedPost = post.upVotes.includes(userId);
      if (userUpVotedPost) {
        await Post.updateOne({ _id: postId }, { $pull: { upVotes: userId } });
      }
      post.downVotes.push(userId);
      await post.save();
      const updatedPost = await Post.findById(postId);
      res
        .status(200)
        .json({ updatedPost, message: "Post down voted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in downVotePost controller:", error);
  }
};

export const upVotePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userUpVotedPost = post.upVotes.includes(userId);
    if (userUpVotedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { upVotes: userId } });
      const updatedPost = await Post.findById(postId);
      res
        .status(200)
        .json({ updatedPost, message: "Post un-up voted successfully" });
    } else {
      const userDownVotedPost = post.downVotes.includes(userId);
      if (userDownVotedPost) {
        await Post.updateOne({ _id: postId }, { $pull: { downVotes: userId } });
      }
      post.upVotes.push(userId);
      await post.save();
      const updatedPost = await Post.findById(postId);
      res
        .status(200)
        .json({ updatedPost, message: "Post up voted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in upVotePost controller:", error);
  }
};

export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("user")
      .populate("community")
      .populate("comments");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getPost controller:", error);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("community", "handle")
      .populate("user", "handle");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getAllPosts controller:", error);
  }
};
