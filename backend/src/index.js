require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./config/db');

const doctorAuthRoutes = require('./routes/doctor.auth.routes');
const patientAuthRoutes = require('./routes/patient.auth.routes');
const adminAuthRoutes = require('./routes/admin.auth.routes');
const superAdminAuthRoutes = require('./routes/super-admin.auth.routes');
const surveyRoutes = require('./routes/survey.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const planRoutes = require('./routes/plan.routes');
const patientRoutes = require('./routes/patient.routes');
const foodRoutes = require('./routes/food.routes');
const prakritiRoutes = require('./routes/prakriti.routes');
const chatRoutes = require('./routes/chat.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const prescriptionRoutes = require('./routes/prescription.routes');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`, req.body ? '- Body:' : '', req.body || '');
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth/doctor', doctorAuthRoutes);
app.use('/api/auth/patient', patientAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/auth/super-admin', superAdminAuthRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctor', doctorRoutes); // Add doctor-specific authenticated routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/prakriti', prakritiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces

// Start server only after DB connects
connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`API running on ${HOST}:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
      console.log(`Network access: http://10.202.243.27:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
