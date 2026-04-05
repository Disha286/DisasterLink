const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const authMiddleware = require('../middleware/auth');

// Get chat history for a room
router.get('/:room', authMiddleware, async (req, res) => {
  try {
    const messages = await Chat.find({ room: req.params.room })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Save a message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, room, receiver } = req.body;
    const chat = new Chat({
      sender: req.user.id,
      receiver, message, room
    });
    await chat.save();
    await chat.populate('sender', 'name role');

    // Emit via socket
    const io = req.app.get('io');
    io.to(room).emit('new-message', chat);

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;