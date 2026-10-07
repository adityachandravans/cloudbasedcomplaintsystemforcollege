import { Router } from 'express';
import { submitFeedback, getFeedbackForComplaint } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', authorize('student'), submitFeedback);
router.get('/:complaintId', getFeedbackForComplaint);

export default router;
