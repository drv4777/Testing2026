const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'merchant', 'customer'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);