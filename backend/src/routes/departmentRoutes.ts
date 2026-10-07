import { Router } from 'express';
import {
  getDepartments,
  getAllDepartmentsAdmin,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/public', getDepartments); // Open for register select dropdown
router.get('/', protect, getDepartments);
router.get('/admin', protect, authorize('admin'), getAllDepartmentsAdmin);
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

export default router;
