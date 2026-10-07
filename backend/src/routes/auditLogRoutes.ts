import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin'), getAuditLogs);

export default router;
