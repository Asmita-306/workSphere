import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Leaves = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([
    { id: '1', employeeName: 'John Doe', role: 'employee', startDate: '2024-04-01', endDate: '2024-04-03', reason: 'Family trip', status: 'pending' },
    { id: '2', employeeName: 'Sarah Miller', role: 'manager', startDate: '2024-04-10', endDate: '2024-04-12', reason: 'Medical', status: 'pending' },
    { id: '3', employeeName: 'Mike Chen', role: 'employee', startDate: '2024-03-20', endDate: '2024-03-21', reason: 'Personal', status: 'approved' },
  ]);

  const [newRequest, setNewRequest] = useState({ startDate: '', endDate: '', reason: '' });

  const handleApply = (e) => {
    e.preventDefault();
    alert('Leave request submitted!');
    setNewRequest({ startDate: '', endDate: '', reason: '' });
  };

  const updateStatus = (id, status) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  const canApprove = (req) => {
    if (user.role === 'admin' && req.role === 'manager') return true;
    if (user.role === 'manager' && req.role === 'employee') return true;
    return false;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {user.role === 'employee' ? 'Request For Leave' : 'Leave Management'}
        </h1>
        <p className="text-gray-500">Track and manage leave requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Request Form (Only for Employee & Manager) */}
        {user.role !== 'admin' && (
          <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
            <h2 className="text-lg font-bold mb-4">New Request</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input 
                  type="date" required
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" 
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input 
                  type="date" required
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" 
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea 
                  required rows="3"
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none" 
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                ></textarea>
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className={`space-y-6 ${user.role === 'admin' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <h2 className="text-lg font-bold mb-4">Recent Requests</h2>
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${req.status === 'approved' ? 'bg-green-100' : req.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Calendar className={`w-6 h-6 ${req.status === 'approved' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{req.employeeName}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{req.role}</span>
                    </div>
                    <p className="text-sm text-gray-500">{req.startDate} to {req.endDate}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">"{req.reason}"</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                    req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {req.status}
                  </span>
                  
                  {canApprove(req) && req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'rejected')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {user.role === 'admin' && req.role === 'employee' && (
                    <span className="text-[10px] text-gray-400 italic">Admin View Only</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
