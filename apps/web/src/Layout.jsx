import React from 'react'
import axios from 'axios'
import Navbar from './components/Navbar.jsx'
import { login } from './store/authSlice.js'
import { logout } from './store/authSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { useEffect,useState } from 'react'


const Layout = () => {
  const status= useSelector(state=>state.auth.status)
  const dispatch= useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    axios.get('http://localhost:3000/api/users/getUser')
      .then((response) => {
        if (response.data && response.data.data) {
          dispatch(login(response.data.data));
        } else {
          dispatch(logout());
        }
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        setLoading(false);
      });
  },[dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <>
    {status?<Navbar/>:''}
    <Outlet/>
    </>
  )
}

export default Layout