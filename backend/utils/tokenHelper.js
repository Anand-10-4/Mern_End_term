const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'goldencrust_artisan_bakery_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GC-${dateStr}-${random}`;
};

module.exports = {
  generateToken,
  generateOrderNumber,
};
