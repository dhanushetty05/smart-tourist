const mongoose = require('mongoose');
const crypto = require('crypto');

const touristSchema = new mongoose.Schema({
  touristId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  passportNumber: {
    type: String,
    required: true
  },
  passportHash: {
    type: String,
    required: true
  },
  entryDate: {
    type: Date,
    required: true
  },
  exitDate: {
    type: Date,
    required: true
  },
  emergencyContact: {
    type: String,
    required: true
  },
  photoUrl: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'flagged'],
    default: 'active'
  },
  blockchainHash: {
    type: String,
    required: true
  },
  safetyScore: {
    type: Number,
    default: 85.0,
    min: 0,
    max: 100
  },
  qrCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate tourist ID before saving
touristSchema.pre('save', function(next) {
  if (!this.touristId) {
    this.touristId = 'TID' + crypto.randomBytes(5).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Tourist', touristSchema);
