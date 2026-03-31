import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  ClipboardList, MessageSquare, Bell, Settings, LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Employees', icon: Users, path: '/admin/employees' },
      { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
      { name: 'Attendance', icon: ClipboardList, path: '/admin/attendance' },
      { name: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    ],
    manager: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/manager' },
      { name: 'My Team', icon: Users, path: '/manager/team' },
      { name: 'Projects', icon: Briefcase, path: '/manager/projects' },
      { name: 'Leave Requests', icon: Calendar, path: '/manager/leaves' }, // Renamed from Leaves
      { name: 'Facilities', icon: Building2, path: '/manager/facilities' },
    ],
    employee: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/employee' },
      { name: 'Projects', icon: Briefcase, path: '/employee/projects' },
      { name: 'Tasks', icon: ClipboardList, path: '/employee/tasks' },
      { name: 'Request For Leave', icon: Calendar, path: '/employee/leaves' }, // Renamed from Leaves
      { name: 'Attendance', icon: ClipboardList, path: '/employee/attendance' },
      { name: 'Facilities', icon: Building2, path: '/employee/facilities' },
      { name: 'Feedback', icon: MessageSquare, path: '/employee/feedback' },
    ]
  };

  const currentRoleItems = menuItems[user?.role] || [];

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          WorkManage
        </h1>
      </div>
      <nav className="mt-6">
        {currentRoleItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t">
        <Link to="/notifications" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-blue-600">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
