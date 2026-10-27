const CustomCake = require('../models/CustomCake');
const { calculateCakePrice, SIZE_PRICING, SPONGE_ADDONS, FROSTING_ADDONS, DIETARY_ADDONS } = require('../utils/cakePricing');

// @desc    Get cake builder options & dynamic price calculation
// @route   POST /api/custom-cakes/calculate
// @access  Public
const calculatePrice = async (req, res, next) => {
  try {
    const config = req.body;
    const breakdown = calculateCakePrice(config);

    res.status(200).json({
      success: true,
      breakdown,
      options: {
        sizes: SIZE_PRICING,
        sponges: SPONGE_ADDONS,
        frostings: FROSTING_ADDONS,
        dietary: DIETARY_ADDONS,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save custom cake design
// @route   POST /api/custom-cakes
// @access  Private
const saveCustomCake = async (req, res, next) => {
  try {
    const { size, sponge, frosting, dietary, customMessage, decorTheme } = req.body;
    const breakdown = calculateCakePrice({ size, sponge, frosting, dietary, customMessage });

    const cake = await CustomCake.create({
      customer: req.user._id,
      size,
      sponge,
      frosting,
      dietary,
      customMessage,
      decorTheme: decorTheme || 'Gold Leaf & Caramel Drip',
      totalPrice: breakdown.totalPrice,
      breakdown,
    });

    res.status(201).json({
      success: true,
      message: 'Custom cake design saved to your studio creations',
      cake,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculatePrice,
  saveCustomCake,
};
