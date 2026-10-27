const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get bakery operations telemetry & sales analytics
// @route   GET /api/analytics/dashboard
// @access  Public
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Active orders in kitchen
    const activeKitchenQueue = await Order.countDocuments({
      status: { $in: ['placed', 'baking', 'decorating'] },
    });

    const readyForPickup = await Order.countDocuments({ status: 'ready' });

    // Financial aggregates
    const salesAggregate = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    // Inventory stock levels
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalDailyStock: { $sum: '$dailyStock' },
          totalAvailableStock: { $sum: '$availableStock' },
        },
      },
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent 8 audit logs
    const recentActivity = await AuditLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(8);

    const sales = salesAggregate[0] || { totalRevenue: 0, avgOrderValue: 0 };
    const stock = inventoryStats[0] || { totalDailyStock: 100, totalAvailableStock: 75 };

    const sellThroughRate = stock.totalDailyStock > 0
      ? Math.round(((stock.totalDailyStock - stock.totalAvailableStock) / stock.totalDailyStock) * 100)
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue: Math.round(sales.totalRevenue * 100) / 100,
        avgOrderValue: Math.round(sales.avgOrderValue * 100) / 100,
        totalOrders,
        totalCustomers,
        totalProducts,
        activeKitchenQueue,
        readyForPickup,
        sellThroughRate,
        availableStockTotal: stock.totalAvailableStock,
        dailyStockTotal: stock.totalDailyStock,
      },
      categoryDistribution,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
