import { Users, Briefcase, Activity, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Employees', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Projects', value: '45', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'System Activity', value: 'High', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tasks Completed', value: '89%', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Monitor overall system health and activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-400">Monthly</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-400 border-b">
                  <th className="pb-3 font-medium">Project Name</th>
                  <th className="pb-3 font-medium">Manager</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-4 font-medium">Cloud Migration</td>
                  <td className="py-4">Alice Smith</td>
                  <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">In Progress</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 font-medium">HR Portal Redesign</td>
                  <td className="py-4">Bob Johnson</td>
                  <td className="py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Planning</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
