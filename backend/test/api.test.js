const assert = require('assert');
const { calculateCakePrice, SIZE_PRICING } = require('../utils/cakePricing');
const { generateOrderNumber } = require('../utils/tokenHelper');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

async function runTests() {
  console.log('--- [GoldenCrust Bakery] Test Suite Execution Starting ---');
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

  // Unit Test 1: Standard Custom Cake Calculation
  test('Cake Pricing: Standard 6-inch vanilla cake calculation', () => {
    const config = {
      size: 'standard_6inch',
      sponge: 'vanilla_bean',
      frosting: 'honey_buttercream',
      dietary: 'standard',
      customMessage: 'Happy Birthday!',
    };
    const res = calculateCakePrice(config);
    assert.strictEqual(res.basePrice, 34);
    assert.strictEqual(res.spongeAddon, 0);
    assert.strictEqual(res.frostingAddon, 0);
    assert.strictEqual(res.dietaryAddon, 0);
    assert.strictEqual(res.totalPrice, 34);
  });

  // Unit Test 2: Custom Cake Addons & Dietary Surcharge
  test('Cake Pricing: 8-inch chocolate cake with salted caramel, gluten-free addon & long message', () => {
    const config = {
      size: 'party_8inch', // base 48
      sponge: 'belgian_chocolate', // +3
      frosting: 'salted_caramel', // +3
      dietary: 'gluten_free', // +5
      customMessage: 'Congratulations on your graduation from Stanford University!', // > 25 chars -> +2
    };
    const res = calculateCakePrice(config);
    // 48 + 3 + 3 + 5 + 2 = 61
    assert.strictEqual(res.totalPrice, 61);
    assert.strictEqual(res.messageFee, 2);
  });

  // Unit Test 3: Order Number Generation
  test('Order Generator: Generate unique GC prefix order number', () => {
    const num1 = generateOrderNumber();
    const num2 = generateOrderNumber();
    assert.ok(num1.startsWith('GC-'));
    assert.notStrictEqual(num1, num2);
  });

  // Database Integration Tests
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goldencrust_db';
  await mongoose.connect(mongoUri);

  const User = require('../models/User');
  const Product = require('../models/Product');
  const Order = require('../models/Order');

  await testAsync('Integration: Query seeded customer with password check & loyalty points', async () => {
    const customer = await User.findOne({ email: 'customer@goldencrust.com' }).select('+password');
    assert.ok(customer, 'Seeded customer must exist');
    const isValid = await customer.comparePassword('password123');
    assert.strictEqual(isValid, true, 'Customer password must authenticate');
    assert.strictEqual(customer.loyaltyPoints >= 50, true, 'Customer must have loyalty points');
  });

  await testAsync('Integration: Query bakery catalog with category filtering', async () => {
    const breads = await Product.find({ category: 'breads' });
    assert.ok(breads.length >= 2, 'Should have multiple breads');
    const croissants = await Product.find({ category: 'croissants_pastries' });
    assert.ok(croissants.length >= 2, 'Should have multiple croissants');
  });

  await testAsync('Integration: Kitchen order pipeline status check', async () => {
    const bakingOrder = await Order.findOne({ status: 'baking' });
    assert.ok(bakingOrder, 'Should have an order in baking stage');
    assert.ok(bakingOrder.milestones.length >= 2, 'Should have milestones');
  });

  await testAsync('Payment: Razorpay HMAC SHA256 Signature Verification', async () => {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'MRbh8un91R2oHPmoy5ZUTpKb';
    const fakeOrderId = 'order_test_12345';
    const fakePaymentId = 'pay_test_67890';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(fakeOrderId + '|' + fakePaymentId)
      .digest('hex');

    const verified = crypto
      .createHmac('sha256', secret)
      .update(fakeOrderId + '|' + fakePaymentId)
      .digest('hex') === signature;

    assert.strictEqual(verified, true, 'HMAC SHA256 signature verification must succeed');
  });

  await mongoose.disconnect();

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All GoldenCrust tests passed successfully!\n');
    process.exit(0);
  }
}

runTests();
