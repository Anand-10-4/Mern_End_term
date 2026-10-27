const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/tokenHelper');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, tier } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists in AmberRoast OS',
      });
    }

    const quotaKg = tier === 'Gold Reserve' ? 2000 : tier === 'Silver' ? 1000 : 500;

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
      company: company || 'Specialty Artisans Collective',
      tier: tier || 'Standard',
      allocationQuotaKg: quotaKg,
    });

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'USER_REGISTERED',
      user: user._id,
      entityType: 'User',
      entityId: user._id,
      details: { role: user.role, email: user.email, company: user.company },
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully registered on AmberRoast OS',
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
        message: 'Invalid credentials: No account associated with this email',
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
      message: 'Authentication successful',
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
    const { name, company, tier } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (company) user.company = company;
    if (tier) {
      user.tier = tier;
      user.allocationQuotaKg = tier === 'Gold Reserve' ? 2000 : tier === 'Silver' ? 1000 : 500;
    }

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

// @desc    Get all users (directory)
// @route   GET /api/auth/users
// @access  Private
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
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
  getAllUsers,
};
