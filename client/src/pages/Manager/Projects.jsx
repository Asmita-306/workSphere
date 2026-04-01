import { useState, useEffect } from 'react';
import { Briefcase, Clock, Calendar, Search, Tag } from 'lucide-react';
import api from '../../api/axios';

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your projects...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Projects</h1>
          <p className="text-gray-500">Detailed list and status of projects under your management.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-6">{project.description}</p>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Progress</span>
                <span className="text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{project.TeamMembers?.length || 0} Members</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 italic">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProjects;
