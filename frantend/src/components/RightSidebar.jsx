import React from 'react'
import { useSelector } from 'react-redux'
import OtherUser from './OtherUser'
import dp from '../assets/dp.jpg'

const RightSidebar = () => {
  const { userData, suggestedUsers } = useSelector(store => store.user)
  const [showAll, setShowAll] = React.useState(false);

  return (
    <div className='hidden lg:flex flex-col w-[320px] pt-8 px-4'>
      {/* Current User */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div className='w-11 h-11 rounded-full overflow-hidden cursor-pointer'>
            <img
              src={userData?.profileImage || dp}
              alt="Profile"
              className='w-full h-full object-cover'
            />
          </div>
          <div>
            <div className='text-sm font-semibold text-black dark:text-white cursor-pointer'>
              {userData?.userName}
            </div>
            <div className='text-[13px] text-gray-500 dark:text-gray-400'>
              {userData?.name}
            </div>
          </div>
        </div>
        <div className='text-xs font-semibold text-blue-500 cursor-pointer'>
          Switch
        </div>
      </div>

      {/* Suggested Users Header */}
      <div className='flex items-center justify-between mb-4'>
        <span className='text-sm font-semibold text-gray-500 dark:text-gray-400'>Suggested for you</span>
        <span className='text-xs font-semibold text-black dark:text-white cursor-pointer hover:text-gray-400' onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'See All'}
        </span>
      </div>

      {/* Suggested Users List */}
      <div className='flex flex-col gap-4 overflow-y-auto max-h-[50vh] no-scrollbar'>
        {suggestedUsers && (showAll ? suggestedUsers : suggestedUsers.slice(0, 5)).map((user, index) => (
          <OtherUser key={index} user={user} />
        ))}
      </div>
      
      {/* Footer Links (Optional but makes it look more like IG) */}
      <div className='mt-8 text-[12px] text-gray-300'>
        <p>About • Help • Press • API • Jobs • Privacy • Terms</p>
        <p className='mt-4'>© 2024 INSTAGRAM CLONE</p>
      </div>
    </div>
  )
}

export default RightSidebar
