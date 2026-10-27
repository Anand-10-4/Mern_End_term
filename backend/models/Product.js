const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Baked item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['breads', 'croissants_pastries', 'tarts_cakes', 'savory_bakes'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [1, 'Price must be at least $1'],
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: [{ type: String }],
    dailyStock: {
      type: Number,
      required: true,
      min: 0,
      default: 20,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 20,
    },
    dietaryTags: [{ type: String }], // 'Vegetarian', 'Vegan', 'Eggless', 'Gluten-Free', 'Nut-Free'
    imageEmoji: {
      type: String,
      default: '🥐',
    },
    freshnessHours: {
      type: Number,
      default: 6, // Baked fresh every 6 hours
    },
    bakeTime: {
      type: String,
      default: '6:30 AM Daily',
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewCount: {
      type: Number,
      default: 28,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
