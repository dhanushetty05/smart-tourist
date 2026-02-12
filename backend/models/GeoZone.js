const mongoose = require('mongoose');

const geoZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  centerLat: {
    type: Number,
    required: true
  },
  centerLng: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GeoZone', geoZoneSchema);
