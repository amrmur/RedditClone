//import notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    // TODO: add community id
    const { title, text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!text && !img) {
      return res.status(400).json({ error: "Text or image is required" });
    }
    // TODO: if no community id is provided, error

    // TODO: find community by id and check if it exists, error if it doesn't. Should only members be allowed to post? Talk to me about this.

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    // TODO: add community id to post model and save it here
    const newPost = new Post({
      user: userId,
      title,
      text,
      img,
    });

    await newPost.save();

    user.posts.push(newPost._id);
    await user.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createPost controller:", error);
  }
};

// TODO: delete post from community posts array as well
export const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);

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

    await Post.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(userId, { $pull: { posts: req.params.id } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deletePost controller:", error);
  }
};

/*
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in commentOnPost controller:", error);
  }
};
*/

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
