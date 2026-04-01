import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Auth/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEmployees from './pages/Admin/Employees';
import AdminProjects from './pages/Admin/Projects';
import AdminAttendance from './pages/Admin/Attendance';
import AdminFeedback from './pages/Admin/Feedback';

// Manager Pages
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerTeams from './pages/Manager/Teams';
import ManagerProjects from './pages/Manager/Projects';

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeProjects from './pages/Employee/Projects';
import EmployeeTasks from './pages/Employee/Tasks';
import EmployeeAttendance from './pages/Employee/Attendance';
import EmployeeFeedback from './pages/Employee/Feedback';

// Shared Pages
import Leaves from './pages/Shared/Leaves';
import Facilities from './pages/Shared/Facilities';

import './index.css';

const RoleBasedRoute = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<RoleBasedRoute />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            
            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/team" element={<ManagerTeams />} />
            <Route path="/manager/projects" element={<ManagerProjects />} />
            <Route path="/manager/leaves" element={<Leaves />} />
            <Route path="/manager/facilities" element={<Facilities />} />
            
            {/* Employee Routes */}
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/projects" element={<EmployeeProjects />} />
            <Route path="/employee/tasks" element={<EmployeeTasks />} />
            <Route path="/employee/leaves" element={<Leaves />} />
            <Route path="/employee/attendance" element={<EmployeeAttendance />} />
            <Route path="/employee/feedback" element={<EmployeeFeedback />} />
            <Route path="/employee/facilities" element={<Facilities />} />
            
            {/* Shared */}
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/facilities" element={<Facilities />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
