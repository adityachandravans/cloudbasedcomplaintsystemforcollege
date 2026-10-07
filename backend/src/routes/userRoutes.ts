import { Router } from 'express';
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', authorize('admin', 'hod'), getUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
