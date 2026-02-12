const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  touristId: {
    type: String,
    required: true,
    index: true
  },
  touristName: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: ['panic', 'geo_fence', 'ai_anomaly', 'manual'],
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reason: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved'],
    default: 'pending'
  },
  assignedOfficer: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: Date
});

module.exports = mongoose.model('Alert', alertSchema);
