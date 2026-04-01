import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import config from './prisma.config.cjs';
import authRoutes from './routes/auth.js';
import { protect, authorizeRoles } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient(config);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes (RBAC)
app.get('/api/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        totalLeaves: true,
        usedLeaves: true
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/projects', protect, async (req, res) => {
  try {
    let projects;
    const include = {
      manager: { select: { name: true, email: true } },
      teamMembers: { include: { user: { select: { name: true, role: true } } } }
    };

    if (req.user.role === 'admin') {
      projects = await prisma.project.findMany({ include });
    } else if (req.user.role === 'manager') {
      projects = await prisma.project.findMany({
        where: { managerId: req.user.id },
        include
      });
    } else {
      projects = await prisma.project.findMany({
        where: { teamMembers: { some: { userId: req.user.id } } },
        include
      });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/projects', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { teamMembers, ...projectData } = req.body;
    const project = await prisma.project.create({
      data: {
        ...projectData,
        teamMembers: {
          create: teamMembers?.map(m => ({ userId: m.user, role: m.role })) || []
        }
      }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attendance Routes
app.get('/api/admin/attendance', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const users = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: { id: true, name: true, role: true, department: true }
    });

    const attendance = await prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow } }
    });

    const report = users.map(user => {
      const record = attendance.find(a => a.userId === user.id);
      return {
        ...user,
        status: record ? record.status : 'absent'
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/attendance/my', protect, async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' }
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leave Routes
app.post('/api/leave', protect, async (req, res) => {
  try {
    const leave = await prisma.leave.create({
      data: {
        ...req.body,
        employeeId: req.user.id,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
      }
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leave/my', protect, async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: { employeeId: req.user.id },
      include: { manager: { select: { name: true } } }
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leave/pending', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    let leaves;
    const include = { employee: { select: { name: true } } };
    if (req.user.role === 'admin') {
      leaves = await prisma.leave.findMany({ where: { status: 'pending' }, include });
    } else {
      leaves = await prisma.leave.findMany({ 
        where: { managerId: req.user.id, status: 'pending' }, 
        include 
      });
    }
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/leave/:id', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const leave = await prisma.leave.findUnique({ where: { id } });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    
    if (req.body.status === 'approved' && leave.status !== 'approved') {
      const diffTime = Math.abs(new Date(leave.endDate) - new Date(leave.startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      await prisma.user.update({
        where: { id: leave.employeeId },
        data: { usedLeaves: { increment: diffDays } }
      });
    }
    
    let reason = leave.reason;
    if (req.body.rejectionComment) {
      reason = `${reason} | Manager Comment: ${req.body.rejectionComment}`;
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: { status: req.body.status, reason }
    });
    res.json(updatedLeave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Feedback Routes
app.post('/api/feedback', protect, async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({
      data: { ...req.body, createdById: req.user.id }
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/feedback', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { createdBy: { select: { name: true, role: true, department: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tasks
app.post('/api/tasks', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(req.params.projectId) },
      include: { assignedTo: { select: { name: true } } }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
