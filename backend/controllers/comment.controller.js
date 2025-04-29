import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";

// What this does:
//   1. save comment
//   2. save notification
//   3. push notification to contentOwner
//   4. push comment to post/parentComment of contentOwner
//   5. Push comment to user

export const createComment = async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    let { postId } = req.body;
    const userId = req.user._id;

    let contentOwnerId;
    let contentType;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      postId = parentComment.post;
      contentOwnerId = parentComment.creator;
      contentType = "comment reply";
    } else {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      contentType = "post reply";
      contentOwnerId = post.user;
    }

    const comment = new Comment({
      post: postId,
      creator: userId,
      text,
    });

    const savedComment = await comment.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.comments.push(savedComment._id);
    await user.save();

    if (!parentCommentId) {
      const post = await Post.findById(postId);
      post.comments.push(savedComment._id);
      await post.save();
    } else {
      const parentComment = await Comment.findById(parentCommentId);
      parentComment.childComments.push(savedComment._id);
      await parentComment.save();
    }

    const contentOwnerUser = await User.findById(contentOwnerId);
    if (contentOwnerUser && contentOwnerId.toString() !== userId.toString()) {
      const newNotification = new Notification({
        to: contentOwnerId,
        from: userId,
        type: contentType,
      });
      await newNotification.save();

      contentOwnerUser.notifications.push(newNotification._id);
      await contentOwnerUser.save();
    }

    return res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createComment controller:", error);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.creator.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }
    comment.text = "[deleted]";

    await User.findByIdAndUpdate(comment.creator, {
      $pull: { comments: id },
    });
    comment.creator = undefined;
    await comment.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteComment controller:", error);
  }
};

export const upVoteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userUpVotedComment = comment.upVotes.includes(userId);
    if (userUpVotedComment) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { upVotes: userId },
      });
      const updatedComment = await Comment.findById(commentId);
      res
        .status(200)
        .json({ updatedComment, message: "Comment un-up voted successfully" });
    } else {
      const userDownVotedComment = comment.downVotes.includes(userId);
      console.log(userDownVotedComment);
      if (userDownVotedComment) {
        comment.downVotes = comment.downVotes.filter(
          (vote) => vote.toString() !== userId.toString()
        );
      }
      comment.upVotes.push(userId);
      await comment.save();
      res
        .status(200)
        .json({ comment, message: "Comment up voted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in upVoteComment controller:", error);
  }
};

export const downVoteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userDownVotedComment = comment.downVotes.includes(userId);
    if (userDownVotedComment) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { downVotes: userId },
      });
      const updatedComment = await Comment.findById(commentId);
      res.status(200).json({
        updatedComment,
        message: "Comment un-down voted successfully",
      });
    } else {
      const userUpVotedComment = comment.upVotes.includes(userId);
      if (userUpVotedComment) {
        comment.upVotes = comment.upVotes.filter(
          (vote) => vote.toString() !== userId.toString()
        );
      }
      comment.downVotes.push(userId);
      await comment.save();
      res
        .status(200)
        .json({ comment, message: "Post down voted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in downVoteComment controller:", error);
  }
};
