import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const MainLayout = () => {
  return (
    <div className='flex w-full min-h-screen bg-white dark:bg-black text-black dark:text-white'>
      <Sidebar />
      <div className='flex-1 w-full md:ml-[72px] xl:ml-[245px] pb-[50px] md:pb-0'>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default MainLayout
