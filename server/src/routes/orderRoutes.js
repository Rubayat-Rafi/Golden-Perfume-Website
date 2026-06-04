import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/protect.js';

const router = Router();

// /mine must come before /:id so Express doesn't treat "mine" as an id
router.get('/mine',       protect,                              getMyOrders);
router.get('/:id',        protect,                              getOrder);
router.patch('/:id/status', protect, requireRole('admin', 'staff'), updateOrderStatus);

router.post('/',          protect,                              createOrder);
router.get('/',           protect, requireRole('admin'),        getOrders);

export default router;
