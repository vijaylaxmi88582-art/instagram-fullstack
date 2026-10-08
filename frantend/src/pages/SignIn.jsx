import React, { useState } from 'react'
import logo2 from '../assets/logo2.png'
import logo1 from '../assets/logo.png'
import { IoIosEye, IoIosEyeOff } from "react-icons/io"
import axios from 'axios'
import { ClipLoader } from "react-spinners"
import { useNavigate } from 'react-router-dom'
import { useDispatch } from "react-redux";
import { setUserData } from '../redux/userSlice';

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'

const SignIn = () => {
  const [inputClicked, setInputClicked] = useState({
    userName: false,
    password: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSignIn = async () => {
    setLoading(true)
    setErr("")
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        userName,
        password
      }, { withCredentials: true })
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
      }
      dispatch(setUserData(result.data))
      setLoading(false)
    } catch (error) {
      setErr(error.response?.data.message || "An error occurred")
      console.log(error)
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center'>

      <div className='w-[90%] lg:max-w-[50%] h-[420px] bg-white rounded-2xl flex justify-center items-center overflow-hidden border-2 border-[#1a1f23]'>

        <div className='w-full lg:w-[50%] h-full bg-white flex flex-col items-center p-[10px] gap-[15px]'>
          <div className='flex gap-[10px] items-center text-[20px] font-semibold mt-[20px]'>
            <span>Sign In to </span>
            <img src={logo2} alt="" className='w-[70px]' />
          </div>

          <div className='relative flex items-center justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black mt-[30px]' onClick={() => setInputClicked({ ...inputClicked, userName: true })}>
            <label htmlFor="userName" className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${inputClicked.userName ? "top-[-10px] text-[12px]" : ""}`}>Enter UserName</label>
            <input type='text' id='userName' className='w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent' required onChange={(e) => setUserName(e.target.value)} value={userName} />
          </div>

          <div className='relative flex items-center justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, password: true })}>
            <label htmlFor="password" className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${inputClicked.password ? "top-[-10px] text-[12px]" : ""}`}>Enter Password</label>
            <input type={showPassword ? 'text' : 'password'} id='password' className='w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent' required onChange={(e) => setPassword(e.target.value)} value={password} />
            {!showPassword
              ? <IoIosEye className='absolute cursor-pointer right-[20px] w-[25px] h-[25px] text-gray-500' onClick={() => setShowPassword(true)} />
              : <IoIosEyeOff className='absolute cursor-pointer right-[20px] w-[25px] h-[25px] text-gray-500' onClick={() => setShowPassword(false)} />
            }

          </div>

          {err && <p className='text-red-500 text-[14px] font-semibold'>{err}</p>}

          <div className='w-[90%] px-[20px] cursor-pointer'onClick={()=>navigate("/forgot-password")}>forgot password</div>

          <button className='w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[35px]'
            onClick={handleSignIn} disabled={loading}>
            {loading ? <ClipLoader size={25} color='white' /> : "Sign In"}
          </button>

          <p className='cursor-pointer text-gray-800' onClick={() => navigate("/signup")}>want To Create A New Account ? <span className='border-b-2 border-b-black pb-[3px] text-black'>Sign up</span></p>

        </div>

        <div className='md:w-[50%] h-full hidden lg:flex justify-center items-center bg-[#000000] flex-col gap-[10px] text-white text-[16px] font-semibold rounded-l-[30px] shadow-2xl shadow-black'>
          <img src={logo1} alt='' className='w-[40%]' />
          <p>Not Just A Platform, It's A VYBE</p>
        </div>

      </div>

    </div>
  )
}

export default SignIn