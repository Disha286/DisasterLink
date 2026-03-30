const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// SUBMIT SOS REQUEST
router.post('/submit', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { type, description, urgency, address, lat, lng } = req.body;

    const sos = new SOS({
      submittedBy: req.user.id,
      type,
      description,
      urgency,
      location: { address, lat, lng },
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await sos.save();

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    io.emit('new-sos', {
      id: sos._id,
      type: sos.type,
      urgency: sos.urgency,
      location: sos.location,
      status: sos.status,
      createdAt: sos.createdAt
    });

    res.status(201).json({ message: 'SOS request submitted', sos });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ALL SOS REQUESTS (NGO/admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const requests = await SOS.find()
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET MY SOS REQUESTS (victim)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const requests = await SOS.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE SOS STATUS
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: 'Status updated', sos });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;