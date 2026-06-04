import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  me,
  wholesaleApply,
} from '../controllers/authController.js';
import { protect } from '../middleware/protect.js';

const router = Router();

router.post('/register',         register);
router.post('/login',            login);
router.post('/logout',           protect, logout);
router.post('/refresh',          refresh);
router.get('/me',                protect, me);
router.post('/wholesale-apply',  wholesaleApply);

export default router;