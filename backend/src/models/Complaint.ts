import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'reopened'
  | 'escalated';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IAttachment {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IHistoryItem {
  status: ComplaintStatus;
  updatedBy: mongoose.Types.ObjectId;
  updatedByName?: string;
  updatedByRole?: string;
  comment?: string;
  timestamp: Date;
}

export interface IComplaint extends Document {
  complaintId: string;
  title: string;
  description: string;
  category: string;
  department: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedDepartmentHead?: mongoose.Types.ObjectId;
  attachments: IAttachment[];
  history: IHistoryItem[];
  dueDate: Date;
  isOverdue: boolean;
  escalatedAt?: Date;
  escalatedReason?: string;
  resolvedAt?: Date;
  resolutionProof?: IAttachment[];
  resolutionNotes?: string;
  closedAt?: Date;
  reopenedCount: number;
  reopenedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  size: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

const HistorySchema = new Schema({
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'rejected',
      'reopened',
      'escalated',
    ],
    required: true,
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedByName: { type: String },
  updatedByRole: { type: String },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const ComplaintSchema: Schema = new Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'closed',
        'rejected',
        'reopened',
        'escalated',
      ],
      default: 'submitted',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedDepartmentHead: { type: Schema.Types.ObjectId, ref: 'User' },
    attachments: [AttachmentSchema],
    history: [HistorySchema],
    dueDate: { type: Date, required: true },
    isOverdue: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    escalatedReason: { type: String, default: '' },
    resolvedAt: { type: Date },
    resolutionProof: [AttachmentSchema],
    resolutionNotes: { type: String, default: '' },
    closedAt: { type: Date },
    reopenedCount: { type: Number, default: 0 },
    reopenedReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
