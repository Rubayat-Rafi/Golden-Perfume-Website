import { Router } from 'express';
import {
  getStats, getUsers, getUserDetail, updateUserRole, deleteUser, rejectDeletion,
  getStaff, createStaff, updateStaff, deleteStaff,
} from '../controllers/adminController.js';
import { protect, requireRole, requirePermission } from '../middleware/protect.js';

const router = Router();

// Dashboard + customers — accessible to admins and permitted staff
router.get('/stats',     protect, requirePermission('dashboard'), getStats);
router.get('/users',     protect, requirePermission('customers'), getUsers);
router.get('/users/:id', protect, requirePermission('customers'), getUserDetail);
router.delete('/users/:id', protect, requireRole('admin'), deleteUser);
router.patch('/users/:id/deletion-reject', protect, requireRole('admin'), rejectDeletion);

// Staff & role management — admin only
router.get('/staff',            protect, requireRole('admin'), getStaff);
router.post('/staff',           protect, requireRole('admin'), createStaff);
router.patch('/staff/:id',      protect, requireRole('admin'), updateStaff);
router.delete('/staff/:id',     protect, requireRole('admin'), deleteStaff);
router.patch('/users/:id/role', protect, requireRole('admin'), updateUserRole);

export default router;
