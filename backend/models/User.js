const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['roaster', 'buyer', 'qgrader', 'admin'],
      default: 'buyer',
    },
    company: {
      type: String,
      default: 'Independent Craft Laboratory',
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold Reserve'],
      default: 'Standard',
    },
    allocationQuotaKg: {
      type: Number,
      default: 500, // Monthly wholesale limit
    },
    usedQuotaKg: {
      type: Number,
      default: 0,
    },
    badgeNumber: {
      type: String,
      default: function() {
        return 'AR-' + Math.floor(100000 + Math.random() * 900000);
      }
    },
    isVerified: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON representation
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
