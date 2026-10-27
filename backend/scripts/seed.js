const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const BatchLot = require('../models/BatchLot');
const CuppingSession = require('../models/CuppingSession');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const { generateLotHash, generateOrderNumber } = require('../utils/tokenHelper');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amberroast_db';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await BatchLot.deleteMany({});
    await CuppingSession.deleteMany({});
    await Order.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Users
    const roasterKaffa = await User.create({
      name: 'Marcus Vance',
      email: 'roaster@amberroast.io',
      password: 'password123',
      role: 'roaster',
      company: 'Kaffa Highlands Micro-Roastery',
      tier: 'Gold Reserve',
      allocationQuotaKg: 3000,
      badgeNumber: 'AR-ROAST-01',
    });

    const roasterAntioquia = await User.create({
      name: 'Sofia Restrepo',
      email: 'sofia@antioquiacraft.com',
      password: 'password123',
      role: 'roaster',
      company: 'Andean Estate Craft Labs',
      tier: 'Silver',
      allocationQuotaKg: 2000,
      badgeNumber: 'AR-ROAST-02',
    });

    const buyerGold = await User.create({
      name: 'Julian Sterling',
      email: 'buyer@amberroast.io',
      password: 'password123',
      role: 'buyer',
      company: 'Sterling Specialty Cafe Collective',
      tier: 'Gold Reserve',
      allocationQuotaKg: 1500,
      usedQuotaKg: 180,
      badgeNumber: 'AR-BUYER-01',
    });

    const buyerSilver = await User.create({
      name: 'Claire Dupont',
      email: 'claire@lumierecoffee.com',
      password: 'password123',
      role: 'buyer',
      company: 'Lumiere Artisan Espresso Bar',
      tier: 'Silver',
      allocationQuotaKg: 800,
      usedQuotaKg: 95,
      badgeNumber: 'AR-BUYER-02',
    });

    const qGrader = await User.create({
      name: 'Dr. Aaron Chen, CQI',
      email: 'qgrader@amberroast.io',
      password: 'password123',
      role: 'qgrader',
      company: 'Sensory Guild of America (CQI #4092)',
      tier: 'Gold Reserve',
      allocationQuotaKg: 500,
      badgeNumber: 'AR-QGRAD-01',
    });

    const adminUser = await User.create({
      name: 'Anand Mohan (Lab Director)',
      email: 'admin@amberroast.io',
      password: 'password123',
      role: 'admin',
      company: 'AmberRoast Headquarters Protocol',
      tier: 'Gold Reserve',
      allocationQuotaKg: 10000,
      badgeNumber: 'AR-ADMIN-01',
    });

    console.log('[Seed] Created Users (Roasters, Buyers, Q-Grader, Admin).');

    // 2. Create Batch Lots
    const lot1 = await BatchLot.create({
      lotNumber: 'LOT-ETH-2026-081',
      name: 'Yirgacheffe Gedeb Gesha Natural',
      origin: {
        country: 'Ethiopia',
        region: 'Gedeb, Gedeo Zone',
        estate: 'Banko Gotiti Micro-Station',
        altitudeMeters: 2150,
        varietal: 'Gesha 1931 Heirloom',
        processMethod: 'Natural',
      },
      roaster: roasterKaffa._id,
      roastProfile: 'Light Cinnamon',
      greenWeightKg: 120,
      roastedWeightKg: 103,
      availableKg: 68,
      allocatedKg: 35,
      pricePerKg: 46.5,
      moistureContentPercent: 10.4,
      densityGramsPerLiter: 725,
      defectCount: 0,
      scaScore: 89.25,
      scaClassification: 'Excellent Specialty (85-89.99)',
      cuppingScores: {
        fragrance: 9.0,
        flavor: 9.0,
        aftertaste: 8.75,
        acidity: 9.0,
        body: 8.5,
        balance: 8.75,
        uniformity: 10.0,
        cleanCup: 10.0,
        sweetness: 10.0,
        overall: 8.75,
      },
      flavorNotes: ['Wild Bergamot', 'Jasmine Flower', 'Ripe Apricot', 'Golden Honeycomb'],
      certifications: ['Direct Trade Organic', 'Highland Shade Grown', 'CQI Certified'],
      story: 'Cultivated in volcanic red clay soil at over 2,100m. Dried on raised African bamboo beds for 24 days with continuous hand sorting.',
      qrHash: generateLotHash({ lotNumber: 'LOT-ETH-2026-081', scaScore: 89.25, origin: { country: 'Ethiopia' } }),
      status: 'approved',
    });

    const lot2 = await BatchLot.create({
      lotNumber: 'LOT-PAN-2026-014',
      name: 'Boquete Volcan Baru Anaerobic Slow Dry',
      origin: {
        country: 'Panama',
        region: 'Boquete, Chiriqui',
        estate: 'Hacienda La Esmeralda Jaramillo',
        altitudeMeters: 1900,
        varietal: 'Green Tip Gesha',
        processMethod: 'Anaerobic Slow Dry',
      },
      roaster: roasterKaffa._id,
      roastProfile: 'Nordic Filter',
      greenWeightKg: 80,
      roastedWeightKg: 68.5,
      availableKg: 38.5,
      allocatedKg: 30,
      pricePerKg: 78.0,
      moistureContentPercent: 10.1,
      densityGramsPerLiter: 740,
      defectCount: 0,
      scaScore: 92.5,
      scaClassification: 'Presidential Exemplar (90-100)',
      cuppingScores: {
        fragrance: 9.5,
        flavor: 9.25,
        aftertaste: 9.0,
        acidity: 9.5,
        body: 8.75,
        balance: 9.0,
        uniformity: 10.0,
        cleanCup: 10.0,
        sweetness: 10.0,
        overall: 9.5,
      },
      flavorNotes: ['Champagne Mango', 'Candied Meyer Lemon', 'Orange Blossom', 'White Tea'],
      certifications: ['Micro-Lot Auction Grade', 'Carbon Neutral Estate', 'Direct Trade'],
      story: 'Fermented in stainless steel bio-reactors for 96 hours under nitrogen displacement, followed by shaded parabolic drying.',
      qrHash: generateLotHash({ lotNumber: 'LOT-PAN-2026-014', scaScore: 92.5, origin: { country: 'Panama' } }),
      status: 'approved',
    });

    const lot3 = await BatchLot.create({
      lotNumber: 'LOT-COL-2026-039',
      name: 'Huila San Adolfo Pink Bourbon Washed',
      origin: {
        country: 'Colombia',
        region: 'Acevedo, Southern Huila',
        estate: 'Finca El Paraiso',
        altitudeMeters: 1780,
        varietal: 'Pink Bourbon',
        processMethod: 'Washed',
      },
      roaster: roasterAntioquia._id,
      roastProfile: 'Medium City+',
      greenWeightKg: 150,
      roastedWeightKg: 129,
      availableKg: 89,
      allocatedKg: 40,
      pricePerKg: 34.0,
      moistureContentPercent: 11.2,
      densityGramsPerLiter: 715,
      defectCount: 1,
      scaScore: 87.0,
      scaClassification: 'Excellent Specialty (85-89.99)',
      cuppingScores: {
        fragrance: 8.75,
        flavor: 8.75,
        aftertaste: 8.5,
        acidity: 8.75,
        body: 8.5,
        balance: 8.5,
        uniformity: 10.0,
        cleanCup: 10.0,
        sweetness: 10.0,
        overall: 8.5,
      },
      flavorNotes: ['Pink Guava', 'Blood Orange', 'Brown Sugar Caramel', 'Dark Cocoa'],
      certifications: ['Rainforest Alliance', 'Single Producer Traceability'],
      story: 'Submerged cold fermentation for 36 hours before parchment washing with pristine Andean mountain spring water.',
      qrHash: generateLotHash({ lotNumber: 'LOT-COL-2026-039', scaScore: 87.0, origin: { country: 'Colombia' } }),
      status: 'approved',
    });

    const lot4 = await BatchLot.create({
      lotNumber: 'LOT-KEN-2026-092',
      name: 'Nyeri Hill AB Phosphoric Double Wash',
      origin: {
        country: 'Kenya',
        region: 'Nyeri County, Mount Kenya Slopes',
        estate: 'Gikanda Farmers Cooperative',
        altitudeMeters: 1850,
        varietal: 'SL-28 & SL-34',
        processMethod: 'Washed',
      },
      roaster: roasterKaffa._id,
      roastProfile: 'Light Cinnamon',
      greenWeightKg: 100,
      roastedWeightKg: 85.5,
      availableKg: 55.5,
      allocatedKg: 30,
      pricePerKg: 42.0,
      moistureContentPercent: 10.6,
      densityGramsPerLiter: 735,
      defectCount: 0,
      scaScore: 88.5,
      scaClassification: 'Excellent Specialty (85-89.99)',
      cuppingScores: {
        fragrance: 8.75,
        flavor: 9.0,
        aftertaste: 8.75,
        acidity: 9.25,
        body: 8.5,
        balance: 8.75,
        uniformity: 10.0,
        cleanCup: 10.0,
        sweetness: 10.0,
        overall: 8.75,
      },
      flavorNotes: ['Blackcurrant', 'Ruby Red Grapefruit', 'Hibiscus', 'Molasses'],
      certifications: ['Fair Trade Certified', 'Cooperativa Direct Reserve'],
      story: 'Traditional Kenyan 72-hour double fermentation with post-soak in clean spring channels, giving unmatched phosphoric vibrance.',
      qrHash: generateLotHash({ lotNumber: 'LOT-KEN-2026-092', scaScore: 88.5, origin: { country: 'Kenya' } }),
      status: 'approved',
    });

    const lot5 = await BatchLot.create({
      lotNumber: 'LOT-CRI-2026-057',
      name: 'Tarrazu Black Honey Micro-Lot',
      origin: {
        country: 'Costa Rica',
        region: 'Tarrazu Valley, San Jose',
        estate: 'Finca La Pastora',
        altitudeMeters: 1650,
        varietal: 'Caturra / Villa Sarchi',
        processMethod: 'Honey (Yellow/Red/Black)',
      },
      roaster: roasterAntioquia._id,
      roastProfile: 'Medium City+',
      greenWeightKg: 130,
      roastedWeightKg: 112,
      availableKg: 112,
      allocatedKg: 0,
      pricePerKg: 29.5,
      moistureContentPercent: 11.5,
      densityGramsPerLiter: 708,
      defectCount: 0,
      scaScore: 86.0,
      scaClassification: 'Excellent Specialty (85-89.99)',
      cuppingScores: {
        fragrance: 8.5,
        flavor: 8.5,
        aftertaste: 8.25,
        acidity: 8.25,
        body: 8.75,
        balance: 8.5,
        uniformity: 10.0,
        cleanCup: 10.0,
        sweetness: 10.0,
        overall: 8.5,
      },
      flavorNotes: ['Roasted Hazelnut', 'Golden Honey', 'Milk Chocolate', 'Red Apple'],
      certifications: ['Shade Grown', 'Micro-Mill Certified'],
      story: '100% mucilage retained during slow parabolic greenhouse dehydration, concentrating fructose and full syrupy mouthfeel.',
      qrHash: generateLotHash({ lotNumber: 'LOT-CRI-2026-057', scaScore: 86.0, origin: { country: 'Costa Rica' } }),
      status: 'approved',
    });

    console.log('[Seed] Created 5 Specialty Batch Lots with full SCA breakdown.');

    // 3. Create Cupping Sessions
    await CuppingSession.create({
      lot: lot1._id,
      evaluator: qGrader._id,
      sessionTitle: 'Specialty Q-Grader Baseline Certification',
      waterTempCelsius: 93.5,
      grindMicrons: 850,
      fragrance: 9.0,
      flavor: 9.0,
      aftertaste: 8.75,
      acidity: 9.0,
      body: 8.5,
      balance: 8.75,
      uniformity: 10.0,
      cleanCup: 10.0,
      sweetness: 10.0,
      overall: 8.75,
      totalScore: 89.25,
      classification: 'Excellent Specialty (85-89.99)',
      tastingNotes: ['Wild Bergamot', 'Jasmine Flower', 'Ripe Apricot', 'Golden Honeycomb'],
    });

    await CuppingSession.create({
      lot: lot2._id,
      evaluator: qGrader._id,
      sessionTitle: 'International Auction Calibration Cupping',
      waterTempCelsius: 94.0,
      grindMicrons: 840,
      fragrance: 9.5,
      flavor: 9.25,
      aftertaste: 9.0,
      acidity: 9.5,
      body: 8.75,
      balance: 9.0,
      uniformity: 10.0,
      cleanCup: 10.0,
      sweetness: 10.0,
      overall: 9.5,
      totalScore: 92.5,
      classification: 'Presidential Exemplar (90-100)',
      tastingNotes: ['Champagne Mango', 'Candied Meyer Lemon', 'Orange Blossom', 'White Tea'],
    });

    console.log('[Seed] Created Certified Cupping Sessions.');

    // 4. Create Orders across lifecycle
    const ord1 = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: buyerGold._id,
      roaster: roasterKaffa._id,
      batchLot: lot1._id,
      quantityKg: 35,
      unitPricePerKg: lot1.pricePerKg,
      subtotal: 35 * lot1.pricePerKg,
      tierDiscountPercent: 10,
      discountAmount: Math.round((35 * lot1.pricePerKg * 0.1) * 100) / 100,
      totalAmount: Math.round((35 * lot1.pricePerKg * 0.9) * 100) / 100,
      escrowStatus: 'dispatched',
      shippingAddress: {
        street: '820 NW 23rd Ave',
        city: 'Portland',
        state: 'OR',
        postalCode: '97210',
        country: 'USA',
      },
      trackingNumber: 'TRK-EXP-94021948',
      qualityCertificateHash: lot1.qrHash,
      milestones: [
        { status: 'escrow_held', note: 'Escrow payment locked in smart contract ledger', timestamp: new Date(Date.now() - 4 * 86400000) },
        { status: 'roasting_scheduled', note: 'Batch roast scheduled on Probat UG22 drum roaster', timestamp: new Date(Date.now() - 3 * 86400000) },
        { status: 'cupping_verified', note: 'Batch sensory check passed with 89.25 SCA verified score', timestamp: new Date(Date.now() - 2 * 86400000) },
        { status: 'dispatched', note: 'Degassed & vacuum nitrogen sealed, handed to DHL Express Air', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
    });

    const ord2 = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: buyerSilver._id,
      roaster: roasterKaffa._id,
      batchLot: lot2._id,
      quantityKg: 30,
      unitPricePerKg: lot2.pricePerKg,
      subtotal: 30 * lot2.pricePerKg,
      tierDiscountPercent: 5,
      discountAmount: Math.round((30 * lot2.pricePerKg * 0.05) * 100) / 100,
      totalAmount: Math.round((30 * lot2.pricePerKg * 0.95) * 100) / 100,
      escrowStatus: 'roasting_scheduled',
      shippingAddress: {
        street: '142 Haight St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94117',
        country: 'USA',
      },
      trackingNumber: 'TRK-EXP-11029384',
      qualityCertificateHash: lot2.qrHash,
      milestones: [
        { status: 'escrow_held', note: 'Escrow deposit verified and confirmed', timestamp: new Date(Date.now() - 2 * 86400000) },
        { status: 'roasting_scheduled', note: 'Profile calibration set to Nordic Filter protocol', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
    });

    const ord3 = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: buyerGold._id,
      roaster: roasterAntioquia._id,
      batchLot: lot3._id,
      quantityKg: 40,
      unitPricePerKg: lot3.pricePerKg,
      subtotal: 40 * lot3.pricePerKg,
      tierDiscountPercent: 10,
      discountAmount: Math.round((40 * lot3.pricePerKg * 0.1) * 100) / 100,
      totalAmount: Math.round((40 * lot3.pricePerKg * 0.9) * 100) / 100,
      escrowStatus: 'escrow_released',
      shippingAddress: {
        street: '820 NW 23rd Ave',
        city: 'Portland',
        state: 'OR',
        postalCode: '97210',
        country: 'USA',
      },
      trackingNumber: 'TRK-EXP-55910283',
      qualityCertificateHash: lot3.qrHash,
      milestones: [
        { status: 'escrow_held', note: 'Escrow payment locked', timestamp: new Date(Date.now() - 7 * 86400000) },
        { status: 'roasting_scheduled', note: 'Batch roast scheduled', timestamp: new Date(Date.now() - 6 * 86400000) },
        { status: 'cupping_verified', note: 'Cupping verified at 87.0 SCA', timestamp: new Date(Date.now() - 5 * 86400000) },
        { status: 'dispatched', note: 'Courier picked up package', timestamp: new Date(Date.now() - 4 * 86400000) },
        { status: 'delivered', note: 'Signed for by Julian Sterling at cafe warehouse', timestamp: new Date(Date.now() - 2 * 86400000) },
        { status: 'escrow_released', note: 'Buyer verified aroma & moisture, funds disbursed to Andean Craft', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
    });

    console.log('[Seed] Created Orders in various stages (dispatched, roasting_scheduled, escrow_released).');

    // 5. Create Audit Logs
    await AuditLog.create({
      action: 'PLATFORM_INITIALIZATION',
      user: adminUser._id,
      entityType: 'System',
      details: { environment: 'Production Ready', protocolVersion: 'SCA-2026-v2' },
    });
    await AuditLog.create({
      action: 'LOT_REGISTERED',
      user: roasterKaffa._id,
      entityType: 'BatchLot',
      entityId: lot1._id,
      details: { lotNumber: lot1.lotNumber, initialScore: 89.25 },
    });
    await AuditLog.create({
      action: 'ORDER_ESCROWED',
      user: buyerGold._id,
      entityType: 'Order',
      entityId: ord1._id,
      details: { orderNumber: ord1.orderNumber, amount: ord1.totalAmount },
    });

    console.log('[Seed] Database populated successfully! Ready for demo.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
