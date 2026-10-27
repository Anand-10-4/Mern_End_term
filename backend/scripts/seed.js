const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CustomCake = require('../models/CustomCake');
const AuditLog = require('../models/AuditLog');
const { generateOrderNumber } = require('../utils/tokenHelper');
const { calculateCakePrice } = require('../utils/cakePricing');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goldencrust_db';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to ${mongoUri}`);

    // Clean existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await CustomCake.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing database collections.');

    // 1. Create Users
    const customer = await User.create({
      name: 'Alice Miller',
      email: 'customer@goldencrust.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 482-9102',
      loyaltyPoints: 120, // $12 redeemable
      address: {
        street: '724 Blossom Hill Rd',
        city: 'Sunnyvale',
        state: 'CA',
        postalCode: '94087',
      },
    });

    const baker = await User.create({
      name: 'Chef Pierre Dubois',
      email: 'baker@goldencrust.com',
      password: 'password123',
      role: 'baker',
      phone: '+1 (555) 901-3829',
      loyaltyPoints: 50,
      address: {
        street: '12 Bakery Row, Suite 1',
        city: 'Sunnyvale',
        state: 'CA',
        postalCode: '94086',
      },
    });

    const admin = await User.create({
      name: 'Anand Mohan (General Manager)',
      email: 'admin@goldencrust.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 789-0123',
      loyaltyPoints: 500,
      address: {
        street: '100 Golden Plaza',
        city: 'Sunnyvale',
        state: 'CA',
        postalCode: '94086',
      },
    });

    console.log('[Seed] Created Users: Customer, Head Baker, and Admin.');

    // 2. Create Products
    const productsData = [
      // Breads
      {
        name: 'Country Sourdough Boule',
        category: 'breads',
        price: 8.5,
        description: 'Naturally leavened 36-hour wild fermented loaf with a crisp blistered crust and custard-like crumb.',
        ingredients: ['Organic Stoneground Wheat', 'Rye Starter', 'Filtered Water', 'Celtic Sea Salt'],
        dailyStock: 25,
        availableStock: 18,
        dietaryTags: ['Vegan', 'Eggless', 'Nut-Free'],
        imageEmoji: '🥖',
        freshnessHours: 8,
        bakeTime: '5:30 AM Daily',
        isChefSpecial: true,
        rating: 4.95,
        reviewCount: 42,
      },
      {
        name: 'Rosemary & Sea Salt Focaccia',
        category: 'breads',
        price: 7.0,
        description: 'Fluffy Italian sheet bread drenched in cold-pressed extra virgin olive oil, fresh garden rosemary, and flaky Maldon salt.',
        ingredients: ['Flour', 'Extra Virgin Olive Oil', 'Fresh Rosemary', 'Maldon Flake Salt'],
        dailyStock: 15,
        availableStock: 9,
        dietaryTags: ['Vegan', 'Eggless', 'Nut-Free'],
        imageEmoji: '🍞',
        freshnessHours: 6,
        bakeTime: '6:30 AM Daily',
        isChefSpecial: false,
        rating: 4.8,
        reviewCount: 29,
      },
      {
        name: 'Heritage Honey Seeded Loaf',
        category: 'breads',
        price: 9.0,
        description: 'Nutrient-rich loaf packed with toasted flax, sunflower kernels, pumpkin seeds, and wildflower honey.',
        ingredients: ['Whole Wheat Flour', 'Wildflower Honey', 'Flaxseed', 'Sunflower Seeds', 'Chia'],
        dailyStock: 12,
        availableStock: 5,
        dietaryTags: ['Vegetarian', 'Eggless', 'Nut-Free'],
        imageEmoji: '🌾',
        freshnessHours: 8,
        bakeTime: '5:45 AM Daily',
        isChefSpecial: false,
        rating: 4.88,
        reviewCount: 21,
      },

      // Croissants & Pastries
      {
        name: 'Classic French Butter Croissant',
        category: 'croissants_pastries',
        price: 4.5,
        description: '27 laminated micro-layers of cultured butter dough, baked to an ethereal honeycomb interior and flaky golden crust.',
        ingredients: ['French High-Fat Butter (84%)', 'Unbleached Flour', 'Whole Milk', 'Cane Sugar'],
        dailyStock: 35,
        availableStock: 22,
        dietaryTags: ['Vegetarian', 'Nut-Free'],
        imageEmoji: '🥐',
        freshnessHours: 4,
        bakeTime: '6:00 AM & 11:00 AM',
        isChefSpecial: true,
        rating: 4.98,
        reviewCount: 88,
      },
      {
        name: 'Twice-Baked Almond Frangipane',
        category: 'croissants_pastries',
        price: 5.75,
        description: 'Day-fresh croissant steeped in vanilla simple syrup, filled with rich almond frangipane cream, topped with toasted sliced almonds.',
        ingredients: ['Croissant Pastry', 'Almond Flour', 'Bourbon Vanilla', 'Powdered Sugar'],
        dailyStock: 18,
        availableStock: 7,
        dietaryTags: ['Vegetarian'],
        imageEmoji: '🥐',
        freshnessHours: 6,
        bakeTime: '7:00 AM Daily',
        isChefSpecial: false,
        rating: 4.92,
        reviewCount: 54,
      },
      {
        name: 'Valrhona Chocolate Pain au Chocolat',
        category: 'croissants_pastries',
        price: 5.25,
        description: 'Layered buttery pastry folded over two batons of 66% Valrhona French dark chocolate.',
        ingredients: ['Butter Pastry', 'Valrhona Dark Chocolate Batons', 'Egg Wash', 'Sea Salt'],
        dailyStock: 25,
        availableStock: 14,
        dietaryTags: ['Vegetarian', 'Nut-Free'],
        imageEmoji: '🍫',
        freshnessHours: 4,
        bakeTime: '6:15 AM Daily',
        isChefSpecial: false,
        rating: 4.9,
        reviewCount: 63,
      },
      {
        name: 'Salted Caramel Pecan Cinnamon Swirl',
        category: 'croissants_pastries',
        price: 6.0,
        description: 'Tender brioche roll spun with Korintje cinnamon brown sugar, drenched in warm house-made caramel and toasted pecans.',
        ingredients: ['Enriched Brioche Dough', 'Cinnamon', 'Brown Sugar', 'Butter Caramel', 'Texas Pecans'],
        dailyStock: 16,
        availableStock: 4,
        dietaryTags: ['Vegetarian'],
        imageEmoji: '🍯',
        freshnessHours: 5,
        bakeTime: '7:30 AM Daily',
        isChefSpecial: true,
        rating: 4.96,
        reviewCount: 47,
      },

      // Tarts & Cakes
      {
        name: 'Vanilla Bean Berry Tartlet',
        category: 'tarts_cakes',
        price: 7.5,
        description: 'Crisp sweet butter sablé shell filled with silky Madagascar vanilla diplomat cream and fresh organic berries.',
        ingredients: ['Sweet Almond Sablé Crust', 'Tahitian Vanilla Pods', 'Fresh Raspberries', 'Blueberries'],
        dailyStock: 14,
        availableStock: 8,
        dietaryTags: ['Vegetarian'],
        imageEmoji: '🥧',
        freshnessHours: 8,
        bakeTime: '8:00 AM Daily',
        isChefSpecial: false,
        rating: 4.87,
        reviewCount: 31,
      },
      {
        name: 'Dark Chocolate Ganache Gateau Slice',
        category: 'tarts_cakes',
        price: 8.0,
        description: 'Flourless fudge sponge layered with 70% dark chocolate mousse and mirror glaze finish.',
        ingredients: ['Belgian Cocoa', 'Heavy Cream', 'Espresso Powder', 'Bittersweet Chocolate'],
        dailyStock: 12,
        availableStock: 6,
        dietaryTags: ['Vegetarian', 'Gluten-Free', 'Nut-Free'],
        imageEmoji: '🍰',
        freshnessHours: 12,
        bakeTime: '8:30 AM Daily',
        isChefSpecial: true,
        rating: 4.94,
        reviewCount: 39,
      },

      // Savory
      {
        name: 'Gruyère & Caramelized Onion Brioche',
        category: 'savory_bakes',
        price: 6.75,
        description: 'Tender savory brioche stuffed with 8-hour slow caramelized shallots and molten aged Swiss Gruyère.',
        ingredients: ['Brioche Dough', 'Gruyère AOC Cheese', 'Caramelized Sweet Onions', 'Thyme'],
        dailyStock: 14,
        availableStock: 9,
        dietaryTags: ['Vegetarian', 'Nut-Free'],
        imageEmoji: '🧀',
        freshnessHours: 5,
        bakeTime: '7:45 AM Daily',
        isChefSpecial: false,
        rating: 4.85,
        reviewCount: 25,
      },
    ];

    const products = await Product.create(productsData);
    console.log(`[Seed] Created ${products.length} artisan bakery catalog items.`);

    // 3. Create Sample Custom Cake
    const cakeBreakdown = calculateCakePrice({
      size: 'standard_6inch',
      sponge: 'belgian_chocolate',
      frosting: 'salted_caramel',
      dietary: 'eggless',
      customMessage: 'Happy 30th Birthday Emma!',
    });

    const sampleCake = await CustomCake.create({
      customer: customer._id,
      size: 'standard_6inch',
      sponge: 'belgian_chocolate',
      frosting: 'salted_caramel',
      dietary: 'eggless',
      customMessage: 'Happy 30th Birthday Emma!',
      decorTheme: 'Gold Leaf & Toasted Honey Caramel Drip',
      totalPrice: cakeBreakdown.totalPrice,
      breakdown: cakeBreakdown,
    });

    // 4. Create Sample Orders across kitchen stages
    // Order 1: Baking in Oven
    await Order.create({
      orderNumber: generateOrderNumber(),
      customer: customer._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          quantity: 2,
          imageEmoji: products[0].imageEmoji,
        },
        {
          product: products[3]._id,
          name: products[3].name,
          price: products[3].price,
          quantity: 4,
          imageEmoji: products[3].imageEmoji,
        },
      ],
      subtotal: 8.5 * 2 + 4.5 * 4,
      discountAmount: 0,
      totalAmount: 35.0,
      fulfillmentType: 'pickup',
      scheduledSlot: 'Today: 2:00 PM Warm Oven Batch',
      status: 'baking',
      milestones: [
        { status: 'placed', note: 'Order received at bakery counter', timestamp: new Date(Date.now() - 40 * 60000) },
        { status: 'baking', note: 'Proofed loaves and croissants loaded into deck oven #2 at 220°C', timestamp: new Date(Date.now() - 15 * 60000) },
      ],
    });

    // Order 2: Decorating Custom Cake
    await Order.create({
      orderNumber: generateOrderNumber(),
      customer: customer._id,
      items: [
        {
          name: 'Custom 6-inch Celebration Cake',
          price: sampleCake.totalPrice,
          quantity: 1,
          isCustomCake: true,
          cakeDetails: {
            sizeName: 'Standard Celebration (6-inch)',
            spongeName: 'Rich Belgian Dark Chocolate',
            frostingName: 'Salted Caramel Ganache',
            customMessage: 'Happy 30th Birthday Emma!',
            dietary: 'eggless',
            decorTheme: 'Gold Leaf & Toasted Honey Caramel Drip',
          },
          imageEmoji: '🎂',
        },
      ],
      subtotal: sampleCake.totalPrice,
      discountAmount: 4.4,
      couponApplied: 'GOLDEN10 (10% Off)',
      totalAmount: Math.round((sampleCake.totalPrice - 4.4) * 100) / 100,
      fulfillmentType: 'delivery',
      scheduledSlot: 'Today: 4:30 PM Celebration Delivery',
      deliveryAddress: customer.address,
      status: 'decorating',
      milestones: [
        { status: 'placed', note: 'Custom cake design order confirmed', timestamp: new Date(Date.now() - 3 * 3600000) },
        { status: 'baking', note: 'Eggless dark chocolate sponge baked & chilled', timestamp: new Date(Date.now() - 2 * 3600000) },
        { status: 'decorating', note: 'Piping salted caramel ganache and edible gold leaf decor', timestamp: new Date(Date.now() - 20 * 60000) },
      ],
    });

    // Order 3: Ready for Pickup
    await Order.create({
      orderNumber: generateOrderNumber(),
      customer: customer._id,
      items: [
        {
          product: products[6]._id,
          name: products[6].name,
          price: products[6].price,
          quantity: 2,
          imageEmoji: products[6].imageEmoji,
        },
        {
          product: products[7]._id,
          name: products[7].name,
          price: products[7].price,
          quantity: 2,
          imageEmoji: products[7].imageEmoji,
        },
      ],
      subtotal: 6.0 * 2 + 7.5 * 2,
      discountAmount: 2.0,
      loyaltyPointsUsed: 20,
      totalAmount: 25.0,
      fulfillmentType: 'pickup',
      scheduledSlot: 'Ready on Bakery Pickup Shelf',
      status: 'ready',
      milestones: [
        { status: 'placed', note: 'Order placed online', timestamp: new Date(Date.now() - 90 * 60000) },
        { status: 'baking', note: 'Baked fresh in morning batch', timestamp: new Date(Date.now() - 60 * 60000) },
        { status: 'decorating', note: 'Glazed and boxed with golden ribbon', timestamp: new Date(Date.now() - 30 * 60000) },
        { status: 'ready', note: 'Packaged on Shelf #4 ready for customer pickup', timestamp: new Date(Date.now() - 10 * 60000) },
      ],
    });

    // 5. Audit Log
    await AuditLog.create({
      action: 'BAKERY_INITIALIZATION',
      user: admin._id,
      entityType: 'System',
      details: { bakeryName: 'GoldenCrust Artisan Bakery', morningBakes: products.length },
    });

    console.log('[Seed] Database seeded successfully! Ready for demonstration.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedData();
