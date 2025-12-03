import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleHunt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post('http://localhost:3000/api/jobs/hunt', {
        role,
        location
      });
      
      setStatus({ type: 'success', message: 'Scout dispatched! Job ID: ' + response.data.jobId });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to launch scout. Is the API running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a New Hunt 🎯</h1>
        <p className="text-gray-500 mb-8">Deploy your AI scout to find the best opportunities.</p>

        <form onSubmit={handleHunt} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g. Berlin, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        <Link to="/joblist">
            <button>
              Click here to see the jobs
            </button>
        </Link>

        {status && (
          <div className={`mt-6 p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="flex items-center">
              <span className="font-medium">{status.type === 'success' ? 'Success!' : 'Error:'}</span>
              <span className="ml-2">{status.message}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}