import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import dp from '../assets/dp.jpg';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.trim() === '') {
        setResults([]);
        return;
      }
      try {
        const res = await axios.get(`${serverUrl}/api/user/search?q=${query}`, { withCredentials: true });
        setResults(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className='w-full min-h-screen bg-black flex justify-center pb-[100px]'>
      <div className='w-full max-w-[600px] flex flex-col items-center pt-[30px] px-[20px]'>
        <div className='w-full flex items-center bg-gray-900 rounded-full px-[20px] h-[50px] border border-gray-700'>
          <input 
            type="text" 
            placeholder="Search users..." 
            className='w-full bg-transparent outline-none text-white'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className='w-full mt-[30px] flex flex-col gap-[15px]'>
          {results.map((user) => (
            <div 
              key={user._id} 
              className='flex items-center gap-[15px] cursor-pointer hover:bg-gray-800 p-2 rounded-xl transition-all'
              onClick={() => navigate(`/profile/${user.userName}`)}
            >
              <div className='w-[60px] h-[60px] rounded-full overflow-hidden border border-gray-700'>
                <img src={user.profileImage || dp} alt={user.userName} className='w-full h-full object-cover' />
              </div>
              <div className='flex flex-col'>
                <span className='text-white font-semibold text-[16px]'>{user.userName}</span>
                <span className='text-gray-400 text-[14px]'>{user.name}</span>
              </div>
            </div>
          ))}
          {query && results.length === 0 && (
            <div className='text-gray-500 text-center mt-5'>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
