const mongoose = require('mongoose');

const customCakeSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    size: {
      type: String,
      enum: ['mini_4inch', 'standard_6inch', 'party_8inch', 'celebration_2tier'],
      default: 'standard_6inch',
    },
    sponge: {
      type: String,
      enum: ['vanilla_bean', 'belgian_chocolate', 'red_velvet', 'spiced_carrot'],
      default: 'vanilla_bean',
    },
    frosting: {
      type: String,
      enum: ['honey_buttercream', 'salted_caramel', 'chocolate_fudge', 'vanilla_chantilly'],
      default: 'honey_buttercream',
    },
    dietary: {
      type: String,
      enum: ['standard', 'eggless', 'gluten_free', 'vegan'],
      default: 'standard',
    },
    customMessage: {
      type: String,
      default: 'Happy Birthday!',
      maxlength: 50,
    },
    decorTheme: {
      type: String,
      default: 'Gold Leaf & Toasted Honey Caramel Drip',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    breakdown: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomCake', customCakeSchema);
