import { Briefcase, ClipboardList, Calendar, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Projects', value: '3', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Monthly Attendance', value: '22/24', icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tasks Completed', value: '15', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Unread Notifications', value: '4', icon: Bell, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500">Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Projects Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Quick Project View</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:border-blue-500 transition cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Cloud Migration</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">In Progress</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Unread Notifications Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New task assigned by Manager Sarah</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
