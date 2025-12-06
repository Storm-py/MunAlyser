import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Building2, ExternalLink, Calendar, AlignLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/jobs/jobList', { withCredentials: true });
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

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 50) return "bg-yellow-50 text-yellow-800 border-yellow-200";
    return "bg-red-50 text-red-800 border-red-200";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 mr-1" />;
    if (score >= 50) return <AlertCircle className="w-4 h-4 mr-1" />;
    return <XCircle className="w-4 h-4 mr-1" />;
  };

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
          Refresh Data
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
          {jobs.map((job) => {
             
             const ai = job.aiAnalysis;
             const score = ai?.matchScore || 0;

             return (
            <div 
              key={job._id} 
              className="group bg-white flex flex-col h-full p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 relative overflow-hidden"
            >
              
              {ai && (
                <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl border-b border-l font-bold text-sm flex items-center ${getScoreColor(score)}`}>
                  {getScoreIcon(score)}
                  {score}% Match
                </div>
              )}

              
              <div className="flex justify-between items-start mb-4 pr-20">
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

             
              <div className="flex-1 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {ai ? (
                   <>
                     <p className="text-sm text-gray-700 font-medium mb-2">🤖 AI Verdict:</p>
                     <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed italic">
                       "{ai.summary}"
                     </p>
                    
                     {ai.missingSkills && ai.missingSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {ai.missingSkills.slice(0,3).map(skill => (
                                <span key={skill} className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-md">
                                    Missing: {skill}
                                </span>
                            ))}
                        </div>
                     )}
                   </>
                ) : (
                   <div className="flex items-center space-x-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing job...</span>
                   </div>
                )}
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
          );
          })}
        </div>
      )}
    </div>
  );
}