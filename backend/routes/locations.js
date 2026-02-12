const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Location = require('../models/Location');
const Tourist = require('../models/Tourist');
const Alert = require('../models/Alert');
const { calculateSafetyScore } = require('../utils/safetyScore');

// @route   POST /api/locations
// @desc    Create location entry
// @access  Private (Tourist only)
router.post('/', protect, authorize('tourist'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Get tourist profile
    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist profile not found' });
    }

    // Create location
    await Location.create({
      touristId: tourist.touristId,
      latitude,
      longitude
    });

    // Calculate new safety score
    const newScore = await calculateSafetyScore(tourist.touristId);
    tourist.safetyScore = newScore;
    await tourist.save();

    // Create alert if safety score is low
    if (newScore < 50) {
      const alert = await Alert.create({
        touristId: tourist.touristId,
        touristName: tourist.name,
        alertType: 'ai_anomaly',
        riskScore: newScore,
        reason: 'Low safety score detected by AI analysis',
        latitude,
        longitude
      });

      // Emit real-time alert via Socket.IO
      const io = req.app.get('io');
      io.emit('new_alert', alert);
    }

    res.json({ success: true, safetyScore: newScore });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ success: false, message: 'Error creating location' });
  }
});

// @route   GET /api/locations/tourist/:touristId
// @desc    Get locations for a tourist
// @access  Private
router.get('/tourist/:touristId', protect, async (req, res) => {
  try {
    const { touristId } = req.params;

    // Check authorization
    if (req.user.role === 'tourist') {
      const tourist = await Tourist.findOne({ userId: req.user._id });
      if (!tourist || tourist.touristId !== touristId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const locations = await Location.find({ touristId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ success: false, message: 'Error fetching locations' });
  }
});

module.exports = router;
