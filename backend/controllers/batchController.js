const BatchLot = require('../models/BatchLot');
const AuditLog = require('../models/AuditLog');
const { generateLotHash } = require('../utils/tokenHelper');
const { calculateRoastMetrics, calculateScaScore } = require('../utils/scaCalculator');

// @desc    Create a new artisan coffee batch lot
// @route   POST /api/batches
// @access  Private (Roasters and Admins)
const createBatchLot = async (req, res, next) => {
  try {
    const {
      lotNumber,
      name,
      origin,
      roastProfile,
      greenWeightKg,
      roastedWeightKg,
      pricePerKg,
      moistureContentPercent,
      densityGramsPerLiter,
      defectCount,
      cuppingScores,
      flavorNotes,
      certifications,
      story,
    } = req.body;

    // Check if lotNumber already exists
    const existing = await BatchLot.findOne({ lotNumber: lotNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Lot identifier '${lotNumber}' is already registered in the registry`,
      });
    }

    // Calculate roast loss metrics
    const metrics = calculateRoastMetrics(Number(greenWeightKg), Number(roastedWeightKg));

    // Calculate initial SCA score if cupping scores provided
    const scaEval = calculateScaScore(cuppingScores || {});

    // Generate cryptographic QR hash
    const qrHash = generateLotHash({
      lotNumber: lotNumber.toUpperCase(),
      origin,
      scaScore: scaEval.finalScore,
      harvestDate: Date.now(),
    });

    const batch = await BatchLot.create({
      lotNumber: lotNumber.toUpperCase(),
      name,
      origin: {
        country: origin?.country || 'Ethiopia',
        region: origin?.region || 'Yirgacheffe',
        estate: origin?.estate || 'Aricha Smallholders',
        altitudeMeters: Number(origin?.altitudeMeters) || 1950,
        varietal: origin?.varietal || 'Kurume / Dega',
        processMethod: origin?.processMethod || 'Washed',
      },
      roaster: req.user._id,
      roastProfile: roastProfile || 'Light Cinnamon',
      greenWeightKg: Number(greenWeightKg),
      roastedWeightKg: Number(roastedWeightKg),
      availableKg: Number(roastedWeightKg), // initially all roasted weight is available
      allocatedKg: 0,
      pricePerKg: Number(pricePerKg),
      moistureContentPercent: Number(moistureContentPercent) || 10.8,
      densityGramsPerLiter: Number(densityGramsPerLiter) || 710,
      defectCount: Number(defectCount) || 0,
      scaScore: scaEval.finalScore,
      scaClassification: scaEval.grade,
      cuppingScores: scaEval.breakdown,
      flavorNotes: Array.isArray(flavorNotes) ? flavorNotes : ['Bergamot', 'Jasmine', 'Cane Sugar'],
      certifications: certifications || ['Direct Trade Specialty'],
      story: story || 'Carefully sourced micro-lot with meticulous processing.',
      qrHash,
      status: 'approved',
    });

    await AuditLog.create({
      action: 'BATCH_LOT_CREATED',
      user: req.user._id,
      entityType: 'BatchLot',
      entityId: batch._id,
      details: {
        lotNumber: batch.lotNumber,
        scaScore: batch.scaScore,
        shrinkage: metrics.shrinkagePercentage,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Batch lot successfully registered in specialty registry',
      batch,
      roastMetrics: metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all batch lots with live reservation cleanup & filters
// @route   GET /api/batches
// @access  Public
const getAllBatchLots = async (req, res, next) => {
  try {
    const {
      country,
      processMethod,
      minScaScore,
      maxPrice,
      status,
      search,
      sortBy,
    } = req.query;

    const query = {};

    // Filter by country
    if (country) {
      query['origin.country'] = { $regex: country, $options: 'i' };
    }

    // Filter by process method
    if (processMethod) {
      query['origin.processMethod'] = processMethod;
    }

    // Filter by SCA score
    if (minScaScore) {
      query.scaScore = { $gte: Number(minScaScore) };
    }

    // Filter by price
    if (maxPrice) {
      query.pricePerKg = { $lte: Number(maxPrice) };
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'allocated', 'sold_out'] };
    }

    // Search query (lotNumber, name, region, notes)
    if (search) {
      query.$or = [
        { lotNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'origin.region': { $regex: search, $options: 'i' } },
        { 'origin.estate': { $regex: search, $options: 'i' } },
        { flavorNotes: { $regex: search, $options: 'i' } },
      ];
    }

    let sort = { scaScore: -1 }; // default: highest specialty score first
    if (sortBy === 'price_asc') sort = { pricePerKg: 1 };
    if (sortBy === 'price_desc') sort = { pricePerKg: -1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };
    if (sortBy === 'available') sort = { availableKg: -1 };

    const batches = await BatchLot.find(query)
      .populate('roaster', 'name company tier')
      .sort(sort);

    // Dynamic cleanup of expired reservations across retrieved lots
    for (const batch of batches) {
      if (batch.activeReservations && batch.activeReservations.length > 0) {
        const restored = batch.cleanupExpiredReservations();
        if (restored > 0) {
          await batch.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batch lot by ID
// @route   GET /api/batches/:id
// @access  Public
const getBatchLotById = async (req, res, next) => {
  try {
    const batch = await BatchLot.findById(req.params.id).populate('roaster', 'name company tier email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch lot not found with specified identifier',
      });
    }

    // Clean up expired reservations
    const restored = batch.cleanupExpiredReservations();
    if (restored > 0) {
      await batch.save();
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve wholesale allocation with 15-minute expiring lock
// @route   POST /api/batches/:id/reserve
// @access  Private (Buyers)
const reserveBatchAllocation = async (req, res, next) => {
  try {
    const { amountKg } = req.body;
    const requestedAmount = Number(amountKg);

    if (!requestedAmount || requestedAmount < 5) {
      return res.status(400).json({
        success: false,
        message: 'Minimum wholesale allocation reservation is 5 kg',
      });
    }

    const batch = await BatchLot.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch lot not found',
      });
    }

    // Clean expired locks first
    batch.cleanupExpiredReservations();

    // Check available quantity
    if (batch.availableKg < requestedAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient allocation available. Only ${batch.availableKg.toFixed(1)} kg remains in this lot.`,
      });
    }

    // Check buyer's monthly allocation quota
    const remainingQuota = req.user.allocationQuotaKg - req.user.usedQuotaKg;
    if (requestedAmount > remainingQuota) {
      return res.status(403).json({
        success: false,
        message: `Reservation exceeds your tier wholesale quota. Available quota: ${remainingQuota} kg. Upgrade tier or request quota extension.`,
      });
    }

    // 15-minute reservation expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const reservationToken = 'RES-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Atomically decrement availableKg and push reservation
    batch.availableKg -= requestedAmount;
    if (batch.availableKg <= 0) {
      batch.status = 'sold_out';
    }

    batch.activeReservations.push({
      buyer: req.user._id,
      buyerName: req.user.name,
      amountKg: requestedAmount,
      reservedAt: new Date(),
      expiresAt,
      reservationToken,
    });

    await batch.save();

    await AuditLog.create({
      action: 'ALLOCATION_RESERVED',
      user: req.user._id,
      entityType: 'BatchLot',
      entityId: batch._id,
      details: {
        amountKg: requestedAmount,
        reservationToken,
        expiresAt,
      },
    });

    res.status(200).json({
      success: true,
      message: `Successfully reserved ${requestedAmount} kg for 15 minutes`,
      reservation: {
        token: reservationToken,
        amountKg: requestedAmount,
        expiresAt,
        batchId: batch._id,
        lotNumber: batch.lotNumber,
        unitPrice: batch.pricePerKg,
        estimatedTotal: (requestedAmount * batch.pricePerKg).toFixed(2),
      },
      remainingAvailableKg: batch.availableKg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel or release active reservation
// @route   POST /api/batches/:id/release-reservation
// @access  Private
const releaseReservation = async (req, res, next) => {
  try {
    const { reservationToken } = req.body;
    const batch = await BatchLot.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const index = batch.activeReservations.findIndex((r) => r.reservationToken === reservationToken);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Reservation token not found or already expired' });
    }

    const reservation = batch.activeReservations[index];
    batch.availableKg += reservation.amountKg;
    if (batch.status === 'sold_out' && batch.availableKg > 0) {
      batch.status = 'approved';
    }
    batch.activeReservations.splice(index, 1);

    await batch.save();

    res.status(200).json({
      success: true,
      message: 'Reservation released successfully. Allocation returned to pool.',
      availableKg: batch.availableKg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch lot metadata
// @route   PUT /api/batches/:id
// @access  Private (Owner Roaster / Admin)
const updateBatchLot = async (req, res, next) => {
  try {
    let batch = await BatchLot.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch lot not found' });
    }

    if (batch.roaster.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the lot roaster or system administrator can edit this lot',
      });
    }

    const { pricePerKg, status, story, roastProfile, flavorNotes } = req.body;
    if (pricePerKg) batch.pricePerKg = Number(pricePerKg);
    if (status) batch.status = status;
    if (story) batch.story = story;
    if (roastProfile) batch.roastProfile = roastProfile;
    if (flavorNotes) batch.flavorNotes = flavorNotes;

    await batch.save();

    res.status(200).json({
      success: true,
      message: 'Batch lot updated successfully',
      batch,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBatchLot,
  getAllBatchLots,
  getBatchLotById,
  reserveBatchAllocation,
  releaseReservation,
  updateBatchLot,
};
