const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const Broadcast = require('../models/Broadcast');
const SOS = require('../models/SOS');
const Volunteer = require('../models/Volunteer');
const authMiddleware = require('../middleware/auth');

// GET dashboard overview
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [totalSOS, pendingSOS, resolvedSOS, volunteers, resources] = await Promise.all([
      SOS.countDocuments(),
      SOS.countDocuments({ status: 'pending' }),
      SOS.countDocuments({ status: 'resolved' }),
      Volunteer.countDocuments(),
      Resource.find()
    ]);
    const lowStock = resources.filter(r => r.quantity <= r.lowStockThreshold);
    res.json({ totalSOS, pendingSOS, resolvedSOS, totalVolunteers: volunteers, resources, lowStock });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESOURCE CRUD
router.get('/resources', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/resources', authMiddleware, async (req, res) => {
  try {
    const { name, category, quantity, unit, lowStockThreshold, zone } = req.body;
    const status = quantity <= lowStockThreshold ? (quantity === 0 ? 'depleted' : 'low') : 'available';
    const resource = new Resource({
      name, category, quantity, unit,
      lowStockThreshold, zone, status,
      managedBy: req.user.id
    });
    await resource.save();

    // Emit low stock alert
    if (status === 'low' || status === 'depleted') {
      const io = req.app.get('io');
      io.emit('low-stock-alert', { resource: resource.name, quantity, status });
    }

    res.status(201).json({ message: 'Resource added', resource });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/resources/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const newStatus = quantity <= 0 ? 'depleted' : quantity <= resource.lowStockThreshold ? 'low' : 'available';
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: newStatus },
      { new: true }
    );

    // Emit low stock alert
    if (newStatus === 'low' || newStatus === 'depleted') {
      const io = req.app.get('io');
      io.emit('low-stock-alert', { resource: updated.name, quantity, status: newStatus });
    }

    res.json({ message: 'Resource updated', resource: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/resources/:id', authMiddleware, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// BROADCAST
router.post('/broadcast', authMiddleware, async (req, res) => {
  try {
    const { title, message, zone, type } = req.body;
    const broadcast = new Broadcast({
      title, message, zone, type, sentBy: req.user.id
    });
    await broadcast.save();

    // Emit real-time broadcast
    const io = req.app.get('io');
    io.emit('broadcast', { title, message, zone, type, createdAt: broadcast.createdAt });

    res.status(201).json({ message: 'Broadcast sent', broadcast });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/broadcasts', authMiddleware, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate('sentBy', 'name')
      .sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all SOS requests
router.get('/sos', authMiddleware, async (req, res) => {
  try {
    const requests = await SOS.find()
      .populate('submittedBy', 'name phone')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all volunteers
router.get('/volunteers', authMiddleware, async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('user', 'name email phone location');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;