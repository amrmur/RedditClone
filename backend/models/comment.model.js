import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    childComments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    upVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
