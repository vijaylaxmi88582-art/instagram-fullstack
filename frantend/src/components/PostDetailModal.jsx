import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane } from 'react-icons/fa6';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import dp from '../assets/dp.jpg';
import ShareModal from './ShareModal';

const PostDetailModal = ({ post, onClose, onLike, onComment, currentUser }) => {
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("comments"); // 'comments' or 'likes'
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  }

  if (!post) return null;

  const isLiked = post?.likes?.some(user => user._id === currentUser?._id);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl">
        <IoClose />
      </button>

      <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white dark:bg-black rounded-lg flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-transparent dark:border-gray-800">
        
        {/* Left Side: Media */}
        <div className="w-full md:w-[55%] h-[50vh] md:h-full bg-black flex items-center justify-center relative">
          {post.mediaType === 'video' ? (
            <video src={post.media} controls autoPlay loop className="max-w-full max-h-full object-contain" />
          ) : (
            <img src={post.media} alt="Post" className="max-w-full max-h-full object-contain" />
          )}
          
          {post?.music && (
            <>
              <audio src={post.music} autoPlay loop muted={isMuted} hidden />
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className='absolute bottom-4 right-4 bg-black/50 p-3 rounded-full text-white hover:bg-black/70 transition'
              >
                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
              </button>
            </>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-[45%] h-[50vh] md:h-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
          
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer" onClick={() => { onClose(); navigate(`/profile/${post?.auther?.userName}`); }}>
            <img src={post?.auther?.profileImage || dp} alt="author" className="w-8 h-8 rounded-full object-cover mr-3" />
            <span className="font-semibold text-sm hover:underline">{post?.auther?.userName}</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab("comments")} 
              className={`flex-1 py-3 text-center ${activeTab === 'comments' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}
            >
              Comments
            </button>
            <button 
              onClick={() => setActiveTab("likes")} 
              className={`flex-1 py-3 text-center ${activeTab === 'likes' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-500'}`}
            >
              Likes ({post?.likes?.length || 0})
            </button>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {/* Caption */}
            {post.caption && activeTab === "comments" && (
              <div className="flex mb-4">
                <img src={post?.auther?.profileImage || dp} alt="author" className="w-8 h-8 rounded-full object-cover mr-3 mt-1 cursor-pointer" onClick={() => { onClose(); navigate(`/profile/${post?.auther?.userName}`); }} />
                <div className="text-sm">
                  <span className="font-semibold mr-2 cursor-pointer hover:underline" onClick={() => { onClose(); navigate(`/profile/${post?.auther?.userName}`); }}>{post?.auther?.userName}</span>
                  <span>{post.caption}</span>
                </div>
              </div>
            )}

            {/* Comments List */}
            {activeTab === "comments" && (
              <div className="flex flex-col gap-4">
                {post?.comments?.map((comment, index) => (
                  <div key={index} className="flex">
                    <img src={comment?.auther?.profileImage || dp} alt="user" className="w-8 h-8 rounded-full object-cover mr-3 mt-1 cursor-pointer" onClick={() => { onClose(); navigate(`/profile/${comment?.auther?.userName}`); }} />
                    <div className="text-sm flex-1">
                      <span className="font-semibold mr-2 cursor-pointer hover:underline" onClick={() => { onClose(); navigate(`/profile/${comment?.auther?.userName}`); }}>{comment?.auther?.userName}</span>
                      <span>{comment.message}</span>
                      {comment.replies?.length > 0 && (
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {comment.replies.map((reply, i) => (
                            <div key={i} className="flex">
                              <img src={reply?.auther?.profileImage || dp} alt="user" className="w-6 h-6 rounded-full object-cover mr-2" />
                              <div className="text-xs">
                                <span className="font-semibold mr-2">{reply?.auther?.userName}</span>
                                <span>{reply.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!post?.comments || post?.comments.length === 0) && (
                  <div className="text-center text-gray-500 text-sm mt-4">No comments yet.</div>
                )}
              </div>
            )}

            {/* Likes List */}
            {activeTab === "likes" && (
              <div className="flex flex-col gap-4">
                {post?.likes?.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center cursor-pointer" onClick={() => { onClose(); navigate(`/profile/${user?.userName}`); }}>
                      <img src={user?.profileImage || dp} alt="user" className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm hover:underline">{user?.userName}</span>
                        <span className="text-xs text-gray-500">{user?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!post?.likes || post?.likes.length === 0) && (
                  <div className="text-center text-gray-500 text-sm mt-4">No likes yet.</div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar (Like, Comment, etc) */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-4">
                {isLiked ? (
                  <FaHeart className="w-6 h-6 text-red-500 cursor-pointer" onClick={() => onLike(post?._id)} />
                ) : (
                  <FaRegHeart className="w-6 h-6 cursor-pointer hover:text-gray-600" onClick={() => onLike(post?._id)} />
                )}
                <FaRegComment className="w-6 h-6 cursor-pointer hover:text-gray-600" onClick={() => setActiveTab("comments")} />
                <FaRegPaperPlane className="w-6 h-6 cursor-pointer hover:text-gray-600" onClick={handleShare} />
              </div>
            </div>
            <div className="font-semibold text-sm mb-2">{post?.likes?.length || 0} likes</div>
            
            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full text-sm outline-none bg-transparent text-black dark:text-white"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()} 
                className="text-blue-500 font-semibold text-sm disabled:text-blue-300 ml-2"
              >
                Post
              </button>
            </form>
          </div>

        </div>
      </div>
      {isShareModalOpen && (
        <ShareModal post={post} onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
};

export default PostDetailModal;
