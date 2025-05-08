import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function Layout() {
  return (
    <main className='flex h-screen w-full overflow-hidden'>
      <Navbar />
      <div className='flex-1 overflow-auto lg:ml-[250px] w-full pt-16 lg:pt-0'>
        <div className='p-4 lg:p-8'>
          <Outlet />
        </div>
      </div>
    </main>
  )
}
