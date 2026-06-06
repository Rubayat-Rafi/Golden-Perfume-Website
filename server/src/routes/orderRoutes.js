import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, requirePermission } from '../middleware/protect.js';

const router = Router();

// /mine must come before /:id so Express doesn't treat "mine" as an id
router.get('/mine',       protect,                              getMyOrders);
router.get('/:id',        protect,                              getOrder);
router.patch('/:id/status', protect, requirePermission('orders'), updateOrderStatus);

router.post('/',          protect,                              createOrder);
router.get('/',           protect, requirePermission('orders'), getOrders);

export default router;
