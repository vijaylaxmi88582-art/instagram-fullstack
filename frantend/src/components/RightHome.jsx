import React from 'react'
import { useSelector } from 'react-redux'
import OtherUser from './OtherUser'

const RightHome = () => {
  const { suggestedUsers } = useSelector(store => store.user)

  return (
    <div className='w-[25%] min-h-[100vh] bg-[black] border-l-2 border-gray-900 hidden lg:block p-6'>
      <h1 className='text-[white] text-[19px] font-semibold mb-6'>Suggestions For You</h1>
      <div className='flex flex-col gap-[20px]'>
        {suggestedUsers && suggestedUsers.map((user, index) => (
          <OtherUser key={index} user={user} />
        ))}
      </div>
    </div>
  )
}

export default RightHome
