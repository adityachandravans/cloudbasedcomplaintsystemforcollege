import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  escalateComplaint,
  reopenComplaint,
  exportComplaintsCSV,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', upload.array('attachments', 5), createComplaint);
router.get('/', getComplaints);
router.get('/export/csv', authorize('admin', 'hod'), exportComplaintsCSV);
router.get('/:id', getComplaintById);
router.patch('/:id/status', upload.array('proofFiles', 5), updateComplaintStatus);
router.patch('/:id/assign', authorize('hod', 'admin'), assignComplaint);
router.patch('/:id/escalate', authorize('hod', 'admin'), escalateComplaint);
router.post('/:id/reopen', authorize('student'), reopenComplaint);

export default router;
