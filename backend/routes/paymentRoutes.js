const express = require('express');
const {
  getConfig,
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/config', getConfig);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentAndCreateOrder);

module.exports = router;
