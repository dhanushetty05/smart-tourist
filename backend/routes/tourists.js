const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { protect, authorize } = require('../middleware/auth');
const Tourist = require('../models/Tourist');

// @route   POST /api/tourists
// @desc    Create tourist profile
// @access  Private (Tourist only)
router.post('/', protect, authorize('tourist'), async (req, res) => {
  try {
    const { name, passportNumber, entryDate, exitDate, emergencyContact, photoUrl } = req.body;

    // Validate required fields
    if (!name || !passportNumber || !entryDate || !exitDate || !emergencyContact) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, passportNumber, entryDate, exitDate, emergencyContact' 
      });
    }

    // Check if tourist profile already exists
    const existing = await Tourist.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tourist profile already exists' });
    }

    // Generate tourist ID
    const touristId = 'TID' + crypto.randomBytes(5).toString('hex').toUpperCase();

    // Create passport hash
    const passportHash = crypto.createHash('sha256').update(passportNumber.toString()).digest('hex');

    // Generate blockchain hash
    const blockchainData = `${passportNumber}${passportHash}${Date.now()}`;
    const blockchainHash = crypto.createHash('sha256').update(blockchainData).digest('hex');

    // Create tourist
    const tourist = await Tourist.create({
      touristId,
      userId: req.user._id,
      name,
      passportNumber,
      passportHash,
      entryDate,
      exitDate,
      emergencyContact,
      photoUrl,
      blockchainHash
    });

    // Generate QR code
    const qrData = `TOURIST_ID:${tourist.touristId}|NAME:${tourist.name}|BLOCKCHAIN:${blockchainHash.substring(0, 16)}`;
    const qrCode = await QRCode.toDataURL(qrData);
    
    tourist.qrCode = qrCode;
    await tourist.save();

    res.status(201).json({ success: true, data: tourist });
  } catch (error) {
    console.error('Create tourist error:', error);
    res.status(500).json({ success: false, message: 'Error creating tourist profile' });
  }
});

// @route   GET /api/tourists/me
// @desc    Get current user's tourist profile
// @access  Private (Tourist only)
router.get('/me', protect, authorize('tourist'), async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id });
    
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist profile not found' });
    }

    res.json({ success: true, data: tourist });
  } catch (error) {
    console.error('Get tourist profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching tourist profile' });
  }
});

// @route   GET /api/tourists/:touristId
// @desc    Get tourist by ID
// @access  Private (Police/Tourism Officer only)
router.get('/:touristId', protect, authorize('police', 'tourism_officer'), async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ touristId: req.params.touristId });
    
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist not found' });
    }

    res.json({ success: true, data: tourist });
  } catch (error) {
    console.error('Get tourist error:', error);
    res.status(500).json({ success: false, message: 'Error fetching tourist' });
  }
});

// @route   GET /api/tourists
// @desc    Get all active tourists
// @access  Private (Police/Tourism Officer only)
router.get('/', protect, authorize('police', 'tourism_officer'), async (req, res) => {
  try {
    const tourists = await Tourist.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: tourists });
  } catch (error) {
    console.error('Get tourists error:', error);
    res.status(500).json({ success: false, message: 'Error fetching tourists' });
  }
});

// @route   GET /api/tourists/verify/:touristId
// @desc    Verify tourist blockchain hash
// @access  Public
router.get('/verify/:touristId', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ touristId: req.params.touristId });
    
    if (!tourist) {
      return res.json({ verified: false, message: 'Tourist ID not found' });
    }

    res.json({
      verified: true,
      touristId: tourist.touristId,
      name: tourist.name,
      status: tourist.status,
      entryDate: tourist.entryDate,
      exitDate: tourist.exitDate
    });
  } catch (error) {
    console.error('Verify tourist error:', error);
    res.status(500).json({ success: false, message: 'Error verifying tourist' });
  }
});

module.exports = router;
