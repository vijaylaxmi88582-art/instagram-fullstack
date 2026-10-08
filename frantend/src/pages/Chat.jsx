import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdOutlineKeyboardBackspace, MdSend, MdMic, MdOutlineCameraAlt, MdCall, MdVideocam, MdStop, MdEmojiEmotions } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';
import { useSocketContext } from '../context/SocketContext';
import AudioPlayer from '../components/AudioPlayer';
import CameraCapture from '../components/CameraCapture';
import EmojiPicker from 'emoji-picker-react';
import dp from '../assets/dp.jpg';

const Chat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const { socket } = useSocketContext();
    
    // Voice Message states
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Camera states
    const [showCamera, setShowCamera] = useState(false);

    // Emoji states
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/message/${id}`, { withCredentials: true });
                setMessages(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchMessages();
    }, [id]);

    useEffect(() => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId === id) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        socket.on("messageDeleted", (messageId) => {
            setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
        });

        return () => {
            socket.off("newMessage");
            socket.off("messageDeleted");
        };
    }, [socket, id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e, type = "text", file = null) => {
        if (e) e.preventDefault();
        if (type === "text" && !newMessage.trim()) return;

        try {
            const formData = new FormData();
            formData.append("messageType", type);
            if (type === "text") {
                formData.append("message", newMessage);
            } else if (file) {
                formData.append("media", file);
            }

            const res = await axios.post(`${serverUrl}/api/message/send/${id}`, formData, { 
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
            setShowEmojiPicker(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await axios.delete(`${serverUrl}/api/message/delete/${messageId}`, { withCredentials: true });
            setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
        } catch (error) {
            console.log(error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                handleSendMessage(null, "audio", file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Microphone error:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleCameraCapture = (file) => {
        handleSendMessage(null, "image", file);
    };

    const initiateCall = (isVideo) => {
        if (socket) {
            window.dispatchEvent(new CustomEvent('initiateCall', { 
                detail: { userToCall: id, isVideo }
            }));
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    return (
        <div className='w-full min-h-screen bg-black flex justify-center'>
            <div className='w-full max-w-[600px] flex flex-col h-screen relative'>
                {/* Header */}
                <div className='w-full h-[70px] bg-gray-900 flex items-center justify-between px-[20px] border-b border-gray-800 sticky top-0 z-10'>
                    <div className='flex items-center gap-[15px]'>
                        <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[30px] h-[30px]' onClick={() => navigate(-1)} />
                        <h1 className='text-[20px] text-white font-bold'>Chat</h1>
                    </div>
                    <div className='flex items-center gap-4 text-white'>
                        <MdCall className='w-[25px] h-[25px] cursor-pointer' onClick={() => initiateCall(false)} />
                        <MdVideocam className='w-[25px] h-[25px] cursor-pointer' onClick={() => initiateCall(true)} />
                    </div>
                </div>

                {/* Messages Area */}
                <div className='flex-1 overflow-y-auto p-[20px] flex flex-col gap-[15px] pb-[90px]'>
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === userData._id;
                        return (
                            <div key={index} className={`flex w-full items-center ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                {isMe && (
                                    <div 
                                        className="hidden group-hover:flex items-center justify-center mr-2 cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        title="Delete Message"
                                    >
                                        <FiTrash2 size={16} />
                                    </div>
                                )}
                                <div className={`max-w-[70%] p-[12px] rounded-2xl text-[15px] ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none'}`}>
                                    {msg.messageType === 'audio' ? (
                                        <AudioPlayer src={msg.mediaUrl} />
                                    ) : msg.messageType === 'image' ? (
                                        <img src={msg.mediaUrl} alt="media" className="rounded-lg max-w-full" />
                                    ) : msg.messageType === 'post' && msg.postId ? (
                                        <div 
                                            className="flex flex-col gap-2 cursor-pointer bg-black/20 p-2 rounded-lg hover:bg-black/40 transition-colors max-w-[250px]"
                                            onClick={() => navigate('/')} // Can be improved to open specific post later
                                        >
                                            <div className="flex items-center gap-2">
                                                <img src={msg.postId.auther?.profileImage || dp} alt="author" className="w-6 h-6 rounded-full object-cover" />
                                                <span className="font-semibold text-xs">{msg.postId.auther?.userName}</span>
                                            </div>
                                            {msg.postId.mediaType === 'video' ? (
                                                <video src={msg.postId.media} className="rounded-lg w-full aspect-square object-cover" />
                                            ) : (
                                                <img src={msg.postId.media} className="rounded-lg w-full aspect-square object-cover" />
                                            )}
                                            <span className="text-xs text-gray-300 font-semibold mt-1">Shared a post</span>
                                        </div>
                                    ) : (
                                        msg.message
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                        <div className='text-gray-500 text-center mt-10'>Say hi! 👋</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Emoji Picker Overlay */}
                {showEmojiPicker && (
                    <div className="absolute bottom-[80px] left-0 z-20">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                    </div>
                )}

                {/* Input Area */}
                <div className='w-full h-[80px] bg-black absolute bottom-0 left-0 border-t border-gray-900 flex items-center px-[20px]'>
                    <form onSubmit={(e) => handleSendMessage(e, "text")} className='w-full flex items-center gap-[10px]'>
                        <div 
                            className='w-[40px] h-[40px] bg-gray-800 rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-700'
                            onClick={() => setShowCamera(true)}
                        >
                            <MdOutlineCameraAlt className='text-white w-[22px] h-[22px]' />
                        </div>
                        
                        <div 
                            className='w-[40px] h-[40px] bg-gray-800 rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-700'
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <MdEmojiEmotions className='text-yellow-400 w-[22px] h-[22px]' />
                        </div>

                        <input 
                            type="text" 
                            className='flex-1 h-[45px] bg-gray-900 rounded-full px-[20px] text-white outline-none border border-gray-700'
                            placeholder='Message...'
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isRecording}
                        />
                        {newMessage.trim() ? (
                            <button type="submit" className='w-[45px] h-[45px] bg-blue-600 rounded-full flex justify-center items-center cursor-pointer'>
                                <MdSend className='text-white w-[20px] h-[20px]' />
                            </button>
                        ) : (
                            <div 
                                className={`w-[45px] h-[45px] rounded-full flex justify-center items-center cursor-pointer ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                                {isRecording ? <MdStop className='text-white w-[25px] h-[25px]' /> : <MdMic className='text-white w-[22px] h-[22px]' />}
                            </div>
                        )}
                    </form>
                </div>
            </div>
            
            {showCamera && (
                <CameraCapture 
                    onClose={() => setShowCamera(false)} 
                    onCapture={handleCameraCapture} 
                />
            )}
        </div>
    );
};

export default Chat;
