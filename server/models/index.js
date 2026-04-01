import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Connect directly to Supabase via the Connection String
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false // Keep the console clean
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'manager', 'employee'), defaultValue: 'employee' },
  department: { type: DataTypes.STRING, allowNull: false },
  totalLeaves: { type: DataTypes.INTEGER, defaultValue: 24 },
  usedLeaves: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Project = sequelize.define('Project', {
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('planning', 'in-progress', 'completed'), defaultValue: 'planning' },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  dueDate: { type: DataTypes.DATE }
});

const ProjectMember = sequelize.define('ProjectMember', {
  role: { type: DataTypes.STRING }
});

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('todo', 'in-progress', 'done'), defaultValue: 'todo' },
  dueDate: { type: DataTypes.DATE }
});

const Leave = sequelize.define('Leave', {
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  reason: { type: DataTypes.TEXT }
});

const Attendance = sequelize.define('Attendance', {
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('present', 'absent', 'late'), allowNull: false }
});

const Feedback = sequelize.define('Feedback', {
  type: { type: DataTypes.ENUM('general', 'incident', 'suggestion'), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
});

// Relationships
User.hasMany(User, { as: 'Employees', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Project, { as: 'ManagedProjects', foreignKey: 'managerId' });
Project.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

Project.belongsToMany(User, { through: ProjectMember, as: 'TeamMembers' });
User.belongsToMany(Project, { through: ProjectMember, as: 'JoinedProjects' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedToId' });
Task.belongsTo(User, { as: 'AssignedTo', foreignKey: 'assignedToId' });

User.hasMany(Leave, { as: 'LeavesApplied', foreignKey: 'employeeId' });
Leave.belongsTo(User, { as: 'Employee', foreignKey: 'employeeId' });

User.hasMany(Leave, { as: 'LeavesManaged', foreignKey: 'managerId' });
Leave.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Feedback, { foreignKey: 'createdById' });
Feedback.belongsTo(User, { as: 'CreatedBy', foreignKey: 'createdById' });

export { sequelize, User, Project, ProjectMember, Task, Leave, Attendance, Feedback };
