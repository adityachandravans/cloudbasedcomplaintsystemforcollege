import { Response } from 'express';
import { Comment } from '../models/Comment.js';
import { Complaint } from '../models/Complaint.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { StorageService } from '../services/storageService.js';
import { createNotification } from '../services/notificationService.js';

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId } = req.params;

    const query: any = { complaintId };
    if (req.user?.role === 'student') {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name role profileImage')
      .sort({ createdAt: 1 });

    return res.json({ success: true, count: comments.length, comments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { complaintId } = req.params;
    const { message, isInternal } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const attachments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        attachments.push(StorageService.formatFile(file));
      });
    }

    const comment = await Comment.create({
      complaintId: complaint._id,
      userId: user._id,
      message,
      attachments,
      isInternal: user.role !== 'student' && (isInternal === true || isInternal === 'true'),
    });

    await comment.populate('userId', 'name role profileImage');

    // Notify student if comment is added by staff/hod/admin and not internal
    if (user.role !== 'student' && !comment.isInternal) {
      await createNotification(
        complaint.createdBy,
        'New Comment on Complaint',
        `${user.name} commented on your complaint ${complaint.complaintId}: "${message.substring(0, 50)}..."`,
        'comment',
        complaint._id
      );
    } else if (user.role === 'student' && complaint.assignedTo) {
      // Notify assigned staff
      await createNotification(
        complaint.assignedTo,
        'Student Replied on Complaint',
        `Student commented on complaint ${complaint.complaintId}: "${message.substring(0, 50)}..."`,
        'comment',
        complaint._id
      );
    }

    return res.status(201).json({ success: true, comment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
