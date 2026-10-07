import { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

    return res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notification.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ success: true, notification });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await Notification.updateMany({ userId: user._id, isRead: false }, { $set: { isRead: true } });

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
