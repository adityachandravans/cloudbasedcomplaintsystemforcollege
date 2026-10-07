import { Response } from 'express';
import { Feedback } from '../models/Feedback.js';
import { Complaint } from '../models/Complaint.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { complaintId, rating, comment } = req.body;

    if (!complaintId || !rating) {
      return res.status(400).json({ success: false, message: 'Complaint ID and rating (1-5) are required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (complaint.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the complaint submitter can provide feedback' });
    }

    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved or closed complaints' });
    }

    const existingFeedback = await Feedback.findOne({ complaintId });
    if (existingFeedback) {
      existingFeedback.rating = rating;
      existingFeedback.comment = comment || '';
      await existingFeedback.save();
      return res.json({ success: true, feedback: existingFeedback, message: 'Feedback updated' });
    }

    const feedback = await Feedback.create({
      complaintId: complaint._id,
      studentId: user._id,
      rating,
      comment: comment || '',
    });

    return res.status(201).json({ success: true, feedback, message: 'Thank you for your feedback!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedbackForComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId } = req.params;
    const feedback = await Feedback.findOne({ complaintId }).populate('studentId', 'name email');
    return res.json({ success: true, feedback });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
