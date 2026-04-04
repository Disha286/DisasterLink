const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['food', 'water', 'medical', 'vehicle', 'shelter', 'other'],
    required: true
  },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'units' },
  lowStockThreshold: { type: Number, default: 10 },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  zone: { type: String },
  status: {
    type: String,
    enum: ['available', 'low', 'depleted'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);