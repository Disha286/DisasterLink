const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  zone: { type: String, required: true },
  type: {
    type: String,
    enum: ['alert', 'info', 'warning', 'evacuation'],
    default: 'info'
  },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', broadcastSchema);