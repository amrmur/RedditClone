import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

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
