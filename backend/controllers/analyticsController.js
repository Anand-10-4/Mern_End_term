const BatchLot = require('../models/BatchLot');
const Order = require('../models/Order');
const User = require('../models/User');
const CuppingSession = require('../models/CuppingSession');
const AuditLog = require('../models/AuditLog');

// @desc    Get aggregated platform telemetry & analytics
// @route   GET /api/analytics/dashboard
// @access  Public
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalLots = await BatchLot.countDocuments();
    const approvedLots = await BatchLot.countDocuments({ status: { $in: ['approved', 'allocated'] } });
    const totalCuppingSessions = await CuppingSession.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    // Aggregations on BatchLot
    const lotStats = await BatchLot.aggregate([
      {
        $group: {
          _id: null,
          totalGreenKg: { $sum: '$greenWeightKg' },
          totalRoastedKg: { $sum: '$roastedWeightKg' },
          totalAvailableKg: { $sum: '$availableKg' },
          totalAllocatedKg: { $sum: '$allocatedKg' },
          avgScaScore: { $avg: '$scaScore' },
          avgPricePerKg: { $avg: '$pricePerKg' },
        },
      },
    ]);

    // Financial volume from Orders
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalEscrowVolume: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          totalVolumeSoldKg: { $sum: '$quantityKg' },
        },
      },
    ]);

    // Breakdown by origin country
    const originDistribution = await BatchLot.aggregate([
      { $group: { _id: '$origin.country', count: { $sum: 1 }, totalKg: { $sum: '$roastedWeightKg' } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by process method
    const processDistribution = await BatchLot.aggregate([
      { $group: { _id: '$origin.processMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent 8 audit logs
    const recentActivity = await AuditLog.find()
      .populate('user', 'name company role')
      .sort({ createdAt: -1 })
      .limit(8);

    const stats = lotStats[0] || {
      totalGreenKg: 0,
      totalRoastedKg: 0,
      totalAvailableKg: 0,
      totalAllocatedKg: 0,
      avgScaScore: 86.5,
      avgPricePerKg: 32.5,
    };

    const fin = orderStats[0] || {
      totalEscrowVolume: 0,
      avgOrderValue: 0,
      totalVolumeSoldKg: 0,
    };

    // Calculate platform roast efficiency
    const roastShrinkagePct = stats.totalGreenKg > 0
      ? Math.round(((stats.totalGreenKg - stats.totalRoastedKg) / stats.totalGreenKg) * 1000) / 10
      : 14.2;

    res.status(200).json({
      success: true,
      summary: {
        totalLots,
        approvedLots,
        totalOrders,
        totalUsers,
        totalCuppingSessions,
        totalRoastedKg: stats.totalRoastedKg,
        totalAvailableKg: Math.round(stats.totalAvailableKg * 10) / 10,
        totalAllocatedKg: Math.round(stats.totalAllocatedKg * 10) / 10,
        avgScaScore: Math.round(stats.avgScaScore * 10) / 10,
        avgPricePerKg: Math.round(stats.avgPricePerKg * 100) / 100,
        totalEscrowVolume: Math.round(fin.totalEscrowVolume * 100) / 100,
        roastShrinkagePct,
      },
      originDistribution,
      processDistribution,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
