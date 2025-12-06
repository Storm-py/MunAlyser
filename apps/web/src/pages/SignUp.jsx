import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Image as ImageIcon, Upload, Loader2, ArrowRight } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [cv, setCv] = useState(null)
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'avatar') setAvatar(file);
  };

  const handleCvChange=(e,type)=>{
    const file=e.target.files[0];
    if(type=== 'cv' ) setCv(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!avatar && !cv) {
      setError('Avatar and Cv is required');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('avatar', avatar);
      data.append('cv',cv)

     
     
      await axios.post('http://localhost:3000/api/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
     
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white z-10">
          <h1 className="text-5xl font-bold mb-6">Join MunAlyser</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Build your career with AI-powered job hunting. <br />
            Scout, Analyze, and Apply with precision.
          </p>
        </div>
       
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="johndoe123"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar (Required)</label>
                <div className="mt-1 flex items-center space-x-4 border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 transition-colors">
                   <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img src={URL.createObjectURL(avatar)} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                   </div>
                   <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span>Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, 'avatar')} />
                   </label>
                   {avatar && <span className="text-sm text-gray-500">{avatar.name}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cv (Required)</label>
                <div className="mt-1 flex items-center space-x-4 border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 transition-colors">
                   <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {cv ? (
                        <img src={URL.createObjectURL(cv)} alt="Cv" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                   </div>
                   <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span>Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCvChange(e, 'cv')} />
                   </label>
                   {cv && <span className="text-sm text-gray-500">{cv.name}</span>}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign up'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}