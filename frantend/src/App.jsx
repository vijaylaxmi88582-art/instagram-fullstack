import { Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import { useSelector } from 'react-redux'
import useGetCurrent from './hooks/getCurrent'
import useGetSuggestedUsers from './hooks/getSuggestedUsers'
import useGetAllStories from './hooks/getAllStories'
import useGetAllPosts from './hooks/useGetAllPosts'
import Profile from './pages/Profile'
import EditProfile from "./pages/EditProfile";
import Upload from './pages/Upload'
import Loops from './pages/Loops'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import MainLayout from './layouts/MainLayout'

export const serverUrl = (import.meta.env.VITE_SERVER_URL || "http://localhost:8000").replace(/\/$/, "");

const App = () => {
  useGetCurrent()
  useGetSuggestedUsers()
  useGetAllStories()
  useGetAllPosts()
  const { userData } = useSelector((state) => state.user)
  const { mode } = useSelector((state) => state.theme)

  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    
    <Routes>
      <Route path='/signup' element={!userData ? <SignUp/>: <Navigate to={"/"}/>} />
      <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"}/>} />
      <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"}/>} />
      
      {userData ? (
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='profile/:userName' element={<Profile />} />
          <Route path='/upload' element={<Upload />} />
          <Route path='editprofile/' element={<EditProfile />} />
          <Route path='/loops' element={<Loops />} />
          <Route path='/search' element={<Search />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/chat/:id' element={<Chat />} />
        </Route>
      ) : (
        <Route path='*' element={<Navigate to={"/signin"} />} />
      )}
    </Routes>
    
  )
}

export default App
