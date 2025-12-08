import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  const dispatch= useDispatch()

  const LogoutFunction = async () =>{
    await fetch('http://localhost:3000/api/users/logout',{
      method:"GET",
      credentials:"include"
    }).then(()=>{
      dispatch(logout())
    })
  }

  if (!showNavbar) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">MunAlyser</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Scout
            </Link>
            <Link to="/jobList" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Results
            </Link>
            <Link to="/settings" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Settings
            </Link>
            <button onClick={LogoutFunction} className="text-white hover:text-red-800 bg-red-600 px-3 py-1 rounded-md text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}