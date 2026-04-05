const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  room: { type: String, required: true },
  type: { type: String, enum: ['direct', 'broadcast'], default: 'direct' }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);