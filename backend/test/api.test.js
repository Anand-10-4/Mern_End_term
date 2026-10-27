const assert = require('assert');
const { calculateScaScore, calculateRoastMetrics } = require('../utils/scaCalculator');
const { generateLotHash, generateOrderNumber } = require('../utils/tokenHelper');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

async function runTests() {
  console.log('--- [AmberRoast OS] Test Suite Execution Starting ---');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAILED: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAILED: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // Unit Test 1: SCA Cupping Score Calculation
  test('SCA Cupping Algorithm: Baseline 10-Attribute Score Calculation', () => {
    const perfectAttributes = {
      fragrance: 9.0,
      flavor: 9.0,
      aftertaste: 9.0,
      acidity: 9.0,
      body: 9.0,
      balance: 9.0,
      uniformity: 10.0,
      cleanCup: 10.0,
      sweetness: 10.0,
      overall: 9.0,
      defectCups: 0,
    };
    const result = calculateScaScore(perfectAttributes);
    assert.strictEqual(result.finalScore, 93.0);
    assert.strictEqual(result.grade, 'Presidential Exemplar (90-100)');
    assert.strictEqual(result.isSpecialtyGrade, true);
  });

  // Unit Test 2: Defect Deduction on Specialty Score
  test('SCA Cupping Algorithm: Defect Taint/Fault Penalty Deduction', () => {
    const taintedAttributes = {
      fragrance: 8.0,
      flavor: 8.0,
      aftertaste: 8.0,
      acidity: 8.0,
      body: 8.0,
      balance: 8.0,
      uniformity: 10.0,
      cleanCup: 10.0,
      sweetness: 10.0,
      overall: 8.0,
      defectCups: 2,
      defectIntensity: 4, // 2 cups x 4 = 8 pts defect
    };
    const result = calculateScaScore(taintedAttributes);
    // Raw sum = 86. Defect deduction = 8. Final = 78.
    assert.strictEqual(result.finalScore, 78.0);
    assert.strictEqual(result.isSpecialtyGrade, false);
    assert.strictEqual(result.grade, 'Commercial / Sub-Specialty');
  });

  // Unit Test 3: Roast Shrinkage Loss Calculation
  test('Roast Chemistry: Calculate green bean shrinkage percentage', () => {
    const metrics = calculateRoastMetrics(100, 85);
    assert.strictEqual(metrics.lossKg, 15);
    assert.strictEqual(metrics.shrinkagePercentage, 15);
    assert.strictEqual(metrics.efficiency, 85);
  });

  // Unit Test 4: Cryptographic Lot Hash Generation
  test('Cryptographic Seal: Deterministic SHA256 Lot Certificate Hash', () => {
    const hash1 = generateLotHash({
      lotNumber: 'LOT-TEST-001',
      origin: { country: 'Ethiopia', farmOrCoop: 'Yirgacheffe' },
      scaScore: 88.5,
      harvestDate: 1700000000000,
    });
    const hash2 = generateLotHash({
      lotNumber: 'LOT-TEST-001',
      origin: { country: 'Ethiopia', farmOrCoop: 'Yirgacheffe' },
      scaScore: 88.5,
      harvestDate: 1700000000000,
    });
    assert.ok(hash1.startsWith('AR-'));
    assert.strictEqual(hash1, hash2);
  });

  // Database Integration Tests
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amberroast_db';
  await mongoose.connect(mongoUri);

  const User = require('../models/User');
  const BatchLot = require('../models/BatchLot');
  const Order = require('../models/Order');

  await testAsync('Integration: Query seeded specialty users with password check', async () => {
    const roaster = await User.findOne({ email: 'roaster@amberroast.io' }).select('+password');
    assert.ok(roaster, 'Seeded roaster should exist');
    const valid = await roaster.comparePassword('password123');
    assert.strictEqual(valid, true, 'Password matching must succeed');
  });

  await testAsync('Integration: Expired reservation cleanup mechanics on BatchLot', async () => {
    const lot = await BatchLot.findOne({ lotNumber: 'LOT-ETH-2026-081' });
    assert.ok(lot);
    const initialAvailable = lot.availableKg;

    // Simulate an expired reservation
    lot.activeReservations.push({
      buyer: lot.roaster,
      buyerName: 'Test Buyer',
      amountKg: 10,
      reservedAt: new Date(Date.now() - 30 * 60 * 1000),
      expiresAt: new Date(Date.now() - 15 * 60 * 1000), // expired 15 mins ago
      reservationToken: 'RES-TEST-EXPIRED',
    });

    const restored = lot.cleanupExpiredReservations();
    assert.strictEqual(restored, 10, 'Should restore 10 kg back to available inventory');
    assert.strictEqual(lot.availableKg, initialAvailable + 10);
    assert.strictEqual(lot.activeReservations.length, 0, 'Expired reservation must be cleared');
  });

  await testAsync('Integration: Escrow Order state progression validation', async () => {
    const order = await Order.findOne({ escrowStatus: 'dispatched' });
    assert.ok(order, 'Seeded dispatched order must exist');
    assert.ok(order.milestones.length >= 4, 'Order must contain milestone audit entries');
    assert.strictEqual(order.milestones[0].status, 'escrow_held');
  });

  await mongoose.disconnect();

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed successfully!\n');
    process.exit(0);
  }
}

runTests();
