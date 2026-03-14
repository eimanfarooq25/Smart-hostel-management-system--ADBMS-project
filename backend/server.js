const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Hostel Management API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./src/routes/auth');
const bookingRoutes = require('./src/routes/bookings');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});