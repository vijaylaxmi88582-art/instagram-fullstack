import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { IoClose } from 'react-icons/io5';
import dp from '../assets/dp.jpg';
import { useSelector } from 'react-redux';

const ShareModal = ({ post, onClose }) => {
    const [conversations, setConversations] = useState([]);
    const [sentStatus, setSentStatus] = useState({});
    const { userData } = useSelector(state => state.user);

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

    const handleSend = async (receiverId) => {
        try {
            const formData = new FormData();
            formData.append("messageType", "post");
            formData.append("postId", post._id);
            formData.append("message", "Sent a post");

            await axios.post(`${serverUrl}/api/message/send/${receiverId}`, formData, { 
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

            setSentStatus(prev => ({ ...prev, [receiverId]: true }));
            setTimeout(() => {
                setSentStatus(prev => ({ ...prev, [receiverId]: false }));
            }, 3000);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-gray-900 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative border border-gray-800">
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-white font-bold text-lg">Share</h2>
                    <IoClose className="text-white text-2xl cursor-pointer hover:text-gray-400" onClick={onClose} />
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 max-h-[300px]">
                    {conversations.map(conv => {
                        const otherUser = conv.participants.find(p => p._id !== userData._id);
                        if (!otherUser) return null;
                        
                        return (
                            <div key={conv._id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <img src={otherUser.profileImage || dp} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex flex-col">
                                        <span className="text-white font-semibold text-sm">{otherUser.name}</span>
                                        <span className="text-gray-400 text-xs">@{otherUser.userName}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSend(otherUser._id)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        sentStatus[otherUser._id] 
                                        ? 'bg-transparent text-gray-400 border border-gray-600' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {sentStatus[otherUser._id] ? 'Sent' : 'Send'}
                                </button>
                            </div>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className="text-center text-gray-500 mt-4 text-sm">No recent conversations.</div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-center">
                    <button 
                        onClick={handleCopyLink}
                        className="w-full bg-gray-800 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
