import { Router } from 'express';
import { getComments, addComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/complaints/:complaintId/comments', getComments);
router.post('/complaints/:complaintId/comments', upload.array('attachments', 3), addComment);

export default router;
