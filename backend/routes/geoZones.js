const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const GeoZone = require('../models/GeoZone');

// @route   POST /api/geo-zones
// @desc    Create geo zone
// @access  Private (Police/Tourism Officer only)
router.post('/', protect, authorize('police', 'tourism_officer'), async (req, res) => {
  try {
    const { name, riskLevel, centerLat, centerLng, radius, description } = req.body;

    const geoZone = await GeoZone.create({
      name,
      riskLevel,
      centerLat,
      centerLng,
      radius,
      description
    });

    res.status(201).json({ success: true, data: geoZone });
  } catch (error) {
    console.error('Create geo zone error:', error);
    res.status(500).json({ success: false, message: 'Error creating geo zone' });
  }
});

// @route   GET /api/geo-zones
// @desc    Get all geo zones
// @access  Public
router.get('/', async (req, res) => {
  try {
    const geoZones = await GeoZone.find().sort({ createdAt: -1 });
    res.json({ success: true, data: geoZones });
  } catch (error) {
    console.error('Get geo zones error:', error);
    res.status(500).json({ success: false, message: 'Error fetching geo zones' });
  }
});

module.exports = router;
