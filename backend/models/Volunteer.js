const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    enum: ['medical', 'driving', 'cooking', 'rescue', 'communication', 'engineering', 'other']
  }],
  availability: {
    type: String,
    enum: ['available', 'deployed', 'offline'],
    default: 'available'
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOS'
  }],
  completedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOS'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);