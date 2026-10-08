import dp from '../assets/dp.jpg'
import { FaRegHeart, FaHeart, FaRegComment, FaRegPaperPlane } from 'react-icons/fa6'
import { FiBookmark, FiTrash2 } from 'react-icons/fi'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PostDetailModal from './PostDetailModal';
import ShareModal from './ShareModal';

const Post = ({ post, onLike, onComment, onDelete }) => {
  const { userData } = useSelector(state => state.user);
  const navigate = useNavigate();
  const isLiked = post?.likes?.some(user => user._id === userData?._id) || post?.likes?.includes(userData?._id);
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleShare = () => {
    setIsShareModalOpen(true);
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  }
  
  return (
    <div className='w-full max-w-[500px] bg-white dark:bg-black text-black dark:text-white mb-6 rounded-md shadow-sm border border-gray-200 dark:border-gray-800'>
      {/* Header */}
      <div className='flex items-center justify-between p-3'>
        <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate(`/profile/${post?.auther?.userName}`)}>
          <div className='w-8 h-8 rounded-full overflow-hidden border border-gray-300'>
            <img 
              src={post?.auther?.profileImage || dp} 
              alt="profile" 
              className='w-full h-full object-cover' 
            />
          </div>
          <div className='font-semibold text-sm hover:underline'>{post?.auther?.userName}</div>
        </div>
        {userData?._id === post?.auther?._id && onDelete && (
          <FiTrash2 
            className='text-red-500 cursor-pointer hover:scale-110 transition-transform' 
            onClick={() => { if(window.confirm('Are you sure you want to delete this post?')) onDelete(post._id) }} 
            title="Delete Post" 
          />
        )}
      </div>

      {/* Media */}
      <div className='w-full aspect-square bg-black relative'>
        {post?.mediaType === 'video' ? (
          <video src={post?.media} controls className='w-full h-full object-cover' />
        ) : (
          <img src={post?.media} alt="post media" className='w-full h-full object-cover' />
        )}
        
        {post?.music && (
          <>
            <audio src={post.music} autoPlay loop muted={isMuted} hidden />
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className='absolute bottom-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition'
            >
              {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className='p-3 flex justify-between items-center'>
        <div className='flex gap-4'>
          {isLiked ? (
            <FaHeart className='w-6 h-6 text-red-500 cursor-pointer' onClick={() => onLike(post?._id)} />
          ) : (
            <FaRegHeart className='w-6 h-6 cursor-pointer hover:text-gray-600' onClick={() => onLike(post?._id)} />
          )}
          <FaRegComment className='w-6 h-6 cursor-pointer hover:text-gray-600' onClick={() => setIsModalOpen(true)} />
          <FaRegPaperPlane className='w-6 h-6 cursor-pointer hover:text-gray-600' onClick={handleShare} />
        </div>
        <FiBookmark className='w-6 h-6 cursor-pointer hover:text-gray-600' />
      </div>

      {/* Likes */}
      <div className='px-3 font-semibold text-sm cursor-pointer' onClick={() => setIsModalOpen(true)}>
        {post?.likes?.length} likes
      </div>

      {/* Caption */}
      <div className='px-3 pt-1 text-sm pb-2'>
        <span className='font-semibold mr-2 cursor-pointer hover:underline' onClick={() => navigate(`/profile/${post?.auther?.userName}`)}>{post?.auther?.userName}</span>
        {post?.caption}
      </div>

      {/* Comments */}
      {post?.comments?.length > 0 && (
        <div className='px-3 text-sm text-gray-500 pb-2 cursor-pointer' onClick={() => setIsModalOpen(true)}>
          View all {post?.comments?.length} comments
        </div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleCommentSubmit} className='flex items-center px-3 py-2 border-t border-gray-100 dark:border-gray-800'>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className='w-full text-sm outline-none bg-transparent text-black dark:text-white'
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!commentText.trim()} 
          className='text-blue-500 font-semibold text-sm disabled:text-blue-300 ml-2'
        >
          Post
        </button>
      </form>

      {isModalOpen && (
        <PostDetailModal 
          post={post} 
          currentUser={userData} 
          onClose={() => setIsModalOpen(false)} 
          onLike={onLike}
          onComment={onComment}
        />
      )}

      {isShareModalOpen && (
        <ShareModal post={post} onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  )
}

export default Post
