const express = require('express');
const { body } = require('express-validator');
const {
  evaluateCupping,
  getLotCuppingHistory,
  getAllCuppingSessions,
} = require('../controllers/cuppingController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.get('/', getAllCuppingSessions);
router.get('/lot/:lotId', getLotCuppingHistory);

router.post(
  '/',
  protect,
  authorize('qgrader', 'roaster', 'admin'),
  [
    body('lotId').notEmpty().withMessage('Target batch lot ID is required'),
    body('fragrance').isFloat({ min: 6, max: 10 }).withMessage('Fragrance must be between 6.0 and 10.0'),
    body('flavor').isFloat({ min: 6, max: 10 }).withMessage('Flavor must be between 6.0 and 10.0'),
    body('aftertaste').isFloat({ min: 6, max: 10 }).withMessage('Aftertaste must be between 6.0 and 10.0'),
    body('acidity').isFloat({ min: 6, max: 10 }).withMessage('Acidity must be between 6.0 and 10.0'),
    body('body').isFloat({ min: 6, max: 10 }).withMessage('Body must be between 6.0 and 10.0'),
    body('balance').isFloat({ min: 6, max: 10 }).withMessage('Balance must be between 6.0 and 10.0'),
    validateRequest,
  ],
  evaluateCupping
);

module.exports = router;
