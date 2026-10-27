const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getCertificateData,
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.get('/certificate/:id', getCertificateData);

router.use(protect);

router.get('/', getMyOrders);
router.get('/:id', getOrderById);

router.post(
  '/',
  [
    body('batchId').notEmpty().withMessage('Batch lot ID is required'),
    body('quantityKg').isNumeric().withMessage('Quantity must be numeric'),
    validateRequest,
  ],
  createOrder
);

router.patch(
  '/:id/status',
  [
    body('status').notEmpty().withMessage('New status is required'),
    validateRequest,
  ],
  updateOrderStatus
);

module.exports = router;
