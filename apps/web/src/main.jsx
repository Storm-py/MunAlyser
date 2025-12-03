import React,{ StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import store from './store/store.js'
import AuthLayout from './components/AuthLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import JobList from './pages/JobList.jsx'
import Signup from './pages/SignUp.jsx'
import Signin from './pages/SignIn.jsx'
import axios from 'axios'





const router=createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route
    path='/'
    element={
      <AuthLayout>
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <Dashboard/>
      </Suspense>
      </AuthLayout>
    }
    />
    <Route
    path='/jobList'
    element={
      <AuthLayout>
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <JobList/>
      </Suspense>
      </AuthLayout>
    }
    />
    <Route
    path='/signup'
    element={
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <Signup/>
      </Suspense> 
    }
    />
    <Route
    path='/login'
    element={
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <Signin/>
      </Suspense>
    }
    />
    </>
  )
)

axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router}/>
  </Provider>,
)