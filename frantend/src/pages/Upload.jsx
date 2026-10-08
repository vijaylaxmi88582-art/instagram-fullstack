import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from "react";
import { MdCameraswitch, MdOutlineFlashOn, MdOutlineFlashOff, MdMusicNote } from 'react-icons/md';
import { FiSettings, FiImage } from 'react-icons/fi';
import { IoClose, IoChevronBack } from "react-icons/io5";
import axios from 'axios';
import { serverUrl } from '../App';

const filters = [
  { name: 'Normal', class: '' },
  { name: 'Clarendon', class: 'brightness-110 contrast-125 saturate-125' },
  { name: 'Gingham', class: 'brightness-105 saturate-50 sepia-[.5]' },
  { name: 'Moon', class: 'grayscale brightness-110 contrast-110' },
  { name: 'Lark', class: 'contrast-90 saturate-150' },
  { name: 'Reyes', class: 'sepia brightness-110 contrast-75' },
  { name: 'Juno', class: 'contrast-125 saturate-150 sepia-[.3]' },
  { name: 'Slumber', class: 'sepia brightness-105 contrast-105' }
];

const Upload = () => {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("post");
  const [frontendMedia, setFrontendMedia] = useState(null);
  const [backendMedia, setBackendMedia] = useState(null);
  const [frontendMusic, setFrontendMusic] = useState(null);
  const [selectedMusicObj, setSelectedMusicObj] = useState(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [facingMode, setFacingMode] = useState("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [flash, setFlash] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Let the user select from gallery instead
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!frontendMedia) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, frontendMedia]);

  const toggleCamera = () => setFacingMode(prev => prev === "user" ? "environment" : "user");
  const toggleFlash = () => setFlash(prev => !prev);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    // If the browser supports context filter, try to apply it
    try {
        ctx.filter = getComputedStyle(video).filter;
    } catch(e) { console.log(e) }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
      setBackendMedia(file);
      setFrontendMedia(URL.createObjectURL(blob));
    }, "image/jpeg", 0.9);
  };

  const startRecording = () => {
    recordedChunksRef.current = [];
    const stream = videoRef.current.srcObject;
    let options = { mimeType: 'video/webm; codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: '' }; // Let browser choose
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], "captured_video.webm", { type: "video/webm" });
        setBackendMedia(file);
        setFrontendMedia(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (e) {
      console.error("MediaRecorder error:", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleCaptureClick = () => {
    if (uploadType === "story" || uploadType === "loop") {
      if (isRecording) stopRecording();
      else startRecording();
    } else {
      takePhoto();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendMedia(file);
      setFrontendMedia(URL.createObjectURL(file));
    }
  };

  const handleMusicSearch = async (e) => {
    e.preventDefault();
    if (!musicQuery.trim()) return;
    setIsSearchingMusic(true);
    try {
      const { data } = await axios.get(`${serverUrl}/api/music/search?q=${encodeURIComponent(musicQuery)}`, { withCredentials: true });
      setMusicResults(data.results || []);
    } catch (err) {
      console.log("Music search error:", err);
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const resetMedia = () => {
    setFrontendMedia(null);
    setBackendMedia(null);
    setFrontendMusic(null);
    setSelectedMusicObj(null);
    setCaption("");
    setActiveFilter(filters[0]);
  };

  const handleUpload = async () => {
    if (!backendMedia) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("media", backendMedia);
    if (frontendMusic) {
      formData.append("musicUrl", frontendMusic);
    }
    
    // Determine media type (image or video)
    const mediaType = backendMedia.type.startsWith("video") ? "video" : "image";
    formData.append("mediaType", mediaType);

    if (uploadType !== "story") {
      formData.append("caption", caption);
    }

    try {
      let endpoint = "";
      if (uploadType === "post") endpoint = "/api/post/upload";
      else if (uploadType === "story") endpoint = "/api/story/upload";
      else if (uploadType === "loop") endpoint = "/api/loop/upload";

      const result = await axios.post(`${serverUrl}${endpoint}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      console.log(result.data);
      navigate("/"); // Go back home on success
    } catch (error) {
      console.log("Upload error:", error);
      alert(error.response?.data?.message || "An error occurred during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // UI rendering
  return (
    <div className='w-full h-screen bg-black flex flex-col relative overflow-hidden text-white'>
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" hidden ref={mediaInputRef} onChange={handleFileChange} accept="image/*,video/*" />

      {/* --- CAMERA VIEW --- */}
      {!frontendMedia && (
        <>
          {/* Top Controls Overlay */}
          <div className="absolute top-0 w-full z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
            <IoClose className="text-[30px] cursor-pointer drop-shadow-md" onClick={() => { stopCamera(); navigate('/'); }} />
            <div onClick={toggleFlash} className="cursor-pointer">
              {flash ? <MdOutlineFlashOn className="text-[28px] drop-shadow-md text-yellow-400" /> : <MdOutlineFlashOff className="text-[28px] drop-shadow-md" />}
            </div>
            <FiSettings className="text-[26px] cursor-pointer drop-shadow-md" />
          </div>

          {/* Right Sidebar Tools */}
          <div className="absolute right-4 top-1/3 flex flex-col gap-6 z-20 bg-black/20 p-2 rounded-full backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1 cursor-pointer group">
              <MdCameraswitch onClick={toggleCamera} className="text-[28px] drop-shadow-md group-hover:scale-110 transition" />
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => mediaInputRef.current.click()}>
              <FiImage className="text-[26px] drop-shadow-md group-hover:scale-110 transition" />
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setShowMusicSearch(true)}>
              <MdMusicNote className="text-[28px] drop-shadow-md group-hover:scale-110 transition" />
            </div>
          </div>

          {/* Live Camera Feed */}
          <div className="flex-1 w-full relative bg-gray-900 rounded-3xl overflow-hidden mt-16 mb-24">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`w-full h-full object-cover ${activeFilter.class} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
            />
            {frontendMusic && <audio src={frontendMusic} autoPlay loop hidden />}
            
            {/* Recording Indicator */}
            {isRecording && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/80 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">{formatTime(recordingTime)}</span>
                </div>
            )}
          </div>

          {/* Bottom Filter Carousel */}
          <div className="absolute bottom-[130px] w-full z-20 flex overflow-x-auto gap-4 px-4 py-2 no-scrollbar snap-x">
              {filters.map((filter, index) => (
                  <div 
                      key={index} 
                      onClick={() => setActiveFilter(filter)}
                      className={`flex flex-col items-center gap-1 snap-center cursor-pointer ${activeFilter.name === filter.name ? 'scale-110' : 'scale-90 opacity-70'} transition-all`}
                  >
                      <div className={`w-[50px] h-[50px] rounded-full border-[3px] overflow-hidden ${activeFilter.name === filter.name ? 'border-white' : 'border-transparent'}`}>
                          <img src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=150&q=80" alt={filter.name} className={`w-full h-full object-cover ${filter.class}`} />
                      </div>
                      <span className="text-[10px] font-medium drop-shadow-md">{filter.name}</span>
                  </div>
              ))}
          </div>

          {/* Bottom Capture Area */}
          <div className="absolute bottom-0 w-full h-[120px] bg-black z-20 flex flex-col justify-end items-center pb-6">
              
            {/* Capture Button */}
            <div className="absolute bottom-16 w-full flex justify-center items-center">
              <div 
                  onClick={handleCaptureClick}
                  className={`w-[70px] h-[70px] rounded-full border-[4px] border-white flex justify-center items-center cursor-pointer transition-all ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
              >
                  <div className={`rounded-full transition-all ${isRecording ? 'w-[30px] h-[30px] bg-red-600' : 'w-[56px] h-[56px] bg-white'}`} />
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-6 text-[15px] font-semibold text-gray-400">
                <span onClick={() => setUploadType("post")} className={`cursor-pointer pb-1 transition-colors ${uploadType === 'post' ? 'text-white border-b-2 border-white' : 'hover:text-gray-200'}`}>POST</span>
                <span onClick={() => setUploadType("story")} className={`cursor-pointer pb-1 transition-colors ${uploadType === 'story' ? 'text-white border-b-2 border-white' : 'hover:text-gray-200'}`}>STORY</span>
                <span onClick={() => setUploadType("loop")} className={`cursor-pointer pb-1 transition-colors ${uploadType === 'loop' ? 'text-white border-b-2 border-white' : 'hover:text-gray-200'}`}>REEL</span>
            </div>
          </div>
        </>
      )}

      {/* --- PREVIEW & UPLOAD VIEW --- */}
      {frontendMedia && (
        <div className="w-full h-full flex flex-col bg-black overflow-y-auto">
            {/* Top Bar */}
            <div className="w-full h-[60px] flex items-center justify-between px-4 border-b border-gray-800">
                <IoChevronBack className="text-[28px] cursor-pointer" onClick={resetMedia} />
                <h1 className="text-[18px] font-semibold">New {uploadType}</h1>
                <button 
                    onClick={handleUpload} 
                    disabled={isLoading}
                    className="text-blue-500 font-semibold text-[16px] disabled:opacity-50"
                >
                    {isLoading ? "Sharing..." : "Share"}
                </button>
            </div>

            <div className="w-full flex-1 flex flex-col p-4 gap-6">
                {/* Media Preview */}
                <div className="w-full aspect-[4/5] bg-[#0e1316] rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800">
                    {backendMedia?.type?.startsWith("video") ? (
                        <video src={frontendMedia} controls autoPlay loop className={`w-full h-full object-contain ${activeFilter.class}`} />
                    ) : (
                        <img src={frontendMedia} alt="preview" className={`w-full h-full object-contain ${activeFilter.class}`} />
                    )}
                    {frontendMusic && <audio src={frontendMusic} autoPlay loop hidden />}
                </div>

                {/* Caption Input */}
                {uploadType !== "story" && (
                    <div className="w-full flex gap-3 border-b border-gray-800 pb-4">
                        <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" className="w-[40px] h-[40px] rounded-full object-cover" />
                        <textarea 
                            placeholder="Write a caption or add a poll..." 
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="flex-1 bg-transparent text-white outline-none resize-none min-h-[40px] pt-2"
                            rows={3}
                        />
                    </div>
                )}
                
                <div className="w-full flex flex-col gap-4 text-gray-300">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800 cursor-pointer" onClick={() => {
                        const person = prompt("Enter username to tag:");
                        if (person) setCaption(prev => prev + (prev ? ` ` : ``) + `@${person}`);
                    }}>
                        <span>Tag people</span>
                        <span>&gt;</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800 cursor-pointer" onClick={() => {
                        const loc = prompt("Enter location:");
                        if (loc) setCaption(prev => prev + ` \n📍 ${loc}`);
                    }}>
                        <span>Add location</span>
                        <span>&gt;</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800 cursor-pointer" onClick={() => {
                        const pollQ = prompt("Enter poll question:");
                        if (pollQ) {
                            const opt1 = prompt("Option 1:");
                            const opt2 = prompt("Option 2:");
                            if (opt1 && opt2) setCaption(prev => prev + `\n\n📊 Poll: ${pollQ}\n1️⃣ ${opt1}\n2️⃣ ${opt2}`);
                        }
                    }}>
                        <span>Add poll</span>
                        <span>&gt;</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800 cursor-pointer" onClick={() => setShowMusicSearch(true)}>
                        <span>Add music {selectedMusicObj && <span className="text-xs text-green-400 ml-2">({selectedMusicObj.trackName})</span>}</span>
                        <span>&gt;</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MUSIC SEARCH MODAL */}
      {showMusicSearch && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <div className="w-full h-[60px] flex items-center px-4 border-b border-gray-800">
            <IoChevronBack className="text-[28px] cursor-pointer mr-4" onClick={() => setShowMusicSearch(false)} />
            <form onSubmit={handleMusicSearch} className="flex-1">
              <input 
                type="text" 
                placeholder="Search music..." 
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg outline-none"
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isSearchingMusic ? (
              <div className="text-center text-gray-500 mt-10">Searching...</div>
            ) : musicResults.length > 0 ? (
              <div className="flex flex-col gap-4">
                {musicResults.map((track) => (
                  <div key={track.trackId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={track.artworkUrl100} alt="artwork" className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate">{track.trackName}</span>
                        <span className="text-xs text-gray-400 truncate">{track.artistName}</span>
                      </div>
                    </div>
                    <button 
                      className="ml-3 bg-white text-black px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      onClick={() => {
                        setFrontendMusic(track.previewUrl);
                        setSelectedMusicObj(track);
                        setShowMusicSearch(false);
                      }}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-10">Search for a song to add to your post.</div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Upload;

