/**
 * GoldenCrust Custom Cake Pricing Calculator
 * Computes transparent, dynamic prices based on tier size, sponge, fillings, dietary options, and decor.
 */

const SIZE_PRICING = {
  'mini_4inch': { basePrice: 18, name: 'Mini Petite (4-inch)', serves: '1-2 people' },
  'standard_6inch': { basePrice: 34, name: 'Standard Celebration (6-inch)', serves: '6-8 people' },
  'party_8inch': { basePrice: 48, name: 'Grand Party (8-inch)', serves: '12-16 people' },
  'celebration_2tier': { basePrice: 85, name: 'Royal Two-Tier (6" + 8")', serves: '25-30 people' },
};

const SPONGE_ADDONS = {
  'vanilla_bean': { addon: 0, name: 'Madagascar Vanilla Bean' },
  'belgian_chocolate': { addon: 3, name: 'Rich Belgian Dark Chocolate' },
  'red_velvet': { addon: 4, name: 'Classic Red Velvet' },
  'spiced_carrot': { addon: 4, name: 'Spiced Carrot & Toasted Walnut' },
};

const FROSTING_ADDONS = {
  'honey_buttercream': { addon: 0, name: 'Golden Honey Buttercream' },
  'salted_caramel': { addon: 3, name: 'Salted Caramel Ganache' },
  'chocolate_fudge': { addon: 4, name: 'Whipped Belgian Dark Fudge' },
  'vanilla_chantilly': { addon: 2, name: 'Vanilla Bean Chantilly Cream' },
};

const DIETARY_ADDONS = {
  'standard': 0,
  'eggless': 3,
  'gluten_free': 5,
  'vegan': 5,
};

function calculateCakePrice(config = {}) {
  const sizeKey = config.size || 'standard_6inch';
  const sizeInfo = SIZE_PRICING[sizeKey] || SIZE_PRICING['standard_6inch'];

  const spongeKey = config.sponge || 'vanilla_bean';
  const spongeInfo = SPONGE_ADDONS[spongeKey] || SPONGE_ADDONS['vanilla_bean'];

  const frostingKey = config.frosting || 'honey_buttercream';
  const frostingInfo = FROSTING_ADDONS[frostingKey] || FROSTING_ADDONS['honey_buttercream'];

  const dietaryKey = config.dietary || 'standard';
  const dietaryAddon = DIETARY_ADDONS[dietaryKey] || 0;

  const customMessage = (config.customMessage || '').trim();
  const messageFee = customMessage.length > 25 ? 2 : 0;

  const total = sizeInfo.basePrice + spongeInfo.addon + frostingInfo.addon + dietaryAddon + messageFee;

  return {
    basePrice: sizeInfo.basePrice,
    sizeName: sizeInfo.name,
    serves: sizeInfo.serves,
    spongeName: spongeInfo.name,
    spongeAddon: spongeInfo.addon,
    frostingName: frostingInfo.name,
    frostingAddon: frostingInfo.addon,
    dietary: dietaryKey,
    dietaryAddon,
    customMessage,
    messageFee,
    totalPrice: Math.round(total * 100) / 100,
  };
}

module.exports = {
  SIZE_PRICING,
  SPONGE_ADDONS,
  FROSTING_ADDONS,
  DIETARY_ADDONS,
  calculateCakePrice,
};
