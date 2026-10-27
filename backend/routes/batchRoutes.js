const express = require('express');
const { body } = require('express-validator');
const {
  createBatchLot,
  getAllBatchLots,
  getBatchLotById,
  reserveBatchAllocation,
  releaseReservation,
  updateBatchLot,
} = require('../controllers/batchController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.get('/', getAllBatchLots);
router.get('/:id', getBatchLotById);

router.post(
  '/',
  protect,
  authorize('roaster', 'admin'),
  [
    body('lotNumber').notEmpty().withMessage('Unique lot number identifier is required'),
    body('name').notEmpty().withMessage('Batch / Lot name is required'),
    body('greenWeightKg').isNumeric().withMessage('Green weight must be a valid number'),
    body('roastedWeightKg').isNumeric().withMessage('Roasted weight must be a valid number'),
    body('pricePerKg').isNumeric().withMessage('Price per kg must be a valid number'),
    validateRequest,
  ],
  createBatchLot
);

router.put('/:id', protect, updateBatchLot);

router.post(
  '/:id/reserve',
  protect,
  [
    body('amountKg').isNumeric().withMessage('Reservation quantity in kg must be numeric'),
    validateRequest,
  ],
  reserveBatchAllocation
);

router.post('/:id/release-reservation', protect, releaseReservation);

module.exports = router;
