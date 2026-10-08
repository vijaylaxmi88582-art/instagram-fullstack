import React, { useRef, useState, useEffect } from 'react';
import { MdPlayArrow, MdPause } from 'react-icons/md';

const AudioPlayer = ({ src }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const curr = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setProgress((curr / total) * 100);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    return (
        <div className="flex items-center gap-2 min-w-[150px] bg-black/20 p-2 rounded-lg">
            <button 
                onClick={togglePlay} 
                className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full"
            >
                {isPlaying ? <MdPause size={20} /> : <MdPlayArrow size={20} />}
            </button>
            <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-400 transition-all duration-75"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <audio 
                ref={audioRef} 
                src={src} 
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                className="hidden"
            />
        </div>
    );
};

export default AudioPlayer;
