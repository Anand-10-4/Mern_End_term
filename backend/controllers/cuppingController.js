const CuppingSession = require('../models/CuppingSession');
const BatchLot = require('../models/BatchLot');
const AuditLog = require('../models/AuditLog');
const { calculateScaScore } = require('../utils/scaCalculator');

// @desc    Submit official SCA Cupping Protocol evaluation
// @route   POST /api/cuppings
// @access  Private (Q-Graders, Roasters, Admins)
const evaluateCupping = async (req, res, next) => {
  try {
    const {
      lotId,
      sessionTitle,
      waterTempCelsius,
      grindMicrons,
      fragrance,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      uniformity,
      cleanCup,
      sweetness,
      overall,
      defectCups,
      defectIntensity,
      tastingNotes,
      descriptors,
    } = req.body;

    const lot = await BatchLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Target batch lot not found for sensory evaluation',
      });
    }

    // Run standardized SCA algorithm
    const scaResult = calculateScaScore({
      fragrance,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      uniformity,
      cleanCup,
      sweetness,
      overall,
      defectCups,
      defectIntensity,
    });

    const session = await CuppingSession.create({
      lot: lot._id,
      evaluator: req.user._id,
      sessionTitle: sessionTitle || `SCA Protocol Evaluation for ${lot.lotNumber}`,
      waterTempCelsius: Number(waterTempCelsius) || 93.5,
      grindMicrons: Number(grindMicrons) || 850,
      fragrance: Number(fragrance),
      flavor: Number(flavor),
      aftertaste: Number(aftertaste),
      acidity: Number(acidity),
      body: Number(body),
      balance: Number(balance),
      uniformity: Number(uniformity),
      cleanCup: Number(cleanCup),
      sweetness: Number(sweetness),
      overall: Number(overall),
      defectCups: Number(defectCups) || 0,
      defectIntensity: Number(defectIntensity) || 2,
      defectDeduction: scaResult.defectDeduction,
      totalScore: scaResult.finalScore,
      classification: scaResult.grade,
      tastingNotes: tastingNotes || lot.flavorNotes,
      descriptors: descriptors || {
        aromaNotes: tastingNotes,
        acidityType: 'Citric & Malic',
        bodyTexture: 'Silky Creamy',
      },
      isApprovedForMarketplace: scaResult.isSpecialtyGrade,
    });

    // Automatically update the BatchLot's score and cupping breakdown
    lot.scaScore = scaResult.finalScore;
    lot.scaClassification = scaResult.grade;
    lot.cuppingScores = scaResult.breakdown;
    if (tastingNotes && tastingNotes.length > 0) {
      lot.flavorNotes = tastingNotes;
    }

    if (!scaResult.isSpecialtyGrade) {
      lot.status = 'draft'; // rejected from active allocation if below 80
    } else if (lot.status === 'draft' || lot.status === 'sensory_evaluation') {
      lot.status = 'approved';
    }

    await lot.save();

    await AuditLog.create({
      action: 'SCA_CUPPING_COMPLETED',
      user: req.user._id,
      entityType: 'CuppingSession',
      entityId: session._id,
      details: {
        lotNumber: lot.lotNumber,
        finalScore: scaResult.finalScore,
        grade: scaResult.grade,
      },
    });

    res.status(201).json({
      success: true,
      message: `Cupping completed! Verified SCA Score: ${scaResult.finalScore} (${scaResult.grade})`,
      session,
      scaResult,
      lotUpdated: {
        lotNumber: lot.lotNumber,
        newScaScore: lot.scaScore,
        status: lot.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cupping sessions for a specific lot
// @route   GET /api/cuppings/lot/:lotId
// @access  Public
const getLotCuppingHistory = async (req, res, next) => {
  try {
    const sessions = await CuppingSession.find({ lot: req.params.lotId })
      .populate('evaluator', 'name company role tier')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cupping sessions in sensory lab
// @route   GET /api/cuppings
// @access  Public
const getAllCuppingSessions = async (req, res, next) => {
  try {
    const sessions = await CuppingSession.find()
      .populate('lot', 'lotNumber name origin scaScore')
      .populate('evaluator', 'name company role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateCupping,
  getLotCuppingHistory,
  getAllCuppingSessions,
};
