const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Tourist = require('../models/Tourist');
const Alert = require('../models/Alert');
const GeoZone = require('../models/GeoZone');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Police/Tourism Officer only)
router.get('/dashboard', protect, authorize('police', 'tourism_officer'), async (req, res) => {
  try {
    // Total active tourists
    const totalTourists = await Tourist.countDocuments({ status: 'active' });

    // Active alerts
    const activeAlerts = await Alert.countDocuments({ status: 'pending' });

    // Recent alerts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAlerts = await Alert.find({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Alerts per day
    const alertsPerDay = {};
    recentAlerts.forEach(alert => {
      const date = alert.createdAt.toISOString().split('T')[0];
      alertsPerDay[date] = (alertsPerDay[date] || 0) + 1;
    });

    // High-risk zones count
    const highRiskZonesCount = await GeoZone.countDocuments({ riskLevel: 'high' });

    // Average response time (mock for now)
    const avgResponseTime = 12.5;

    res.json({
      success: true,
      data: {
        totalTourists,
        activeAlerts,
        alertsPerDay,
        highRiskZonesCount,
        avgResponseTimeMinutes: avgResponseTime
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

module.exports = router;
