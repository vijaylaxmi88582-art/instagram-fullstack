import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import dp from '../assets/dp.jpg'

const SuggestedUserCard = ({ user }) => {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
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
        <div className='flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg min-w-[150px] shrink-0 snap-start bg-white dark:bg-black'>
            <div className='w-16 h-16 shrink-0 border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden mb-2 cursor-pointer' onClick={() => navigate(`/profile/${user.userName}`)}>
                <img src={user?.profileImage || dp} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='text-sm font-semibold text-black dark:text-white truncate w-full text-center'>
                {user?.userName}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center mb-4'>
                Suggested for you
            </div>
            <button 
                onClick={handleFollow}
                className={`w-full h-[32px] rounded-lg text-sm font-semibold transition-colors ${isFollowing ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'}`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
        </div>
    )
}

export default SuggestedUserCard
