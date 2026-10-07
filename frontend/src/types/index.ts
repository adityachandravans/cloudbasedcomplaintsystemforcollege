export type UserRole = 'student' | 'staff' | 'hod' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: string;
}

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

export interface Attachment {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
}

export interface HistoryItem {
  _id?: string;
  status: ComplaintStatus;
  updatedBy: {
    _id?: string;
    name: string;
    role: string;
  } | string;
  updatedByName?: string;
  updatedByRole?: string;
  comment?: string;
  timestamp: string;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  department: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdBy: User;
  assignedTo?: User;
  attachments: Attachment[];
  history: HistoryItem[];
  dueDate: string;
  isOverdue: boolean;
  escalatedAt?: string;
  escalatedReason?: string;
  resolvedAt?: string;
  resolutionProof?: Attachment[];
  resolutionNotes?: string;
  closedAt?: string;
  reopenedCount: number;
  reopenedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  complaintId: string;
  userId: {
    _id: string;
    name: string;
    role: string;
    profileImage?: string;
  };
  message: string;
  attachments?: Attachment[];
  isInternal: boolean;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'submission' | 'assignment' | 'status_change' | 'comment' | 'resolution' | 'reopened' | 'rejection' | 'escalation';
  isRead: boolean;
  relatedComplaint?: string;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  head?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  department?: string;
  isActive: boolean;
}

export interface Feedback {
  _id: string;
  complaintId: string;
  studentId: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface AnalyticsStats {
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  totalHODs: number;
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  escalatedComplaints: number;
  overdueComplaints: number;
  resolutionRate: number;
  avgResolutionHours: number;
  avgRating: number;
  totalReviews: number;
}
