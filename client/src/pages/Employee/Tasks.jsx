import { useState } from 'react';
import { CheckCircle, Circle, Calendar, AlertCircle } from 'lucide-react';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Fix Sidebar Bug', date: '2024-03-25', status: 'todo', priority: 'high' },
    { id: '2', title: 'Prepare Demo Deck', date: '2024-03-25', status: 'done', priority: 'medium' },
    { id: '3', title: 'Code Review for HR Module', date: '2024-03-26', status: 'todo', priority: 'low' },
  ]);

  const today = '2024-03-25'; // Mocked current date

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task
    ));
  };

  const todayTasks = tasks.filter(t => t.date === today);
  const upcomingTasks = tasks.filter(t => t.date !== today);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500">Track and manage your daily activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's To-Do List
            </h2>
            <div className="space-y-3">
              {todayTasks.length > 0 ? todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 bg-white rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    task.status === 'done' ? 'bg-gray-50 border-gray-100 opacity-60' : 'hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {task.status === 'done' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                    <div>
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                        task.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <button className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status === 'done' ? 'Completed' : 'Mark Done'}
                  </button>
                </div>
              )) : (
                <p className="text-gray-400 italic">No tasks for today.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-500">Upcoming Tasks</h2>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 bg-gray-50 rounded-xl border border-dashed flex items-center justify-between grayscale opacity-70">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-600">{task.title}</p>
                      <p className="text-xs text-gray-400">Scheduled for {task.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-4">Task Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Active</span>
              <span className="text-2xl font-bold">{tasks.filter(t => t.status === 'todo').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Completed Today</span>
              <span className="text-2xl font-bold">{tasks.filter(t => t.status === 'done' && t.date === today).length}</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-2 mt-6">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-100 text-center mt-2">
              Overall Productivity: {Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;
