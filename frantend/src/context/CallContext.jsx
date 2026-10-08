import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { useSocketContext } from './SocketContext';
import { useSelector } from 'react-redux';
import { MdCall, MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md';

const CallContext = createContext();

export const useCallContext = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    const { socket } = useSocketContext();
    const { userData } = useSelector(state => state.user);
    
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const ringtoneRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'));

    useEffect(() => {
        ringtoneRef.current.loop = true;
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('callUser', async ({ from, name: callerName, signal, isVideo }) => {
            setCall({ isReceivingCall: true, from, name: callerName, signal, isVideo });
            setIsReceivingCall(true);
            ringtoneRef.current.play().catch(e => console.log(e));
        });

        socket.on('callEnded', () => {
            endCallLocally();
        });

        socket.on('iceCandidate', async (candidate) => {
            if (connectionRef.current) {
                try {
                    await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.log("Error adding received ice candidate", e);
                }
            }
        });

        const handleInitiate = (e) => {
            const { userToCall, isVideo } = e.detail;
            callUser(userToCall, isVideo);
        };

        window.addEventListener('initiateCall', handleInitiate);

        return () => {
            socket.off('callUser');
            socket.off('callEnded');
            socket.off('iceCandidate');
            window.removeEventListener('initiateCall', handleInitiate);
        };
    }, [socket]);

    const getMediaStream = async (video) => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
            setStream(currentStream);
            setTimeout(() => {
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            }, 100);
            return currentStream;
        } catch (error) {
            console.error("Failed to get media", error);
            alert("Could not access camera/microphone.");
            return null;
        }
    };

    const answerCall = async () => {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        
        setCallAccepted(true);
        setIsReceivingCall(false);
        setIsVideoCall(call.isVideo);

        const currentStream = await getMediaStream(call.isVideo);
        if (!currentStream) return endCallLocally();

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        connectionRef.current = peer;

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('iceCandidate', { candidate: event.candidate, to: call.from });
            }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(call.signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('answerCall', { signal: answer, to: call.from });
    };

    const callUser = async (idToCall, isVideo) => {
        setIsVideoCall(isVideo);
        setCall({ isReceivingCall: false, from: userData?._id, name: userData?.userName, isVideo, to: idToCall });
        
        const currentStream = await getMediaStream(isVideo);
        if (!currentStream) return endCallLocally();

        ringtoneRef.current.play().catch(e => console.log(e));

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        connectionRef.current = peer;

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('iceCandidate', { candidate: event.candidate, to: idToCall });
            }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('callUser', { userToCall: idToCall, signalData: offer, from: userData?._id, name: userData?.userName, isVideo });

        socket.on('callAccepted', async (signal) => {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            setCallAccepted(true);
            await peer.setRemoteDescription(new RTCSessionDescription(signal));
        });
    };

    const leaveCall = () => {
        socket.emit('endCall', { to: call.from === userData?._id ? call.to : call.from });
        endCallLocally();
    };

    const endCallLocally = () => {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;

        setCallEnded(true);
        setCallAccepted(false);
        setIsReceivingCall(false);
        
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        
        setCall({});
        socket.off('callAccepted');
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = !isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <CallContext.Provider value={{ call, callAccepted, myVideo, userVideo, stream, callEnded, leaveCall, callUser, answerCall, endCallLocally }}>
            {children}
            
            {isReceivingCall && !callAccepted && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
                    <div className="bg-gray-900 p-8 rounded-2xl flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
                            <MdCall className="text-white text-4xl" />
                        </div>
                        <div className="text-white text-center">
                            <h2 className="text-xl font-bold">{call.name}</h2>
                            <p className="text-gray-400">Incoming {call.isVideo ? 'Video' : 'Audio'} Call...</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={endCallLocally} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold">Decline</button>
                            <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold">Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {(callAccepted && !callEnded) || (stream && !callAccepted && !isReceivingCall) ? (
                <div className="fixed inset-0 z-[90] bg-black flex flex-col">
                    <div className="flex-1 relative">
                        {callAccepted ? (
                            isVideoCall ? (
                                <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
                                        <span className="text-4xl text-white">{call.name?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                    <h2 className="text-2xl text-white mt-4">{call.name}</h2>
                                    <p className="text-gray-400">Connected</p>
                                </div>
                            )
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl">Calling {call.name}...</div>
                        )}
                        
                        {isVideoCall && (
                            <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
                            </div>
                        )}
                    </div>

                    <div className="h-24 bg-gray-900 flex items-center justify-center gap-8 pb-4">
                        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}>
                            {isMuted ? <MdMicOff size={28} /> : <MdMic size={28} />}
                        </button>
                        <button onClick={leaveCall} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:bg-red-700">
                            <MdCallEnd size={32} />
                        </button>
                        {isVideoCall && (
                            <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}>
                                {isVideoOff ? <MdVideocamOff size={28} /> : <MdVideocam size={28} />}
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
        </CallContext.Provider>
    );
};
