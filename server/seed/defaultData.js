import bcrypt from 'bcryptjs';
import {
  User,
  Project,
  ProjectMember,
  Task,
  Leave,
  Attendance,
  Feedback
} from '../models/index.js';

/**
 * Idempotent sample data for demos (skipped if any user already exists).
 */
export async function seedDefaultData() {
  const existingUsers = await User.count();
  if (existingUsers > 0) {
    console.log('Seed skipped: Users table already has data.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password', 10);

  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    department: 'Administration'
  });

  const manager = await User.create({
    name: 'Project Manager',
    email: 'manager@example.com',
    password: hashedPassword,
    role: 'manager',
    department: 'Engineering'
  });

  const employeeA = await User.create({
    name: 'Alice Employee',
    email: 'alice@example.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Engineering',
    managerId: manager.id
  });

  const employeeB = await User.create({
    name: 'Bob Employee',
    email: 'bob@example.com',
    password: hashedPassword,
    role: 'employee',
    department: 'Design',
    managerId: manager.id
  });

  const projectA = await Project.create({
    name: 'Website Revamp',
    status: 'in-progress',
    progress: 45,
    description: 'Refresh the company website for better UX and performance.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    managerId: manager.id
  });

  const projectB = await Project.create({
    name: 'HR Automation',
    status: 'planning',
    progress: 15,
    description: 'Build internal automation for leave and attendance workflows.',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    managerId: manager.id
  });

  await ProjectMember.bulkCreate([
    { ProjectId: projectA.id, UserId: employeeA.id, role: 'developer' },
    { ProjectId: projectA.id, UserId: employeeB.id, role: 'designer' },
    { ProjectId: projectB.id, UserId: employeeA.id, role: 'developer' }
  ]);

  await Task.bulkCreate([
    {
      title: 'Build landing page',
      status: 'in-progress',
      projectId: projectA.id,
      assignedTo: employeeA.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Finalize UI mockups',
      status: 'todo',
      projectId: projectA.id,
      assignedTo: employeeB.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Define leave workflow',
      status: 'done',
      projectId: projectB.id,
      assignedTo: employeeA.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ]);

  await Leave.create({
    employeeId: employeeA.id,
    managerId: manager.id,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    reason: 'Family event',
    status: 'pending'
  });

  await Attendance.bulkCreate([
    { userId: manager.id, status: 'present', date: new Date() },
    { userId: employeeA.id, status: 'present', date: new Date() },
    { userId: employeeB.id, status: 'late', date: new Date() }
  ]);

  await Feedback.create({
    type: 'suggestion',
    message: 'A dark mode option on dashboards would be very helpful.',
    createdBy: employeeB.id
  });

  console.log('Default seed data inserted.');
}
