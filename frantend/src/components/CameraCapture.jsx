import React, { useRef, useState, useCallback } from 'react';
import { MdOutlineCameraAlt, MdClose, MdCameraswitch } from 'react-icons/md';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
    const [isCameraReady, setIsCameraReady] = useState(false);

    const startCamera = useCallback(async (mode) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode }
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                setIsCameraReady(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            onClose();
        }
    }, [stream, onClose]);

    React.useEffect(() => {
        startCamera(facingMode);
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Run only on mount

    const switchCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        startCamera(newMode);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get base64 string
            const dataUrl = canvas.toDataURL('image/jpeg');
            
            // Convert dataUrl to File object to be compatible with other upload components
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                    onClose();
                });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 text-white">
                <MdClose className="w-8 h-8 cursor-pointer" onClick={onClose} />
                <MdCameraswitch className="w-8 h-8 cursor-pointer" onClick={switchCamera} />
            </div>
            
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full max-h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        Initializing Camera...
                    </div>
                )}
            </div>

            <div className="h-32 flex items-center justify-center bg-black pb-8">
                <div 
                    onClick={takePhoto}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                >
                    <div className="w-16 h-16 rounded-full bg-white"></div>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
