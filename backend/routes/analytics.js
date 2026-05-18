const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const Volunteer = require('../models/Volunteer');
const Resource = require('../models/Resource');
const authMiddleware = require('../middleware/auth');

// GET analytics data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const allSOS = await SOS.find();
    const volunteers = await Volunteer.find();
    const resources = await Resource.find();

    // SOS by status
    const sosByStatus = {
      pending: allSOS.filter(s => s.status === 'pending').length,
      assigned: allSOS.filter(s => s.status === 'assigned').length,
      resolved: allSOS.filter(s => s.status === 'resolved').length,
    };

    // SOS by urgency
    const sosByUrgency = {
      critical: allSOS.filter(s => s.urgency === 'critical').length,
      high: allSOS.filter(s => s.urgency === 'high').length,
      medium: allSOS.filter(s => s.urgency === 'medium').length,
      low: allSOS.filter(s => s.urgency === 'low').length,
    };

    // SOS by type
    const typeMap = {};
    allSOS.forEach(s => {
      typeMap[s.type] = (typeMap[s.type] || 0) + 1;
    });
    const sosByType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // SOS by zone
    const zoneMap = {};
    allSOS.forEach(s => {
      const zone = s.location?.address || 'Unknown';
      zoneMap[zone] = (zoneMap[zone] || 0) + 1;
    });
    const sosByZone = Object.entries(zoneMap).map(([zone, count]) => ({ zone, count }));

    // Volunteer stats
    const volunteerStats = {
      total: volunteers.length,
      available: volunteers.filter(v => v.availability === 'available').length,
      deployed: volunteers.filter(v => v.availability === 'deployed').length,
      offline: volunteers.filter(v => v.availability === 'offline').length,
    };

    // Resource stats
    const resourceStats = resources.map(r => ({
      name: r.name,
      quantity: r.quantity,
      status: r.status,
      category: r.category,
    }));

    // SOS over time (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = allSOS.filter(s => new Date(s.createdAt) >= dayStart && new Date(s.createdAt) <= dayEnd).length;
      last7Days.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        requests: count
      });
    }

    res.json({
      sosByStatus, sosByUrgency, sosByType,
      sosByZone, volunteerStats, resourceStats, last7Days,
      totals: { sos: allSOS.length, volunteers: volunteers.length, resources: resources.length }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;