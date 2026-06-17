import { Router } from 'express';
import {
  getStats, getRevenueSeries, getUsers, getUserDetail, updateUserRole, deleteUser, rejectDeletion,
  getStaff, createStaff, updateStaff, deleteStaff,
} from '../controllers/adminController.js';
import {
  getAuditLogs, getAuditSettings, updateAuditSettings, deleteAuditLog, purgeAuditLogs,
} from '../controllers/auditController.js';
import { protect, requireRole, requirePermission } from '../middleware/protect.js';

const router = Router();

// Dashboard + customers — accessible to admins and permitted staff
router.get('/stats',     protect, requirePermission('dashboard'), getStats);
router.get('/revenue',   protect, requirePermission('dashboard'), getRevenueSeries);
router.get('/users',     protect, requirePermission('customers'), getUsers);
router.get('/users/:id', protect, requirePermission('customers'), getUserDetail);
router.delete('/users/:id', protect, requireRole('admin'), deleteUser);
router.patch('/users/:id/deletion-reject', protect, requireRole('admin'), rejectDeletion);

// Activity history — admin only
router.get('/audit',          protect, requireRole('admin'), getAuditLogs);
router.get('/audit/settings', protect, requireRole('admin'), getAuditSettings);
router.put('/audit/settings', protect, requireRole('admin'), updateAuditSettings);
router.post('/audit/purge',   protect, requireRole('admin'), purgeAuditLogs);
router.delete('/audit/:id',   protect, requireRole('admin'), deleteAuditLog);

// Staff & role management — admin only
router.get('/staff',            protect, requireRole('admin'), getStaff);
router.post('/staff',           protect, requireRole('admin'), createStaff);
router.patch('/staff/:id',      protect, requireRole('admin'), updateStaff);
router.delete('/staff/:id',     protect, requireRole('admin'), deleteStaff);
router.patch('/users/:id/role', protect, requireRole('admin'), updateUserRole);

export default router;
