const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Get all daily fresh bakes with filtering
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const { category, dietary, search, sortBy } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (dietary && dietary !== 'all') {
      query.dietaryTags = dietary;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } },
      ];
    }

    let sort = { isChefSpecial: -1, createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    if (sortBy === 'price_desc') sort = { price: -1 };
    if (sortBy === 'popular') sort = { rating: -1, reviewCount: -1 };

    const products = await Product.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in bakery catalog',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new bake item (Baker / Admin)
// @route   POST /api/products
// @access  Private (Baker / Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      description,
      ingredients,
      dailyStock,
      dietaryTags,
      imageEmoji,
      bakeTime,
      isChefSpecial,
    } = req.body;

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      description,
      ingredients: ingredients || ['Unbleached Organic Flour', 'Grass-Fed Butter', 'Sea Salt'],
      dailyStock: Number(dailyStock) || 20,
      availableStock: Number(dailyStock) || 20,
      dietaryTags: dietaryTags || ['Vegetarian'],
      imageEmoji: imageEmoji || '🥐',
      bakeTime: bakeTime || '6:00 AM Daily',
      isChefSpecial: Boolean(isChefSpecial),
    });

    await AuditLog.create({
      action: 'PRODUCT_CREATED',
      user: req.user._id,
      entityType: 'Product',
      entityId: product._id,
      details: { name: product.name, price: product.price, dailyStock: product.dailyStock },
    });

    res.status(201).json({
      success: true,
      message: 'New artisan bake added to catalog',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock (Baker / Admin)
// @route   PATCH /api/products/:id/stock
// @access  Private (Baker / Admin)
const updateProductStock = async (req, res, next) => {
  try {
    const { availableStock, dailyStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (availableStock !== undefined) product.availableStock = Number(availableStock);
    if (dailyStock !== undefined) product.dailyStock = Number(dailyStock);

    await product.save();

    res.status(200).json({
      success: true,
      message: `Stock updated for ${product.name}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restock all morning batches (Baker / Admin)
// @route   POST /api/products/morning-restock
// @access  Private (Baker / Admin)
const restockAllDaily = async (req, res, next) => {
  try {
    const products = await Product.find();
    for (const p of products) {
      p.availableStock = p.dailyStock;
      await p.save();
    }

    await AuditLog.create({
      action: 'MORNING_RESTOCK',
      user: req.user._id,
      entityType: 'System',
      details: { itemsRestocked: products.length },
    });

    res.status(200).json({
      success: true,
      message: `Fresh morning batch ready! Reset stock for all ${products.length} bakery items.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductStock,
  restockAllDaily,
};
