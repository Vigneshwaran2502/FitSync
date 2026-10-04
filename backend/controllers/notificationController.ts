import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { unread } = req.query;
    const query: any = { userId: req.user._id };
    if (unread === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching notifications.' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.json({ message: 'Marked as read.', notification });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating notification.' });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error marking all as read.' });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, userId: req.user?._id });
    res.json({ message: 'Notification removed.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting notification.' });
  }
}

export async function broadcastAnnouncement(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can broadcast announcements.' });
    }

    const { title, message, audience = 'Everyone' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const userQuery: any = { status: 'active' };
    if (audience === 'Members') userQuery.role = 'member';
    if (audience === 'Trainers') userQuery.role = 'trainer';

    const recipients = await User.find(userQuery).select('_id');

    const notifs = recipients.map((r) => ({
      userId: r._id,
      title: title.trim(),
      message: message.trim(),
      type: 'announcement',
      isRead: false,
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.status(201).json({
      message: `Announcement broadcast successfully to ${notifs.length} recipients (${audience}).`,
      sentCount: notifs.length,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error broadcasting announcement.' });
  }
}
