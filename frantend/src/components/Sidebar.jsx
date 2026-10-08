import React from 'react'
import logo from '../assets/logo.png'
import { GoHomeFill } from 'react-icons/go'
import { FiSearch, FiPlusSquare, FiMessageCircle } from 'react-icons/fi'
import { RxVideo } from 'react-icons/rx'
import { FaRegHeart, FaRegCompass } from 'react-icons/fa6'
import dp from '../assets/dp.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900 group ${isActive ? 'font-bold text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}
  >
    <Icon className={`w-7 h-7 group-hover:scale-105 transition-transform ${isActive ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`} />
    <span className={`hidden xl:block text-[16px] ${isActive ? 'font-bold' : 'font-normal'}`}>{label}</span>
  </div>
)

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const { mode } = useSelector(state => state.theme)

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleTheme = () => {
    dispatch({ type: 'theme/toggleTheme' })
  }

  return (
    <div className='hidden md:flex flex-col border-r border-gray-300 dark:border-gray-800 w-[72px] xl:w-[245px] h-screen fixed top-0 left-0 bg-white dark:bg-black z-50 pt-8 pb-5 px-3 transition-all duration-300'>
      <div className='mb-8 px-3 cursor-pointer' onClick={() => navigate("/")}>
        {/* Full Logo for XL screens */}
        <img src={logo} alt="Instagram" className='hidden xl:block w-[103px] object-contain dark:invert' />
        {/* Small Icon for MD screens (fallback to a generic icon if no small logo exists) */}
        <div className='xl:hidden text-black dark:text-white'>
            <FaRegCompass className='w-7 h-7' />
        </div>
      </div>

      <div className='flex flex-col gap-2 flex-grow'>
        <SidebarItem icon={GoHomeFill} label="Home" isActive={location.pathname === '/'} onClick={() => navigate("/")} />
        <SidebarItem icon={FiSearch} label="Search" isActive={location.pathname === '/search'} onClick={() => navigate("/search")} />
        <SidebarItem icon={FaRegCompass} label="Explore" isActive={location.pathname === '/explore'} onClick={() => navigate("/")} />
        <SidebarItem icon={RxVideo} label="Reels" isActive={location.pathname === '/loops'} onClick={() => navigate("/loops")} />
        <SidebarItem icon={FiMessageCircle} label="Messages" isActive={location.pathname === '/messages'} onClick={() => navigate("/messages")} />
        <SidebarItem icon={FaRegHeart} label="Notifications" isActive={location.pathname === '/notifications'} onClick={() => {}} />
        <SidebarItem icon={FiPlusSquare} label="Create" isActive={location.pathname === '/upload'} onClick={() => navigate("/upload")} />
        
        {/* Profile */}
        <div 
          onClick={() => navigate(`/profile/${userData?.userName}`)}
          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900 group ${location.pathname.includes('/profile') ? 'font-bold text-black dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}
        >
          <div className='w-7 h-7 rounded-full overflow-hidden border border-gray-300 dark:border-gray-800 group-hover:scale-105 transition-transform'>
            <img src={userData?.profileImage || dp} alt="Profile" className='w-full h-full object-cover' />
          </div>
          <span className={`hidden xl:block text-[16px] ${location.pathname.includes('/profile') ? 'font-bold' : 'font-normal'}`}>Profile</span>
        </div>
      </div>

      <div className='mt-auto flex flex-col gap-2'>
         {/* Theme Toggle */}
         <div 
          onClick={handleToggleTheme}
          className='flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900 group text-gray-800 dark:text-gray-300'
         >
           <span className='xl:hidden text-[20px] font-semibold'>{mode === 'dark' ? '☀️' : '🌙'}</span>
           <span className='hidden xl:block text-[16px] font-normal'>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </div>

         {/* Log Out */}
         <div 
          onClick={handleLogOut}
          className='flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-900 group text-red-500'
         >
           <span className='hidden xl:block text-[16px] font-semibold'>Log Out</span>
           <span className='xl:hidden text-[12px] font-semibold'>Out</span>
         </div>
      </div>
    </div>
  )
}

export default Sidebar
