const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Merchant', merchantSchema);