const express = require('express');
const { body } = require('express-validator');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductStock,
  restockAllDaily,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  authorize('baker', 'admin'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be numeric'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest,
  ],
  createProduct
);

router.patch('/:id/stock', protect, authorize('baker', 'admin'), updateProductStock);
router.post('/morning-restock', protect, authorize('baker', 'admin'), restockAllDaily);

module.exports = router;
