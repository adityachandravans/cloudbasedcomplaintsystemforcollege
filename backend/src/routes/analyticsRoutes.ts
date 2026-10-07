import { Router } from 'express';
import { getOverviewAnalytics, getStaffWorkload } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/overview', authorize('admin', 'hod', 'staff'), getOverviewAnalytics);
router.get('/staff-workload', authorize('admin', 'hod'), getStaffWorkload);

export default router;
