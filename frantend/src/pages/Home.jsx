import React from 'react'
import Feed from '../components/Feed'
import RightSidebar from '../components/RightSidebar'

const Home = () => {
  return (
    <div className='w-full max-w-[900px] mx-auto flex justify-center pt-8'>
      <Feed />
      <div className='hidden lg:block ml-16'>
        <RightSidebar />
      </div>
    </div>
  )
}

export default Home