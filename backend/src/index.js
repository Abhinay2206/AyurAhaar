require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./config/db');

const doctorAuthRoutes = require('./routes/doctor.auth.routes');
const patientAuthRoutes = require('./routes/patient.auth.routes');
const adminAuthRoutes = require('./routes/admin.auth.routes');
const superAdminAuthRoutes = require('./routes/super-admin.auth.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth/doctor', doctorAuthRoutes);
app.use('/api/auth/patient', patientAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/auth/super-admin', superAdminAuthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 4000;

// Start server only after DB connects
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
