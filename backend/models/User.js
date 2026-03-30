const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['victim', 'volunteer', 'ngo'],
    default: 'victim'
  },
  phone: {
    type: String
  },
  location: {
    type: String
  },
  skills: [String], // for volunteers
  organisation: {
    type: String    // for NGOs
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);