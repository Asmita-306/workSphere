import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import {
  preferIpv4First,
  normalizePostgresUrl,
  parseConnectionInfoFromUrl
} from '../lib/dbUrl.js';

dotenv.config();
preferIpv4First();

function resolveSslEnabled() {
  const explicit = process.env.DB_SSL;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  const url = (process.env.DATABASE_URL || '').toLowerCase();
  const host = (process.env.DB_HOST || '').toLowerCase();
  const combined = `${url} ${host}`;

  const isLocalHost =
    /(^|@)(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url) ||
    /localhost|127\.0\.0\.1|^\[::1\]$/.test(host);
  if (isLocalHost) return false;

  if (/sslmode=require|sslmode=verify-full|sslmode=verify-ca/.test(url)) return true;

  if (
    /supabase\.co|pooler\.supabase|neon\.tech|render\.com|railway\.app|azure\.com|amazonaws\.com|cockroachlabs\.cloud|aiven\.io|elephantsql\.com/.test(
      combined
    )
  ) {
    return true;
  }

  return false;
}

const hasConnectionString = Boolean(process.env.DATABASE_URL);
const isSslEnabled = resolveSslEnabled();

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = hasConnectionString ? normalizePostgresUrl(rawDatabaseUrl) : null;
const parsedUrl = hasConnectionString ? parseConnectionInfoFromUrl(rawDatabaseUrl) : null;

const useIpv4 = process.env.DB_FORCE_IPV4 !== 'false';

function buildDialectOptions() {
  const opts = {};
  if (useIpv4) opts.family = 4;
  if (isSslEnabled) {
    opts.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
    opts.keepAlive = true;
  }
  return Object.keys(opts).length ? opts : undefined;
}

export const dbConnectionInfo = {
  usesConnectionString: hasConnectionString,
  ssl: isSslEnabled,
  host: parsedUrl?.host || process.env.DB_HOST || 'localhost',
  port: parsedUrl?.port || String(process.env.DB_PORT || 5432),
  database: parsedUrl?.database || process.env.DB_NAME || 'postgres',
  supabaseTransactionPooler: Boolean(parsedUrl?.isTransactionPooler)
};

const dialectOptions = buildDialectOptions();

const commonOptions = {
  dialect: 'postgres',
  dialectOptions,
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX || 5),
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  retry: {
    max: 2
  }
};

const sequelize = hasConnectionString
  ? new Sequelize(databaseUrl, {
      ...commonOptions,
      protocol: 'postgres',
      define: {
        underscored: false
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        ...commonOptions,
        define: {
          underscored: false
        }
      }
    );

/** DB column `_id` → JS property `id` (matches API + frontend). */
const uuidPk = () => ({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: '_id'
  }
});

const User = sequelize.define(
  'User',
  {
    ...uuidPk(),
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      defaultValue: 'employee'
    },
    department: { type: DataTypes.STRING, allowNull: false },
    totalLeaves: { type: DataTypes.INTEGER, defaultValue: 24 },
    usedLeaves: { type: DataTypes.INTEGER, defaultValue: 0 },
    managerId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Users' }
);

const Project = sequelize.define(
  'Project',
  {
    ...uuidPk(),
    name: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('planning', 'in-progress', 'completed'),
      defaultValue: 'planning'
    },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
    dueDate: { type: DataTypes.DATE },
    managerId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Projects' }
);

const ProjectMember = sequelize.define(
  'ProjectMember',
  {
    ProjectId: { type: DataTypes.UUID, primaryKey: true },
    UserId: { type: DataTypes.UUID, primaryKey: true },
    role: { type: DataTypes.STRING }
  },
  { tableName: 'ProjectMembers', id: false, timestamps: true }
);

const Task = sequelize.define(
  'Task',
  {
    ...uuidPk(),
    title: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: 'todo'
    },
    dueDate: { type: DataTypes.DATE },
    contributionLog: { type: DataTypes.JSONB, defaultValue: [] },
    projectId: { type: DataTypes.UUID, allowNull: true },
    assignedTo: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Tasks' }
);

const Leave = sequelize.define(
  'Leave',
  {
    ...uuidPk(),
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    reason: { type: DataTypes.TEXT },
    employeeId: { type: DataTypes.UUID, allowNull: true },
    managerId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Leaves' }
);

const Attendance = sequelize.define(
  'Attendance',
  {
    ...uuidPk(),
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false
    },
    userId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Attendances' }
);

const Feedback = sequelize.define(
  'Feedback',
  {
    ...uuidPk(),
    type: {
      type: DataTypes.ENUM('general', 'incident', 'suggestion'),
      allowNull: false
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Feedbacks' }
);

// Relationships (FK column names match Supabase schema)
User.hasMany(User, { as: 'Employees', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Project, { as: 'ManagedProjects', foreignKey: 'managerId' });
Project.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

Project.belongsToMany(User, {
  through: ProjectMember,
  as: 'TeamMembers',
  foreignKey: 'ProjectId',
  otherKey: 'UserId'
});
User.belongsToMany(Project, {
  through: ProjectMember,
  as: 'JoinedProjects',
  foreignKey: 'UserId',
  otherKey: 'ProjectId'
});

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedTo', as: 'AssignedTasks' });
Task.belongsTo(User, { as: 'AssignedTo', foreignKey: 'assignedTo' });

User.hasMany(Leave, { as: 'LeavesApplied', foreignKey: 'employeeId' });
Leave.belongsTo(User, { as: 'Employee', foreignKey: 'employeeId' });

User.hasMany(Leave, { as: 'LeavesManaged', foreignKey: 'managerId' });
Leave.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Feedback, { foreignKey: 'createdBy', as: 'FeedbacksCreated' });
Feedback.belongsTo(User, { as: 'CreatedBy', foreignKey: 'createdBy' });

export { sequelize, User, Project, ProjectMember, Task, Leave, Attendance, Feedback };
