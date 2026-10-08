import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const [step, setStep] = useState(1);

  const [inputClicked, setInputClicked] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1
  const handleStep1 = async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/sendotp`,
        { email },
        { withCredentials: true }
      );

      console.log(result.data);
      setStep(2);
    } catch (err) {
      console.log(err.response.data);
      setErr(err.response.data.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 2
  const handleStep2 = async () => {
    setLoading(true);
    setErr("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verifyotp`,
        { email, otp },
        { withCredentials: true }
      );

      console.log(result.data);
      setStep(3);
    } catch (err) {
      console.log(err.response.data);
      setErr(err.response.data.message || "An error occurred");
    } finally {
      setLoading(false);
      
    }
  };

  // Step 3
  const handleStep3 = async () => {
 
    if (newPassword !== confirmPassword) {
      setErr("Password not match");
      return;
    }

    
    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/resetpassword`,
        {
          email,
          newPassword,
    
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);
      alert("Password reset successfully");
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
        setErr(err.response.data.message || "An error occurred");
    } finally {
      setLoading(false);
    
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center">

      {step == 1 && (
        <div className="w-[90%] max-w-[450px] h-[370px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]">

          <h2 className="text-[30px] font-semibold">Forgot Password</h2>

          <div
            className="relative flex items-center mt-[30px] justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black"
            onClick={() =>
              setInputClicked({ ...inputClicked, email: true })
            }
          >
            <label
              htmlFor="email"
              className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${
                inputClicked.email ? "top-[-10px] text-[12px]" : ""
              }`}
            >
              Enter Email
            </label>

            <input
              type="email"
              id="email"
              className="w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          {err && <p className='text-red-500 text-[14px] font-semibold'>{err}</p>}

          <button
            className="w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[35px]"
            disabled={loading}
            onClick={handleStep1}
          >
            {loading ? <ClipLoader size={25} color="white" /> : "Send OTP"}
          </button>
        </div>

      )}

      {step == 2 && (
        <div className="w-[70%] max-w-[450px] h-[370px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]">

          <h2 className="text-[30px] font-semibold">Forgot Password OTP</h2>

          <div
            className="relative flex items-center mt-[30px] justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black"
            onClick={() =>
              setInputClicked({ ...inputClicked, otp: true })
            }
          >
            <label
              htmlFor="otp"
              className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${
                inputClicked.otp ? "top-[-10px] text-[12px]" : ""
              }`}
            >
              Enter OTP
            </label>

            <input
              type="text"
              id="otp"
              className="w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent"
              required
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
            />
          </div>
          {err && <p className='text-red-500 text-[14px] font-semibold'>{err}</p>}

          <button
            className="w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[35px]"
            disabled={loading}
            onClick={handleStep2}
          >
            {loading ? <ClipLoader size={25} color="white" /> : "Verify OTP"}
          </button>
        </div>
        
      )}

      {step == 3 && (
        <div className="w-[70%] max-w-[450px] h-[420px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]">

          <h2 className="text-[30px] font-semibold">Reset Password</h2>

          <div
            className="relative flex items-center mt-[30px] justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black"
            onClick={() =>
              setInputClicked({
                ...inputClicked,
                newPassword: true,
              })
            }
          >
            <label
              htmlFor="newPassword"
              className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${
                inputClicked.newPassword
                  ? "top-[-10px] text-[12px]"
                  : ""
              }`}
            >
              New Password
            </label>

            <input
              type="password"
              id="newPassword"
              className="w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent"
              required
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
          </div>

          <div
            className="relative flex items-center mt-[20px] justify-start w-[90%] h-[50px] rounded-2xl border-2 border-black"
            onClick={() =>
              setInputClicked({
                ...inputClicked,
                confirmPassword: true,
              })
            }
          >
            <label
              htmlFor="confirmPassword"
              className={`text-gray-700 absolute left-[20px] bg-white text-[15px] ${
                inputClicked.confirmPassword
                  ? "top-[-10px] text-[12px]"
                  : ""
              }`}
            >
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              className="w-full h-full rounded-2xl px-[20px] outline-none border-0 text-black bg-transparent"
              required
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              value={confirmPassword}
            />
          </div>
          {err && <p className='text-red-500 text-[14px] font-semibold'>{err}</p>}

          <button
            className="w-[70%] px-[20px] py-[10px] bg-black text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[35px]"
            disabled={loading}
            onClick={handleStep3}
          >
            {loading ? (
              <ClipLoader size={25} color="white" />
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;