const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'amber_roast_specialty_secret_key_2026_jwt_token',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateLotHash = (lotData) => {
  const payload = `${lotData.lotNumber}-${lotData.origin?.country}-${lotData.origin?.farmOrCoop}-${lotData.scaScore}-${lotData.harvestDate || Date.now()}`;
  return 'AR-' + crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16).toUpperCase();
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

module.exports = {
  generateToken,
  generateLotHash,
  generateOrderNumber,
};
