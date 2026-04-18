const mongoose = require('mongoose');

const testCardSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: 'visa',
      trim: true,
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    last4: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4,
    },
    expMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expYear: {
      type: Number,
      required: true,
      min: 2000,
    },
    cvv: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'expired'],
      default: 'active',
      index: true,
    },
    holderName: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestCard', testCardSchema);