import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";

// TODO: test notification THIS IS UNTESTED CODE
export const createComment = async (req, res) => {
  try {
    const { postId, text, parentCommentId } = req.body;
    const creatorId = req.user._id.toString();

    if (!postId || !text) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const comment = new Comment({
      post: postId,
      creator: creatorId,
      text,
    });

    if (!parentCommentId) {
      const postCreator = await User.findById(post.creator);
      if (postCreator) {
        const notification = new Notification({
          from: creatorId,
          to: post.creator,
          type: "post reply",
        });
        const newNoti = await notification.save();

        postCreator.notifications.push(newNoti._id);
        await postCreator.save();
      } else {
        return res.status(404).json({ error: "Post creator not found" });
      }

      post.comments.push(comment._id);
      await post.save();
    } else {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }

      const parentCreator = await User.findById(parentComment.creator);
      if (!parentCreator) {
        return res
          .status(404)
          .json({ error: "Parent comment creator not found" });
      }

      const noti = new Notification({
        from: creatorId,
        to: parentComment.creator,
        type: "comment reply",
      });
      const newNoti = await noti.save();

      parentCreator.notifications.push(newNoti._id);
      await parentCreator.save();

      parentComment.childComments.push(comment);
      await parentComment.save();
    }

    user.comments.push(comment._id);
    await user.save();
    comment.save();

    res.status(201).json({ message: "Comment added successfully", comment });
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
