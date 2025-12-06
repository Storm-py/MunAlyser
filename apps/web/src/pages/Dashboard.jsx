import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, MapPin, Briefcase } from 'lucide-react';
import {Link} from 'react-router-dom'

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleHunt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
     
      const response = await axios.post('http://localhost:3000/api/jobs/hunt', {
        role,
        location,
        experienceLevel 
      });
      
      setStatus({ type: 'success', message: 'Scout dispatched! Job ID: ' + response.data.data.jobId });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to launch scout.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a New Hunt 🎯</h1>
            <p className="text-gray-500">Deploy your AI scout to find and analyze the best opportunities.</p>
        </div>

        <form onSubmit={handleHunt} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Role</label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. React Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <div className="relative">
                    <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. Berlin"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    />
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>

            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                <div className="relative">
                    <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                        <option value="">Any Level</option>
                        <option value="internship">Internship</option>
                        <option value="entry">Entry Level</option>
                        <option value="associate">Associate</option>
                        <option value="mid-senior">Mid-Senior Level</option>
                        <option value="director">Director</option>
                    </select>
                    <Briefcase className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Deploying Scout...
              </>
            ) : (
              'Launch Hunt'
            )}
          </button>
        </form>
          
        <Link to='/jobList'>
        <div>
            <button> Click here to visit Job List</button>
        </div>
        </Link>
        {status && (
          <div className={`mt-6 p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} animate-fade-in`}>
            <p className="flex items-center justify-center font-medium">
              {status.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}