const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Alert = require('../models/Alert');
const Tourist = require('../models/Tourist');

// @route   POST /api/alerts/panic
// @desc    Create panic alert
// @access  Private (Tourist only)
router.post('/panic', protect, authorize('tourist'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist profile not found' });
    }

    const alert = await Alert.create({
      touristId: tourist.touristId,
      touristName: tourist.name,
      alertType: 'panic',
      riskScore: 100,
      reason: 'Emergency panic button activated by tourist',
      latitude,
      longitude
    });

    // Emit real-time alert
    const io = req.app.get('io');
    io.emit('new_alert', alert);

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error('Create panic alert error:', error);
    res.status(500).json({ success: false, message: 'Error creating panic alert' });
  }
});

// @route   GET /api/alerts
// @desc    Get alerts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // If tourist, only show their alerts
    if (req.user.role === 'tourist') {
      const tourist = await Tourist.findOne({ userId: req.user._id });
      if (tourist) {
        query.touristId = tourist.touristId;
      }
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching alerts' });
  }
});

// @route   PATCH /api/alerts/:alertId
// @desc    Update alert status
// @access  Private (Police/Tourism Officer only)
router.patch('/:alertId', protect, authorize('police', 'tourism_officer'), async (req, res) => {
  try {
    const { status, assignedOfficer } = req.body;

    const updateData = { status };
    if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      updateData,
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ success: false, message: 'Error updating alert' });
  }
});

module.exports = router;
