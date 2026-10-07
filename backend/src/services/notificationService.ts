import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification.js';

export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: NotificationType,
  relatedComplaintId?: string | mongoose.Types.ObjectId
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedComplaint: relatedComplaintId,
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};
