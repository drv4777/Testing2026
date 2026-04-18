const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  apiKey: { type: String, required: true, unique: true, trim: true },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  webhookUrl: {
    type: String,
    trim: true,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Merchant', merchantSchema);