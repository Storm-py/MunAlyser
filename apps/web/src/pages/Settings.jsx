import React, { useState } from 'react';
import axios from 'axios';
import { User, FileText, Lock, Save, Loader2, Upload, Key, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../store/authSlice'; 

export default function Settings() {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || ''
  });
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
  
  const [cookieData, setCookieData] = useState({ linkedinCookie: user?.linkedinCookie || '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      await axios.patch('http://localhost:3000/api/users/updateDetails', profileData, { withCredentials: true });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      dispatch(login({ ...user, ...profileData }));
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' }); } finally { setLoading(false); }
  };


  const handleChangePassword = async (e) => {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      await axios.post('http://localhost:3000/api/users/changePassword', passData, { withCredentials: true });
      setMessage({ type: 'success', text: 'Password changed successfully!' }); setPassData({ oldPassword: '', newPassword: '' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); } finally { setLoading(false); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true); setMessage(null);
    const formData = new FormData(); formData.append('cv', file);
    try {
        const res = await axios.post('http://localhost:3000/api/users/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
        setMessage({ type: 'success', text: 'Resume updated!' });
        dispatch(login({ ...user, resumeUrl: res.data.data.url }));
    } catch (err) { setMessage({ type: 'error', text: 'Upload failed' }); console.log(err) } finally { setLoading(false); }
  };

  const handleSaveCookie = async (e) => {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      await axios.patch('http://localhost:3000/api/users/updateDetails', cookieData, { withCredentials: true });
      setMessage({ type: 'success', text: 'Integration keys saved securely.' });
      dispatch(login({ ...user, ...cookieData }));
    } catch (err) { setMessage({ type: 'error', text: 'Failed to save cookie' }); console.log(err) } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 mb-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings ⚙️</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><User className="w-5 h-5 mr-3" /> Profile</button>
            <button onClick={() => setActiveTab('resume')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'resume' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><FileText className="w-5 h-5 mr-3" /> Resume</button>
            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><Lock className="w-5 h-5 mr-3" /> Security</button>
            
            
            <button onClick={() => setActiveTab('integrations')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'integrations' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><Key className="w-5 h-5 mr-3" /> Integrations</button>
          </nav>
        </aside>

       
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          {message && <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}

          
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50">{loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes</button>
            </form>
          )}

         
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h3 className="font-medium text-gray-900">Current Resume</h3><p className="text-sm text-gray-500 mt-1">{user?.resumeUrl ? <a href={user.resumeUrl} target="_blank" className="text-blue-600 hover:underline">View Uploaded PDF</a> : "No resume uploaded yet."}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Update Resume (PDF)</label><label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"><div className="flex flex-col items-center justify-center pt-5 pb-6">{loading ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}<p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> new version</p></div><input type="file" className="hidden" accept="application/pdf" onChange={handleResumeUpload} disabled={loading} /></label></div>
            </div>
          )}

         
          {activeTab === 'security' && (
             <form onSubmit={handleChangePassword} className="space-y-6">
                <div><label className="block text-sm font-medium text-gray-700">Current Password</label><input type="password" required value={passData.oldPassword} onChange={(e) => setPassData({...passData, oldPassword: e.target.value})} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700">New Password</label><input type="password" required value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center disabled:opacity-50">{loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} Update Password</button>
             </form>
          )}

        
          {activeTab === 'integrations' && (
             <form onSubmit={handleSaveCookie} className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800">Why do we need this?</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Your <code>li_at</code> cookie allows the bot to "Log In" as you. This enables the bot to see <strong>Salary Data</strong>, <strong>Recruiter Info</strong>, and scrape <strong>Unlimited Jobs</strong> without hitting guest limits.
                        </p>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn Session Cookie (li_at)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input 
                            type="password" 
                            required 
                            value={cookieData.linkedinCookie} 
                            onChange={(e) => setCookieData({...cookieData, linkedinCookie: e.target.value})} 
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                            placeholder="Paste your li_at cookie here..."
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Paste the full string starting with "AQED..."</p>
                </div>

                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Integration
                </button>
             </form>
          )}

        </div>
      </div>
    </div>
  );
}