import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import dp from '../assets/dp.jpg';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const { userData } = useSelector(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/message/conversations`, { withCredentials: true });
                setConversations(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchConversations();
    }, []);

    return (
        <div className='w-full min-h-screen bg-black flex justify-center pb-[100px]'>
            <div className='w-full max-w-[600px] flex flex-col pt-[20px] px-[20px]'>
                <div className='flex items-center gap-[15px] text-white mb-[30px]'>
                    <MdOutlineKeyboardBackspace className='cursor-pointer w-[30px] h-[30px]' onClick={() => navigate(-1)} />
                    <h1 className='text-[22px] font-bold'>Messages</h1>
                </div>

                <div className='flex flex-col gap-[15px]'>
                    {conversations.map(conv => {
                        const otherUser = conv.participants.find(p => p._id !== userData._id);
                        if (!otherUser) return null;
                        
                        return (
                            <div 
                                key={conv._id} 
                                className='flex items-center gap-[15px] cursor-pointer hover:bg-gray-800 p-3 rounded-xl transition-all'
                                onClick={() => navigate(`/chat/${otherUser._id}`)}
                            >
                                <div className='w-[60px] h-[60px] rounded-full overflow-hidden border border-gray-700'>
                                    <img src={otherUser.profileImage || dp} alt={otherUser.userName} className='w-full h-full object-cover' />
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-white font-semibold text-[16px]'>{otherUser.name}</span>
                                    <span className='text-gray-400 text-[14px]'>@{otherUser.userName}</span>
                                </div>
                            </div>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className='text-gray-500 text-center mt-10'>No messages yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
