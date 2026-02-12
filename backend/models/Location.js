const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  touristId: {
    type: String,
    required: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for geospatial queries
locationSchema.index({ touristId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);
