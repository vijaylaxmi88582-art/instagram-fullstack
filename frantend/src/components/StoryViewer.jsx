import React, { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaHeart, FaRegHeart, FaRegPaperPlane, FaEye } from 'react-icons/fa6';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../App';
import dp from '../assets/dp.jpg';

const StoryViewer = ({ storyGroups, initialStoryIndex, onClose, currentUser }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialStoryIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Story by ${currentStory?.auther?.userName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }
  
  // The storyGroups is an array of arrays (or an array of objects where each object has stories).
  // In our backend `getStoryByUserName` returns an array of stories for a user.
  // Assuming `storyGroups` is simply the flat array of stories or grouped by user.
  // Actually, Feed.jsx maps over `stories` which are users. When we click a user, we fetch their stories.
  // For simplicity, let's assume `storyGroups` passed here is an array of stories belonging to the clicked user.
  const stories = storyGroups || [];
  const currentStory = stories[currentStoryIndex];
  
  const videoRef = useRef(null);

  // Mark as viewed on mount
  useEffect(() => {
    if (currentStory) {
      axios.get(`${serverUrl}/api/story/view/${currentStory._id}`, { withCredentials: true }).catch(console.error);
    }
  }, [currentStory]);

  if (!stories.length || !currentStory) return null;

  const isLiked = currentStory?.likes?.some(user => user._id === currentUser?._id) || currentStory?.likes?.includes(currentUser?._id);

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleLike = async () => {
    try {
      await axios.get(`${serverUrl}/api/story/like/${currentStory._id}`, { withCredentials: true });
      // In a real app, update state optimistically. Here we can just toggle for UI simplicity or refetch.
      currentStory.likes = isLiked 
        ? currentStory.likes.filter(u => (u._id || u) !== currentUser._id)
        : [...(currentStory.likes || []), currentUser];
      // Force rerender trick
      setCurrentStoryIndex(currentStoryIndex);
    } catch(err) {
      console.log(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`${serverUrl}/api/story/comment/${currentStory._id}`, { message: commentText }, { withCredentials: true });
      currentStory.comments = [...(currentStory.comments || []), { auther: currentUser, message: commentText }];
      setCommentText("");
    } catch(err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
      
      {/* Navigation areas */}
      <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={handlePrev} />
      <div className="absolute right-0 top-0 bottom-0 w-1/3 z-10" onClick={handleNext} />
      
      {/* Top Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <img src={currentStory?.auther?.profileImage || dp} alt="author" className="w-10 h-10 rounded-full object-cover border-2 border-pink-500" />
          <span className="text-white font-semibold shadow-md">{currentStory?.auther?.userName}</span>
        </div>
        <button onClick={onClose} className="text-white text-3xl drop-shadow-md z-40">
          <IoClose />
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[500px] h-full md:h-[90vh] md:rounded-xl overflow-hidden relative flex items-center justify-center bg-gray-900">
        {currentStory.mediaType === 'video' ? (
          <video 
            ref={videoRef}
            src={currentStory.media} 
            autoPlay 
            className="w-full h-full object-contain"
            onEnded={handleNext}
          />
        ) : (
          <img src={currentStory.media} alt="story" className="w-full h-full object-contain" />
        )}
        
        {currentStory?.music && (
          <>
            <audio src={currentStory.music} autoPlay loop muted={isMuted} hidden />
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
              className='absolute top-20 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition z-40'
            >
              {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            </button>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-4 left-0 right-0 w-full max-w-[500px] mx-auto px-4 z-30 flex items-center gap-3">
        <form onSubmit={handleCommentSubmit} className="flex-1">
          <input 
            type="text" 
            placeholder="Reply to story..." 
            className="w-full bg-transparent border border-gray-400 rounded-full px-4 py-3 text-white outline-none placeholder-gray-300 backdrop-blur-sm"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </form>
        <div className="flex gap-4 items-center">
          {isLiked ? (
            <FaHeart className="text-red-500 text-3xl cursor-pointer drop-shadow-md" onClick={(e) => { e.stopPropagation(); handleLike(); }} />
          ) : (
            <FaRegHeart className="text-white text-3xl cursor-pointer drop-shadow-md" onClick={(e) => { e.stopPropagation(); handleLike(); }} />
          )}
          <FaRegPaperPlane className="text-white text-3xl cursor-pointer drop-shadow-md" onClick={(e) => { e.stopPropagation(); handleShare(); }} />
        </div>
      </div>

      {/* Swipe up for details (Viewers, Likes) */}
      {currentStory.auther._id === currentUser._id && (
        <div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer z-30"
          onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}
        >
          <span className="text-white text-xs mb-1 font-semibold drop-shadow-md">Viewers & Likes</span>
          <FaEye className="text-white text-xl drop-shadow-md" />
        </div>
      )}

      {/* Details Panel Overlay */}
      {showDetails && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-[500px] h-[70vh] bg-white rounded-t-3xl flex flex-col p-4 animate-slide-up relative">
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 text-black text-2xl">
              <IoClose />
            </button>
            <h2 className="text-center font-semibold text-lg border-b pb-3 mb-4">Story Details</h2>
            
            <div className="flex-1 overflow-y-auto">
              <h3 className="font-semibold text-gray-500 mb-2">Viewers</h3>
              <div className="flex flex-col gap-3 mb-6">
                {currentStory?.viewers?.map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={user?.profileImage || dp} alt="user" className="w-10 h-10 rounded-full" />
                    <span className="font-semibold">{user?.userName}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-500 mb-2">Likes</h3>
              <div className="flex flex-col gap-3 mb-6">
                {currentStory?.likes?.map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={user?.profileImage || dp} alt="user" className="w-10 h-10 rounded-full" />
                    <span className="font-semibold">{user?.userName}</span>
                    <FaHeart className="text-red-500 ml-auto" />
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-500 mb-2">Comments</h3>
              <div className="flex flex-col gap-3">
                {currentStory?.comments?.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={c?.auther?.profileImage || dp} alt="user" className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{c?.auther?.userName}</span>
                      <span className="text-sm">{c?.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
