import React from 'react'
import { GoHomeFill } from 'react-icons/go'
import { FiSearch, FiPlusSquare, FiMessageCircle } from 'react-icons/fi'
import { RxVideo } from 'react-icons/rx'
import dp from '../assets/dp.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userData } = useSelector(state => state.user)

  return (
    <div className='md:hidden w-full h-[50px] bg-white dark:bg-black border-t border-gray-300 dark:border-gray-800 flex justify-around items-center fixed bottom-0 left-0 z-50'>
        <div onClick={() => navigate("/")}>
            <GoHomeFill className={`cursor-pointer w-7 h-7 ${location.pathname === '/' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`} />
        </div>
        <div onClick={() => navigate("/search")}>
            <FiSearch className={`cursor-pointer w-7 h-7 ${location.pathname === '/search' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`} />
        </div>
        <div onClick={() => navigate("/upload")}>
            <FiPlusSquare className={`cursor-pointer w-7 h-7 ${location.pathname === '/upload' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`} />
        </div>
        <div onClick={() => navigate("/loops")}>
            <RxVideo className={`cursor-pointer w-7 h-7 ${location.pathname === '/loops' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`} />
        </div>
        <div 
          className={`w-7 h-7 rounded-full cursor-pointer overflow-hidden border-2 ${location.pathname.includes('/profile') ? 'border-black dark:border-white' : 'border-transparent'}`} 
          onClick={() => navigate(`/profile/${userData?.userName}`)}
        >
            <img src={userData?.profileImage || dp} alt="Profile" className='w-full h-full object-cover' />
        </div>
    </div>
  )
}

export default BottomNav
