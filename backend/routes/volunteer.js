const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const SOS = require('../models/SOS');
const authMiddleware = require('../middleware/auth');

// REGISTER as volunteer (create profile)
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { skills, lat, lng, address } = req.body;

    const existing = await Volunteer.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ message: 'Volunteer profile already exists' });

    const volunteer = new Volunteer({
      user: req.user.id,
      skills,
      currentLocation: { lat, lng, address }
    });

    await volunteer.save();
    res.status(201).json({ message: 'Volunteer profile created', volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my volunteer profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id })
      .populate('assignedTasks')
      .populate('completedTasks');
    if (!volunteer) return res.status(404).json({ message: 'Profile not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// TOGGLE availability
router.patch('/availability', authMiddleware, async (req, res) => {
  try {
    const { availability } = req.body;
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user.id },
      { availability },
      { new: true }
    );
    res.json({ message: 'Availability updated', volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// AUTO-MATCH — get nearby SOS requests matching volunteer skills
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id });
    if (!volunteer) return res.status(404).json({ message: 'Profile not found' });

    // Get pending SOS requests, sorted by urgency
    const urgencyOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    const requests = await SOS.find({ status: 'pending' })
      .populate('submittedBy', 'name phone');

    // Sort by urgency
    requests.sort((a, b) => (urgencyOrder[a.urgency] || 5) - (urgencyOrder[b.urgency] || 5));

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ASSIGN task to volunteer
router.patch('/assign/:sosId', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { assignedTasks: req.params.sosId }, availability: 'deployed' },
      { new: true }
    );
    await SOS.findByIdAndUpdate(req.params.sosId, {
      status: 'assigned',
      assignedTo: req.user.id
    });
    res.json({ message: 'Task assigned', volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// COMPLETE task
router.patch('/complete/:sosId', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user.id },
      {
        $pull: { assignedTasks: req.params.sosId },
        $addToSet: { completedTasks: req.params.sosId }
      },
      { new: true }
    );
    await SOS.findByIdAndUpdate(req.params.sosId, { status: 'resolved' });
    res.json({ message: 'Task completed', volunteer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all volunteers (NGO view)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('user', 'name email phone location');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;