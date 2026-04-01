import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  department: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalLeaves: { type: Number, default: 24 },
  usedLeaves: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['planning', 'in-progress', 'completed'], default: 'planning' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String 
  }],
  progress: { type: Number, default: 0 },
  description: String,
  dueDate: { type: Date },
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  dueDate: { type: Date },
  contributionLog: [{ 
    message: String, 
    date: { type: Date, default: Date.now } 
  }],
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: String,
}, { timestamps: true });

export const Leave = mongoose.model('Leave', leaveSchema);

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);

const facilitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  type: { type: String, enum: ['seat', 'boardroom', 'conference'], required: true },
  name: { type: String, required: true }, 
  status: { type: String, enum: ['available', 'occupied', 'booked'], default: 'available' },
  bookingTime: {
    start: Date,
    end: Date
  }
}, { timestamps: true });

export const Facility = mongoose.model('Facility', facilitySchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);

const feedbackSchema = new mongoose.Schema({
  type: { type: String, enum: ['general', 'incident', 'suggestion'], required: true },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
