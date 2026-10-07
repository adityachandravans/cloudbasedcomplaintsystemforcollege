import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  complaintId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  attachments?: { filename: string; originalName: string; url: string; mimeType: string }[];
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        mimeType: String,
      },
    ],
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
