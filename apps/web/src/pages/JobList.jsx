import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Building2, ExternalLink, Calendar, Clock, AlignLeft } from 'lucide-react';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/jobs/jobList');
        const jobData = res.data.data || res.data;
        setJobs(Array.isArray(jobData) ? jobData : []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
     
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Feed 📋</h1>
          <p className="text-gray-500 mt-1">Found <span className="font-bold text-blue-600">{jobs.length}</span> matching opportunities</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium rounded-lg transition-colors border border-gray-200 flex items-center"
        >
          <Clock className="w-4 h-4 mr-2" /> Refresh Data
        </button>
      </div>

      
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No jobs found yet</h3>
          <p className="text-gray-500 mt-1">Start a new hunt from the dashboard to populate this list.</p>
        </div>
      ) : (
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div 
              key={job._id} 
              className="group bg-white flex flex-col h-full p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mt-2">
                    <Building2 className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium text-sm">{job.company}</span>
                  </div>
                </div>
              </div>
              
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(job.scrapedAt).toLocaleDateString()}
                </span>
              </div>

              
              <div className="flex-1 mb-6">
                <div className="flex items-start space-x-2">
                  <AlignLeft className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                    {job.description || "No description available for this role. Click 'View on LinkedIn' to read the full details on the original posting."}
                  </p>
                </div>
              </div>

              
              <div className="mt-auto pt-4 border-t border-gray-100">
                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Apply on LinkedIn <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}