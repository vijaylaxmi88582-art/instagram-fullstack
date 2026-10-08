import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { FaRegHeart, FaHeart, FaRegComment, FaRegPaperPlane, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

const Loops = () => {
  const [loops, setLoops] = useState([])
  const [isMuted, setIsMuted] = useState(true)
  const { userData } = useSelector(state => state.user)
  const navigate = useNavigate()

  const fetchLoops = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/loop/getAll`, { withCredentials: true })
      setLoops(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchLoops()
  }, [])

  const handleLike = async (loopId) => {
    try {
      const res = await axios.get(`${serverUrl}/api/loop/like/${loopId}`, { withCredentials: true })
      setLoops(prev => prev.map(l => l._id === loopId ? res.data : l))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='w-full min-h-screen bg-black flex flex-col items-center pb-[100px]'>
      <div className="w-full h-[80px] flex items-center gap-[20px] px-[20px] absolute top-0 z-10">
        <MdOutlineKeyboardBackspace
          className="text-white cursor-pointer w-[25px] h-[25px]"
          onClick={() => navigate(`/`)} />
        <h1 className="text-white text-[20px] font-semibold">Loops</h1>
      </div>

      <div className='w-full max-w-[500px] h-[100vh] snap-y snap-mandatory overflow-y-scroll no-scrollbar'>
        {loops.map(loop => {
          const isLiked = loop.likes?.includes(userData?._id)
          return (
            <div key={loop._id} className='w-full h-full snap-start relative bg-gray-900 border-b border-gray-800 flex items-center justify-center'>
              {loop.mediaType === 'video' ? (
                <video src={loop.media} autoPlay loop muted={isMuted} playsInline className='w-full h-full object-cover' onClick={() => setIsMuted(!isMuted)} />
              ) : (
                <img src={loop.media} className='w-full h-full object-cover' alt='loop' onClick={() => setIsMuted(!isMuted)} />
              )}

              {loop.music && (
                <audio src={loop.music} autoPlay loop muted={isMuted} />
              )}

              <div className='absolute top-[100px] right-[20px] bg-black/40 p-3 rounded-full text-white cursor-pointer z-20 transition-all hover:scale-110' onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <FaVolumeXmark size={22} /> : <FaVolumeHigh size={22} />}
              </div>
              
              <div className='absolute bottom-[100px] right-[10px] flex flex-col items-center gap-6'>
                <div className='flex flex-col items-center' onClick={() => handleLike(loop._id)}>
                  {isLiked ? (
                    <FaHeart className='w-8 h-8 text-red-500 cursor-pointer' />
                  ) : (
                    <FaRegHeart className='w-8 h-8 text-white cursor-pointer' />
                  )}
                  <span className='text-white text-sm mt-1'>{loop.likes?.length}</span>
                </div>
                <div className='flex flex-col items-center'>
                  <FaRegComment className='w-8 h-8 text-white cursor-pointer' />
                  <span className='text-white text-sm mt-1'>{loop.comments?.length}</span>
                </div>
                <FaRegPaperPlane className='w-7 h-7 text-white cursor-pointer' />
              </div>
              
              <div className='absolute bottom-[100px] left-[20px] text-white flex flex-col gap-2'>
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate(`/profile/${loop.author?.userName}`)}>
                  <div className='w-10 h-10 rounded-full overflow-hidden border border-white'>
                    <img src={loop.author?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className='w-full h-full object-cover' />
                  </div>
                  <span className='font-semibold hover:underline'>{loop.author?.userName}</span>
                  <button className='border border-white px-3 py-1 rounded-full text-xs ml-2' onClick={(e) => { e.stopPropagation(); /* Follow logic later */ }}>Follow</button>
                </div>
                <p className='text-sm w-[250px] truncate'>{loop.caption}</p>
              </div>
            </div>
          )
        })}
        {loops.length === 0 && (
          <div className='w-full h-full flex items-center justify-center text-white'>No loops found</div>
        )}
      </div>
    </div>
  )
}

export default Loops
