import { useNavigate } from 'react-router-dom'
import React from 'react'
import dp from '../assets/dp.jpg'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const OtherUser = ({user}) => {
    const {userData}=useSelector(state=>state.user)
    const navigate=useNavigate()
    const dispatch = useDispatch()
    const isFollowing = userData?.following?.includes(user?._id)

    const handleFollow = async (e) => {
        e.stopPropagation();
        try {
            await axios.post(`${serverUrl}/api/user/follow/${user._id}`, {}, { withCredentials: true })
            const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
            dispatch(setUserData(res.data));
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='w-full py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 gap-2'>
        <div className='flex items-center gap-3 min-w-0 flex-1 cursor-pointer' onClick={()=>navigate(`/profile/${user.userName}`)}>
            <div className='w-10 h-10 shrink-0 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden'>
                <img src={user?.profileImage || dp} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='flex flex-col min-w-0 flex-1'>
                <div className='text-sm font-semibold text-black dark:text-white truncate'>
                    {user?.userName}
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                    {user?.name}
                </div>
            </div>
        </div>
        <button 
            onClick={handleFollow}
            className={`shrink-0 px-4 py-1 h-[32px] rounded-lg text-sm font-semibold transition-colors ${isFollowing ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'}`}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    </div>
  )
}

export default OtherUser