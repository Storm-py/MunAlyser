import React,{ StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import JobList from './pages/JobList.jsx'

const router=createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route
    path='/'
    element={
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <Dashboard/>
      </Suspense>
    }
    />
    <Route
    path='/jobList'
    element={
      <Suspense fallback={<div><h1>Loading Layout...</h1></div>}>
        <JobList/>
      </Suspense>
    }
    />
    </>
  )
)



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)