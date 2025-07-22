const mongoose = require('mongoose');

const gasSchema = new mongoose.Schema({
  gasValue: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  knobStatus: { type: String, enum: ['OPEN', 'CLOSED'], required: true },
});

module.exports = mongoose.model('Gas', gasSchema); 