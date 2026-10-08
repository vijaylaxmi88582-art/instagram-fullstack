import React, { useEffect } from 'react'

import {serverUrl} from '../App'
import {useNavigate, useParams} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setProfileData, setUserData } from '../redux/userSlice'
import axios from "axios";
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import dp from "../assets/dp.jpg"

const Profile = () => {
    const [showFollowModal, setShowFollowModal] = React.useState(null);
    const {userName}=useParams()
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const {profileData,userData}=useSelector(state=>state.user)
    const handleProfile=async()=>{
        try{
            const result=await axios.get(`${serverUrl}/api/user/getProfile/${userName}`,{withCredentials:true})
            dispatch(setProfileData(result.data))
        } catch (error){
          console.log(error)
        }
    }

    const handleFollow = async () => {
        try {
            await axios.post(`${serverUrl}/api/user/follow/${profileData._id}`, {}, { withCredentials: true })
            handleProfile(); // refresh profile data
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogOut=async()=>{
      try{
        const result=await axios.get(`${serverUrl}/api/auth/signout`,{withCredentials:true})
        dispatch(setUserData(null))
      } catch(error){
        console.log(error)
      }
    }

    const handleInlineFollow = async (e, targetUserId) => {
        e.stopPropagation();
        try {
            await axios.post(`${serverUrl}/api/user/follow/${targetUserId}`, {}, { withCredentials: true })
            const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
            dispatch(setUserData(res.data));
            handleProfile();
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(()=>{
      handleProfile()
    },[userName,dispatch])
  return (
    <div className='w-full min-h-screen bg-white dark:bg-black text-black dark:text-white pb-[60px] md:pb-0'>
      <div className='w-full h-[60px] flex justify-between items-center px-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-40'>
        <div onClick={() => navigate("/")}><MdOutlineKeyboardBackspace className='cursor-pointer w-7 h-7' /></div>
        <div className='font-bold text-lg'>{profileData?.userName}</div>
        <div className='font-semibold cursor-pointer text-sm text-red-500' onClick={handleLogOut}>Log Out</div>
      </div>

      <div className='w-full max-w-[900px] mx-auto'>
        {/* Profile Header Stats */}
        <div className='flex items-center justify-between px-4 pt-6 pb-2'>
          <div className='w-[80px] h-[80px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border border-gray-300 dark:border-gray-800 shrink-0'>
            <img src={profileData?.profileImage || dp} alt="" className='w-full h-full object-cover' />
          </div>
          <div className='flex flex-1 justify-around items-center ml-4 md:ml-10 text-center'>
            <div className='flex flex-col'>
              <span className='font-bold text-[18px] md:text-[22px]'>{profileData?.posts?.length || 0}</span>
              <span className='text-[14px] text-gray-500 dark:text-gray-400'>posts</span>
            </div>
            <div className='flex flex-col cursor-pointer' onClick={() => setShowFollowModal('followers')}>
              <span className='font-bold text-[18px] md:text-[22px]'>{profileData?.followers?.length || 0}</span>
              <span className='text-[14px] text-gray-500 dark:text-gray-400'>followers</span>
            </div>
            <div className='flex flex-col cursor-pointer' onClick={() => setShowFollowModal('following')}>
              <span className='font-bold text-[18px] md:text-[22px]'>{profileData?.following?.length || 0}</span>
              <span className='text-[14px] text-gray-500 dark:text-gray-400'>following</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className='px-4 pb-4'>
          <div className='font-bold text-[14px] md:text-[16px]'>{profileData?.name}</div>
          <div className='text-[14px] text-gray-500'>{profileData?.profession || ""}</div>
          <div className='text-[14px] whitespace-pre-wrap mt-1'>{profileData?.bio}</div>
        </div>

        {/* Action Buttons */}
        <div className='px-4 flex gap-2 mb-6'>
          {profileData?._id === userData?._id ? (
            <>
              <button 
                className='flex-1 bg-[#efefef] dark:bg-[#363636] hover:bg-[#dbdbdb] dark:hover:bg-[#262626] text-black dark:text-white font-semibold rounded-lg py-1.5 text-[14px] transition-colors' 
                onClick={() => navigate("/editprofile")}
              >
                Edit profile
              </button>
              <button 
                className='flex-1 bg-[#efefef] dark:bg-[#363636] hover:bg-[#dbdbdb] dark:hover:bg-[#262626] text-black dark:text-white font-semibold rounded-lg py-1.5 text-[14px] transition-colors' 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Profile link copied!");
                }}
              >
                Share profile
              </button>
            </>
          ) : (
            <>
              <button 
                className={`flex-1 font-semibold rounded-lg py-1.5 text-[14px] transition-colors ${profileData?.followers?.some(f => f._id === userData?._id || f === userData?._id) ? 'bg-[#efefef] dark:bg-[#363636] text-black dark:text-white hover:bg-[#dbdbdb] dark:hover:bg-[#262626]' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'}`} 
                onClick={handleFollow}
              >
                {profileData?.followers?.some(f => f._id === userData?._id || f === userData?._id) ? "Following" : "Follow"}
              </button>
              <button 
                className='flex-1 bg-[#efefef] dark:bg-[#363636] hover:bg-[#dbdbdb] dark:hover:bg-[#262626] text-black dark:text-white font-semibold rounded-lg py-1.5 text-[14px] transition-colors'
                onClick={() => navigate(`/chat/${profileData?._id}`)}
              >
                Message
              </button>
            </>
          )}
        </div>

        {/* Posts Grid */}
        <div className='w-full grid grid-cols-3 gap-1'>
          {profileData?.posts?.map((post, index) => (
            <div key={index} className='w-full aspect-square bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer'>
                {post.mediaType === 'video' ? (
                  <video src={post.media} className='w-full h-full object-cover' />
                ) : (
                  <img src={post.media} alt="" className='w-full h-full object-cover' />
                )}
            </div>
          ))}
          {(!profileData?.posts || profileData.posts.length === 0) && (
            <div className="col-span-3 text-center text-gray-500 py-10">No posts yet</div>
          )}
        </div>
      </div>

      {showFollowModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-sm rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-white font-semibold text-lg capitalize">{showFollowModal}</h2>
                    <IoClose className="text-white text-2xl cursor-pointer hover:scale-110" onClick={() => setShowFollowModal(null)} />
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {profileData[showFollowModal]?.map(user => (
                        <div key={user._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-800 rounded-lg transition-colors" onClick={() => { setShowFollowModal(null); navigate(`/profile/${user.userName}`); }}>
                            <img src={user.profileImage || dp} alt="dp" className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex flex-col flex-1">
                                <span className="text-white font-semibold text-[15px]">{user.userName}</span>
                                <span className="text-gray-400 text-[13px]">{user.name}</span>
                            </div>
                            {userData?._id !== user._id && (
                                <button 
                                    onClick={(e) => handleInlineFollow(e, user._id)}
                                    className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${userData?.following?.includes(user._id) ? 'bg-gray-800 text-white border border-gray-600' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'}`}
                                >
                                    {userData?.following?.includes(user._id) ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                    ))}
                    {(!profileData[showFollowModal] || profileData[showFollowModal].length === 0) && (
                        <div className="text-gray-500 text-center mt-4">No {showFollowModal} yet.</div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default Profile
