const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const patientRoutes = require('./routes/patientRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Base Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital Management System API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/stats', statsRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
