const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/config/database');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load('./swagger.yaml');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Hostel Management API is running',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs',
    timestamp: new Date().toISOString()
  });
});

const authRoutes = require('./src/routes/auth');
const bookingRoutes = require('./src/routes/bookings');
const hostelRoutes = require('./src/routes/hostels');
const amenityRoutes = require('./src/routes/amenities');
const mealRoutes = require('./src/routes/meals');
const complaintRoutes = require('./src/routes/complaints');
const maintenanceRoutes = require('./src/routes/maintenance');
const guestRoutes = require('./src/routes/guests');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/hostels', hostelRoutes);
app.use('/api/v1/amenities', amenityRoutes);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/guests', guestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Visit: http://localhost:${PORT}`);
});