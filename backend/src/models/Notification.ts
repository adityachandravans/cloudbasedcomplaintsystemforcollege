import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'submission'
  | 'assignment'
  | 'status_change'
  | 'comment'
  | 'resolution'
  | 'reopened'
  | 'rejection'
  | 'escalation';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedComplaint?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'submission',
        'assignment',
        'status_change',
        'comment',
        'resolution',
        'reopened',
        'rejection',
        'escalation',
      ],
      default: 'status_change',
    },
    isRead: { type: Boolean, default: false },
    relatedComplaint: { type: Schema.Types.ObjectId, ref: 'Complaint' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
