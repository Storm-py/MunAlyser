import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Building2, ExternalLink, Calendar, AlignLeft, CheckCircle, AlertCircle, XCircle, Sparkles, X, Copy, Check } from 'lucide-react';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [copied, setCopied] = useState(false);

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


  const handleGenerateLetter = async (jobId) => {
    setGeneratingId(jobId);
    try {
        const res = await axios.post('http://localhost:3000/api/ai/cover-letter', 
            { jobId },
            { withCredentials: true }
        );
        
        setGeneratedLetter(res.data.data.letter);
        setLetterModalOpen(true);
        setCopied(false);
    } catch (err) {
        alert("Failed to generate letter: " + (err.response?.data?.message || err.message));
    } finally {
        setGeneratingId(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  
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
    <div className="space-y-8 pb-12 relative">
      {/* Header Section */}
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
              {/* Score Badge */}
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
                   </>
                ) : (
                   <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span className="italic">Analysis pending...</span>
                   </div>
                )}
              </div>

              
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                <button 
                    onClick={() => handleGenerateLetter(job._id)}
                    disabled={generatingId === job._id}
                    className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generatingId === job._id ? (
                        <span className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700 mr-2"></div> Writing...</span>
                    ) : (
                        <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Write Cover Letter</span>
                    )}
                </button>

                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply on LinkedIn <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          );
          })}
        </div>
      )}

      
      {letterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <Sparkles className="w-5 h-5 text-indigo-600 mr-2" /> 
                        AI Generated Cover Letter
                    </h2>
                    <button onClick={() => setLetterModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                
                <div className="p-6 overflow-y-auto bg-gray-50/50">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-serif">
                        {generatedLetter}
                    </div>
                </div>

                
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-white">
                    <button 
                        onClick={() => setLetterModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center text-white transition-all ${copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}