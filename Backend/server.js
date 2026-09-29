const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const membershipPlanRoutes = require('./routes/membershipPlanRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const workoutPlanExerciseRoutes = require('./routes/workoutPlanExerciseRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/membership-plans', membershipPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/workout-plan-exercises', workoutPlanExerciseRoutes);
app.use('/api/workout-logs', workoutLogRoutes);
app.use('/api/attendance', attendanceRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('FitSync Backend is Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});
