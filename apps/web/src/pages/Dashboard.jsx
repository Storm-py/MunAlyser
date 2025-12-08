import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Loader2, MapPin, Briefcase, TrendingUp, List, Send, Power, Clock } from 'lucide-react';
import { login } from '../store/authSlice'; 

export default function Dashboard() {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [stats, setStats] = useState({ totalJobs: 0, applied: 0, interviewing: 0, highMatches: 0 });
  
  const [isAutoHunting, setIsAutoHunting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {

    axios.get('http://localhost:3000/api/jobs/stats', { withCredentials: true })
      .then(res => setStats(res.data.data))
      .catch(err => console.error("Stats error:", err));
      
    if (user) setIsAutoHunting(user.autoApplyEnabled);
  }, [user]);


  const handleHunt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.post('http://localhost:3000/api/jobs/hunt', {
        role, location, experienceLevel
      }, { withCredentials: true });
      setStatus({ type: 'success', message: 'Scout dispatched! Job ID: ' + response.data.data.jobId });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to launch scout.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoHunt = async () => {
    if (!role || !location) {
        alert("Please enter a Target Role and Location first to configure Auto-Pilot!");
        return;
    }
    
    setToggling(true);
    try {
        const endpoint = isAutoHunting ? 'stopSchedule' : 'scheduleHunt';
        
        await axios.post(`http://localhost:3000/api/jobs/${endpoint}`, {
            role, location, experienceLevel
        }, { withCredentials: true });

        const newState = !isAutoHunting;
        setIsAutoHunting(newState);
        
        if (user) dispatch(login({ ...user, autoApplyEnabled: newState }));
        
        alert(newState ? "Auto-Pilot Activated! 🚀 I will hunt every 24h." : "Auto-Pilot Deactivated. 🛑");

    } catch (error) {
        alert("Failed to toggle Auto-Hunt: " + (error.response?.data?.message || error.message));
    } finally {
        setToggling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 space-y-8 pb-20">
      
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center transition-colors ${isAutoHunting ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center mb-4 md:mb-0">
            <div className={`p-3 rounded-full mr-4 ${isAutoHunting ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                <Clock className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Auto-Pilot Mode</h3>
                <p className="text-sm text-gray-600">
                    {isAutoHunting 
                        ? "Active: Scouting for jobs every 24 hours." 
                        : "Inactive: Enable to automate your daily search."}
                </p>
            </div>
        </div>
        
        <button 
            onClick={toggleAutoHunt}
            disabled={toggling}
            className={`px-6 py-3 rounded-lg font-bold text-white shadow-sm transition-all transform active:scale-95 flex items-center ${isAutoHunting ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
            {toggling ? <Loader2 className="animate-spin w-5 h-5" /> : <Power className="w-5 h-5 mr-2" />}
            {isAutoHunting ? "Stop Auto-Pilot" : "Activate Auto-Pilot"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-gray-500 mb-2">
                <List className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">Total Found</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.totalJobs}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">High Match</span>
            </div>
            <p className="text-3xl font-extrabold text-blue-700">{stats.highMatches}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
                <Send className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">Applied</span>
            </div>
            <p className="text-3xl font-extrabold text-green-700">{stats.applied}</p>
        </div>
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <Briefcase className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">Interviews</span>
            </div>
            <p className="text-3xl font-extrabold text-purple-700">{stats.interviewing}</p>
        </div>
      </div>

     
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Hunt 🎯</h1>
            <p className="text-gray-500">Deploy a one-time scout immediately.</p>
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