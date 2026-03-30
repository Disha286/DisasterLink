const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('DisasterLink API running'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));