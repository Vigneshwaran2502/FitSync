import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
async function getNotifications(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const { unread } = req.query;
    const query = { userId: req.user._id };
    if (unread === "true") {
      query.isRead = false;
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching notifications." });
  }
}
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json({ message: "Marked as read.", notification });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating notification." });
  }
}
async function markAllAsRead(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error marking all as read." });
  }
}
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, userId: req.user?._id });
    res.json({ message: "Notification removed." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error deleting notification." });
  }
}
async function broadcastAnnouncement(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can broadcast announcements." });
    }
    const { title, message, audience = "Everyone" } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }
    const userQuery = { status: "active" };
    if (audience === "Members") userQuery.role = "member";
    if (audience === "Trainers") userQuery.role = "trainer";
    const recipients = await User.find(userQuery).select("_id");
    const notifs = recipients.map((r) => ({
      userId: r._id,
      title: title.trim(),
      message: message.trim(),
      type: "announcement",
      isRead: false
    }));
    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }
    res.status(201).json({
      message: `Announcement broadcast successfully to ${notifs.length} recipients (${audience}).`,
      sentCount: notifs.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error broadcasting announcement." });
  }
}
export {
  broadcastAnnouncement,
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead
};
