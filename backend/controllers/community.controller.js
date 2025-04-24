import Community from "../models/community.model.js";
import User from "../models/user.model.js";

export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.toLowerCase() !== name) {
      return res
        .status(400)
        .json({ message: "Community name must be lowercase" });
    }

    const existingCommunity = await Community.findOne({ handle: name });
    if (existingCommunity) {
      return res.status(400).json({ message: "Community already exists" });
    }

    // TODO: is this necessary?
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCommunity = new Community({
      handle: name,
      description,
      creator: req.user._id,
      members: [req.user._id],
    });

    const savedCommunity = await newCommunity.save();
    if (!savedCommunity) {
      return res.status(500).json({ message: "Failed to create community" });
    }

    user.communities.push(savedCommunity._id);
    await user.save();

    res.status(201).json({
      message: "Community created successfully",
      community: savedCommunity,
    });
  } catch (error) {
    console.log("Error in createCommunity controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO: creator of community can edit description only
export const editDescription = async (req, res) => {
  try {
    const { communityId, newDescription } = req.body;
    if (!communityId || !newDescription) {
      return res
        .status(400)
        .json({ message: "Community ID and new description are required" });
    }
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    community.description = newDescription;
    const updatedCommunity = await community.save();
    if (!updatedCommunity) {
      return res
        .status(500)
        .json({ message: "Failed to update community description" });
    }
    res.status(200).json({
      message: "Community description updated successfully",
      community: updatedCommunity,
    });
  } catch (error) {
    console.log("Error in editDescription controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (community.members.includes(req.user._id)) {
      community.members = community.members.filter(
        (member) => member.toString() !== req.user._id.toString()
      );
      await community.save();
      user.communities = user.communities.filter(
        (comm) => comm.toString() !== communityId.toString()
      );
      await user.save();
      res.status(200).json({ message: "Unfollowed community successfully" });
    } else {
      community.members.push(req.user._id);
      await community.save();
      user.communities.push(communityId);
      await user.save();
      res.status(200).json({ message: "Followed community successfully" });
    }
  } catch (error) {
    console.log("Error in followCommunity controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO: test this
export const getCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.status(200).json({ community });
  } catch (error) {
    console.log("Error in getCommunity controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
