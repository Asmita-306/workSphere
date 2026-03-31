import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { protect, authorizeRoles } from './middleware/auth.js';
import { User, Project, Task, Leave, Attendance, Facility, Feedback } from './models/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes (RBAC)
app.get('/api/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.get('/api/projects', protect, async (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = await Project.find({}).populate('managerId', 'name');
  } else if (req.user.role === 'manager') {
    projects = await Project.find({ managerId: req.user._id });
  } else {
    projects = await Project.find({ teamMembers: req.user._id });
  }
  res.json(projects);
});

app.post('/api/projects', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// Leave Routes
app.post('/api/leave', protect, async (req, res) => {
  const leave = await Leave.create({ ...req.body, employeeId: req.user._id });
  res.status(201).json(leave);
});

app.get('/api/leave/pending', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  let leaves;
  if (req.user.role === 'admin') {
    leaves = await Leave.find({ status: 'pending' }).populate('employeeId', 'name');
  } else {
    leaves = await Leave.find({ managerId: req.user._id, status: 'pending' }).populate('employeeId', 'name');
  }
  res.json(leaves);
});

app.put('/api/leave/:id', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  const leave = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(leave);
});

// Facility Booking
app.post('/api/facility', protect, async (req, res) => {
  const booking = await Facility.create({ ...req.body, userId: req.user._id });
  res.status(201).json(booking);
});

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
console.log("URI VALUE:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
