const express = require('express');
const { calculatePrice, saveCustomCake } = require('../controllers/customCakeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/calculate', calculatePrice);
router.post('/', protect, saveCustomCake);

module.exports = router;
