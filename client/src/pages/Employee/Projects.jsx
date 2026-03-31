import { useState } from 'react';
import { Briefcase, Users, Calendar, Clock, MessageSquare } from 'lucide-react';

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Cloud Migration',
      status: 'In Progress',
      progress: 65,
      dueDate: '2024-05-30',
      description: 'Migrating legacy servers to AWS infrastructure.',
      team: [
        { name: 'Sarah Miller', role: 'Project Manager' },
        { name: 'John Doe', role: 'DevOps Lead' },
        { name: 'Mike Chen', role: 'Security Analyst' }
      ]
    },
    {
      id: '2',
      name: 'HR Portal Redesign',
      status: 'Planning',
      progress: 10,
      dueDate: '2024-06-15',
      description: 'Updating the employee portal for better UX.',
      team: [
        { name: 'Jane Smith', role: 'UI/UX Designer' },
        { name: 'John Doe', role: 'Frontend Developer' }
      ]
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);

  const handleUpdate = (e) => {
    e.preventDefault();
    // Logic to update backend would go here
    alert(`Update sent for ${selectedProject.name}: ${updateMsg} (${updateProgress}%)`);
    setSelectedProject(null);
    setUpdateMsg('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-500">View and update progress for assigned projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Due Date</p>
                <div className="flex items-center gap-1 text-red-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold">{project.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-blue-600 font-bold">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Team Members</p>
              <div className="flex flex-wrap gap-4">
                {project.team.map((member) => (
                  <div key={member.name} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{member.name}</p>
                      <p className="text-[10px] text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedProject(project);
                setUpdateProgress(project.progress);
              }}
              className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition font-medium flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Update Progress
            </button>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6">Update Progress: {selectedProject.name}</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                <input 
                  type="range" min="0" max="100" 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={updateProgress}
                  onChange={(e) => setUpdateProgress(e.target.value)}
                />
                <div className="text-right text-sm font-bold text-blue-600">{updateProgress}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Description</label>
                <textarea 
                  required
                  className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="4"
                  placeholder="Describe your progress or any issues..."
                  value={updateMsg}
                  onChange={(e) => setUpdateMsg(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Submit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
