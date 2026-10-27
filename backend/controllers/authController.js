const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/tokenHelper');

// @desc    Register a new customer or staff member
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists at GoldenCrust',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '+1 (555) 234-5678',
      loyaltyPoints: 50, // Welcome gift: 50 points
      address: address || {
        street: '45 Artisan Way, Apt 3B',
        city: 'Sunnyvale',
        state: 'CA',
        postalCode: '94086',
      },
    });

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'USER_REGISTERED',
      user: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, email: user.email },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! 50 Loyalty Points credited.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password does not match',
      });
    }

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'USER_LOGIN',
      user: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
    });

    res.status(200).json({
      success: true,
      message: 'Welcome back to GoldenCrust Bakery!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
