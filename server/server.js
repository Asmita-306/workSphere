import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, User, Project, ProjectMember, Task, Leave, Attendance, Feedback } from './models/index.js';
import authRoutes from './routes/auth.js';
import { protect, authorizeRoles } from './middleware/auth.js';
import { Op } from 'sequelize';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes (RBAC)
app.get('/api/users', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/projects', protect, async (req, res) => {
  try {
    const include = [
      { model: User, as: 'Manager', attributes: ['name', 'email'] },
      { model: User, as: 'TeamMembers', attributes: ['id', 'name', 'role'], through: { attributes: ['role'] } }
    ];

    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.findAll({ include });
    } else if (req.user.role === 'manager') {
      projects = await Project.findAll({ where: { managerId: req.user.id }, include });
    } else {
      // Find projects where the user is a team member
      projects = await Project.findAll({
        include: [
          { model: User, as: 'Manager', attributes: ['name', 'email'] },
          { 
            model: User, 
            as: 'TeamMembers', 
            attributes: ['id', 'name', 'role'],
            through: { attributes: ['role'] }
          }
        ],
        where: {
          [Op.or]: [
            { managerId: req.user.id },
            { '$TeamMembers.id$': req.user.id }
          ]
        }
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
    const project = await Project.create({
      ...projectData,
      managerId: projectData.managerId || req.user.id
    });
    
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        await ProjectMember.create({
          ProjectId: project.id,
          UserId: member.user,
          role: member.role
        });
      }
    }
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Task Endpoints
app.post('/api/tasks', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedToId: req.body.assignedToId || req.body.assignedTo,
      projectId: parseInt(req.body.projectId)
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [{ model: User, as: 'AssignedTo', attributes: ['name'] }]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks/my', protect, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedToId: req.user.id },
      include: [{ model: Project, attributes: ['name'] }]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update({ status: req.body.status });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attendance Routes
app.post('/api/attendance/checkin', protect, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const existing = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [todayStart, todayEnd] }
      }
    });

    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const attendance = await Attendance.create({
      userId: req.user.id,
      status: req.body.status || 'present',
      date: new Date()
    });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/attendance', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: ['id', 'name', 'role', 'department']
    });

    const attendance = await Attendance.findAll({
      where: { date: { [Op.between]: [todayStart, todayEnd] } }
    });

    const report = users.map(user => {
      const record = attendance.find(a => a.userId === user.id);
      return {
        ...user.toJSON(),
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
    const attendance = await Attendance.findAll({
      where: { userId: req.user.id },
      order: [['date', 'ASC']]
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leave Routes
app.post('/api/leave', protect, async (req, res) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      employeeId: req.user.id
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leave/my', protect, async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { employeeId: req.user.id },
      include: [{ model: User, as: 'Manager', attributes: ['name'] }]
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leave/pending', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    let leaves;
    const include = [{ model: User, as: 'Employee', attributes: ['name'] }];
    if (req.user.role === 'admin') {
      leaves = await Leave.findAll({ where: { status: 'pending' }, include });
    } else {
      leaves = await Leave.findAll({ where: { managerId: req.user.id, status: 'pending' }, include });
    }
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/leave/:id', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    
    if (req.body.status === 'approved' && leave.status !== 'approved') {
      const diffTime = Math.abs(new Date(leave.endDate) - new Date(leave.startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const employee = await User.findByPk(leave.employeeId);
      await employee.increment('usedLeaves', { by: diffDays });
    }
    
    let reason = leave.reason;
    if (req.body.rejectionComment) {
      reason = `${reason} | Manager Comment: ${req.body.rejectionComment}`;
    }

    await leave.update({ status: req.body.status, reason });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Feedback Routes
app.post('/api/feedback', protect, async (req, res) => {
  try {
    const feedback = await Feedback.create({ ...req.body, createdById: req.user.id });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/feedback', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{ model: User, as: 'CreatedBy', attributes: ['name', 'role', 'department'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/stats', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalEmployees = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const activeProjects = await Project.count({ where: { status: 'in-progress' } });
    const tasksDone = await Task.count({ where: { status: 'done' } });
    const totalTasks = await Task.count();
    
    res.json({
      totalEmployees,
      activeProjects,
      taskCompletionRate: totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/attendance/:userId', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      where: { userId: req.params.userId },
      order: [['date', 'DESC']]
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/projects/:id', protect, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.update(req.body);
    res.json(project);
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

sequelize.sync()
  .then(() => {
    console.log('PostgreSQL (Supabase) Database Synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Unable to connect to the database:', err));
