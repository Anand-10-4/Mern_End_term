const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getAllUsers);

module.exports = router;
