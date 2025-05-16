import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
