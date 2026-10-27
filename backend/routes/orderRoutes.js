const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getKitchenOrders,
  updateOrderStatus,
  getOrderById,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Cart items must not be empty'),
    validateRequest,
  ],
  createOrder
);

router.get('/my-orders', getMyOrders);
router.get('/kitchen', authorize('baker', 'admin'), getKitchenOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
