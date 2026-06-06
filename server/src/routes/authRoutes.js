import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
  wholesaleApply,
  changePassword,
  requestDeletion,
  cancelDeletion,
} from '../controllers/authController.js';
import { protect } from '../middleware/protect.js';

const router = Router();

router.post('/register',         register);
router.post('/login',            login);
router.post('/logout',           protect, logout);
router.post('/refresh',          refresh);
router.get('/me',                protect, me);
router.post('/wholesale-apply',  wholesaleApply);

router.patch('/change-password', protect, changePassword);
router.post('/request-deletion', protect, requestDeletion);
router.post('/cancel-deletion',  protect, cancelDeletion);

export default router;
