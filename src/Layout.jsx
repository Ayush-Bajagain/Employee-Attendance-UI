import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function Layout() {
  return (
    <main className='flex h-screen w-full overflow-hidden'>
      <Navbar />
      <div className='flex-1 overflow-auto w-full pt-16 lg:pt-0'>
        <div className='pt-4 lg:pt-8 '>
          <Outlet />
        </div>
      </div>
    </main>
  )
}
