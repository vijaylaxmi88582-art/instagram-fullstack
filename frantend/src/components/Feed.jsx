import React, { useState } from 'react'
import logo from '../assets/logo.png'
import { FaRegHeart } from 'react-icons/fa6'
import StoryDp from '../components/StoryDp';
import { useSelector, useDispatch } from 'react-redux'
import Post from './Post';
import axios from 'axios';
import { serverUrl } from '../App';
import { setAllPosts } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import StoryViewer from './StoryViewer';
import SuggestedUserCard from './SuggestedUserCard';

const Feed = () => {
  const { userData, stories, allPosts, suggestedUsers } = useSelector(store => store.user)
  const { mode } = useSelector(state => state.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  
  const handleLike = async (postId) => {
    try {
      const res = await axios.get(`${serverUrl}/api/post/like/${postId}`, { withCredentials: true })
      const updatedPosts = allPosts.map(p => p._id === postId ? res.data : p)
      dispatch(setAllPosts(updatedPosts))
    } catch (error) {
      console.log(error)
    }
  }

  const handleComment = async (postId, message) => {
    try {
      const res = await axios.post(`${serverUrl}/api/post/comment/${postId}`, { message }, { withCredentials: true })
      const updatedPosts = allPosts.map(p => p._id === postId ? res.data : p)
      dispatch(setAllPosts(updatedPosts))
    } catch (error) {
      console.log(error)
    }
  }

  const handleReply = async (postId, commentId, message) => {
    try {
      const res = await axios.post(`${serverUrl}/api/post/comment/reply/${postId}/${commentId}`, { message }, { withCredentials: true })
      const updatedPosts = allPosts.map(p => p._id === postId ? res.data : p)
      dispatch(setAllPosts(updatedPosts))
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${serverUrl}/api/post/delete/${postId}`, { withCredentials: true })
      const updatedPosts = allPosts.filter(p => p._id !== postId)
      dispatch(setAllPosts(updatedPosts))
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Failed to delete post")
    }
  }

  const handleOpenStory = async (user) => {
    try {
      const res = await axios.get(`${serverUrl}/api/story/getByUserName/${user.userName}`, { withCredentials: true });
      if (res.data && res.data.length > 0) {
        setActiveStoryGroup(res.data);
      } else {
        alert("No stories available.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleToggleTheme = () => {
    dispatch({ type: 'theme/toggleTheme' })
  }
  
  return (
    <div className='w-full max-w-[470px] flex flex-col items-center bg-white dark:bg-black min-h-screen pb-16 md:pb-0'>
      
      {/* Mobile Top Bar */}
      <div className='w-full h-[60px] flex md:hidden items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-40'>
        <img src={logo} alt="Instagram" className='w-[100px] object-contain dark:invert' />
        <div className='flex items-center gap-4'>
          <button onClick={handleToggleTheme} className="text-xl">
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>
          <FaRegHeart className='text-black dark:text-white w-6 h-6 cursor-pointer hover:scale-105 transition-transform'/>
        </div>
      </div>

      {/* Stories Section */}
      <div className='w-full flex justify-start overflow-x-auto gap-4 py-4 px-2 no-scrollbar border-b border-gray-200 dark:border-gray-800'>
        {userData && (
          <div onClick={() => navigate('/upload')} className="cursor-pointer shrink-0">
            <StoryDp profileImage={userData?.profileImage} userName="Your story" />
          </div>
        )}
        {stories && stories.map((user, index) => (
          <div key={index} onClick={() => handleOpenStory(user)} className="cursor-pointer shrink-0">
            <StoryDp profileImage={user?.profileImage} userName={user?.userName} />
          </div>
        ))}
      </div>

      {/* Suggested Users Section for Mobile/Tablet */}
      {suggestedUsers && suggestedUsers.length > 0 && (
        <div className='w-full lg:hidden py-4 border-b border-gray-200 bg-white'>
          <div className='flex justify-between items-center px-4 mb-3'>
            <span className='text-sm font-semibold text-black'>Suggested for you</span>
            <span className='text-xs font-semibold text-blue-500 cursor-pointer'>See All</span>
          </div>
          <div className='flex overflow-x-auto gap-4 px-4 pb-2 no-scrollbar snap-x'>
            {suggestedUsers.slice(0, 8).map((user, index) => (
              <SuggestedUserCard key={index} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className='w-full flex flex-col items-center mt-4 gap-6'>
        {allPosts && allPosts.map(post => (
          <Post key={post._id} post={post} onLike={handleLike} onComment={handleComment} onReply={handleReply} onDelete={handleDelete} />
        ))}
        {(!allPosts || allPosts.length === 0) && (
          <div className="text-gray-500 mt-10 text-sm font-semibold">No posts yet.</div>
        )}
      </div>

      {activeStoryGroup && (
        <StoryViewer 
          storyGroups={activeStoryGroup} 
          initialStoryIndex={0} 
          onClose={() => setActiveStoryGroup(null)}
          currentUser={userData}
        />
      )}
    </div>
  )
}

export default Feed