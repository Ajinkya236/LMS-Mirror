import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowLeft,
  Video,
  Film,
  Layers,
  Image as ImageIcon,
  Music,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Camera,
  StopCircle,
  RefreshCw,
  Upload,
  Search,
  Check,
  Zap,
  ZapOff,
  Clock,
  Play,
  Pause,
  Sliders,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  FileCheck
} from 'lucide-react';
import {
  shortsService,
  ShortMediaType,
  INITIAL_CREATORS
} from '../services/shortsService';

type CreationStep = 'camera' | 'details-and-tags';
type CreationMode = 'record' | 'upload-video' | 'add-photo';

export const CreateShortPage: React.FC = () => {
  const navigate = useNavigate();
  const config = shortsService.getConfig();

  // Step 1: Camera screen (default) -> Step 2: Details & Tags
  const [step, setStep] = useState<CreationStep>('camera');
  // Mode default: 'record'
  const [mode, setMode] = useState<CreationMode>('record');
  const [mediaType, setMediaType] = useState<ShortMediaType>('video');

  // Max duration limit (default 60s)
  const [maxDurationSeconds, setMaxDurationSeconds] = useState<number>(60);

  // Live Camera & Recording State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Media state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [carouselPhotoIndex, setCarouselPhotoIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>('');
  const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);

  // Thumbnail selection
  const [thumbnailOption, setThumbnailOption] = useState<'auto' | 'custom'>('auto');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');

  // Latest gallery thumbnail for gallery button
  const latestThumbnail = shortsService.getApprovedShorts()[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80';

  // Metadata Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#SystemDesign']);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const recordedPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const modeScrollRef = useRef<HTMLDivElement>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  // Request browser camera & mic permissions
  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: true
      });
      streamRef.current = stream;
      setHasCameraPermission(true);
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play().catch(err => {
          console.warn('AutoPlay failed:', err);
        });
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setHasCameraPermission(false);
    }
  }, [cameraFacing, stopCamera]);

  // Start camera on mount if in 'record' mode
  useEffect(() => {
    if (step === 'camera' && mode === 'record' && !recordedBlobUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, mode, recordedBlobUrl, startCamera, stopCamera]);

  // Switch creation mode
  const handleSelectMode = (newMode: CreationMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setErrorMsg(null);
    setRecordedBlobUrl(null);
    setRecordDuration(0);
    setIsRecording(false);
    setIsPaused(false);

    if (newMode === 'record') {
      setMediaType('video');
      setMediaUrls([]);
      startCamera();
    } else if (newMode === 'upload-video') {
      stopCamera();
      setMediaType('video');
      setMediaUrls([]);
    } else if (newMode === 'add-photo') {
      stopCamera();
      setMediaType('photo');
      setMediaUrls([]);
    }
  };

  // Flip Camera (Front / Back)
  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Start Recording
  const handleStartRecording = () => {
    if (isRecording) return;
    setErrorMsg(null);
    recordedChunksRef.current = [];

    if (streamRef.current) {
      try {
        const recorder = new MediaRecorder(streamRef.current);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          setMediaUrls([url]);
          setMediaType('video');
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error('MediaRecorder start error:', err);
      }
    }

    setIsRecording(true);
    setIsPaused(false);
    setRecordDuration(0);

    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => {
        if (prev >= maxDurationSeconds) {
          handleStopRecording();
          return maxDurationSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Pause / Resume Recording
  const handleTogglePauseRecording = () => {
    if (!isRecording) return;

    if (isPaused) {
      // Resume
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      setIsPaused(false);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => {
          if (prev >= maxDurationSeconds) {
            handleStopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Pause
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(true);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!streamRef.current || recordedChunksRef.current.length === 0) {
      // Fallback live learning sample clip
      const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      setRecordedBlobUrl(fallbackUrl);
      setMediaUrls([fallbackUrl]);
      setMediaType('video');
    }
    stopCamera();
  };

  // Retake Recording
  const handleRetake = () => {
    setRecordedBlobUrl(null);
    setMediaUrls([]);
    setRecordDuration(0);
    startCamera();
  };

  // Handle Gallery Pick (Both video and photo supported)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > config.maxVideoFileSizeMB) {
        setErrorMsg(`Video size exceeds ${config.maxVideoFileSizeMB}MB limit.`);
        return;
      }
      setMode('upload-video');
      setMediaType('video');
      setMediaUrls([url]);
      setRecordedBlobUrl(url);
    } else {
      setMode('add-photo');
      setMediaType('photo');
      setMediaUrls([url]);
      setCarouselPhotoIndex(0);
    }
  };

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxVideoFileSizeMB) {
      setErrorMsg(`Video size (${sizeMB.toFixed(1)} MB) exceeds maximum limit of ${config.maxVideoFileSizeMB} MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setMediaUrls([url]);
    setMediaType('video');
    setRecordedBlobUrl(url);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    const maxAllowed = config.maxCarouselPhotos;

    for (let i = 0; i < files.length; i++) {
      newUrls.push(URL.createObjectURL(files[i]));
    }

    const merged = [...mediaUrls, ...newUrls].slice(0, maxAllowed);
    setMediaUrls(merged);
    setMediaType(merged.length > 1 ? 'carousel' : 'photo');
    setCarouselPhotoIndex(0);
  };

  // Remove a photo from carousel
  const removePhoto = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    setMediaType(updated.length > 1 ? 'carousel' : 'photo');
    if (carouselPhotoIndex >= updated.length) {
      setCarouselPhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  // Handle Audio File
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxAudioFileSizeMB) {
      setErrorMsg(`Audio file (${sizeMB.toFixed(1)} MB) exceeds limit of ${config.maxAudioFileSizeMB} MB.`);
      return;
    }
    setAudioUrl(URL.createObjectURL(file));
    setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
    setIsAudioPickerOpen(false);
    showToast('🎵 Audio track attached!');
  };

  // Predefined Stock Audios
  const stockAudios = [
    { title: 'Inspirational Tech Beat', url: 'https://actions.google.com/sounds/v1/science_fiction/ambient_space_hum.ogg' },
    { title: 'Productivity Focus Flow', url: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg' },
    { title: 'Modern Acoustic Motivation', url: 'https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg' }
  ];

  // Custom Tag
  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    let clean = customTagInput.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;

    const val = shortsService.validateTag(clean);
    if (!val.isValid) {
      setTagError(val.error || 'Invalid tag');
      return;
    }

    if (customTags.includes(clean) || selectedTags.includes(clean)) {
      setTagError('Tag is already added');
      return;
    }

    setCustomTags(prev => [...prev, clean]);
    setCustomTagInput('');
    setTagError(null);
  };

  // Submit Short
  const handleSubmit = () => {
    if (!title.trim()) {
      showToast('⚠️ Please enter a title for your Short');
      return;
    }

    if (mediaUrls.length === 0) {
      showToast('⚠️ Please provide video or photo content');
      return;
    }

    const allTags = Array.from(new Set([...selectedTags, ...customTags]));
    if (allTags.length === 0) {
      showToast('⚠️ Please select or add at least one learning tag');
      return;
    }

    setIsSubmitting(true);

    const res = shortsService.submitShort({
      title: title.trim(),
      description: description.trim(),
      mediaType: mediaUrls.length > 1 && mediaType !== 'video' ? 'carousel' : mediaType,
      mediaUrls,
      audioUrl: audioUrl || undefined,
      audioTitle: audioTitle || undefined,
      tags: allTags,
      author: INITIAL_CREATORS['u_current']
    });

    setIsSubmitting(false);

    if (res.success) {
      stopCamera();
      showToast('🎉 Short submitted for Content Manager review!');
      setTimeout(() => {
        navigate('/shorts');
      }, 900);
    } else {
      showToast(`❌ Submission failed: ${res.error}`);
    }
  };

  // Recording Progress percentage (0 - 100)
  const recordingProgressPercent = Math.min(100, (recordDuration / maxDurationSeconds) * 100);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 top-0 md:top-16 bottom-16 md:bottom-0 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none z-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-slate-900/95 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={handleGalleryUpload}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleVideoUpload}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
      />
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setCustomThumbnailUrl(URL.createObjectURL(file));
        }}
      />

      {/* ========================================================================= */}
      {/* STEP 1: INSTAGRAM-STYLE FULL-SCREEN CAMERA & CREATION SCREEN */}
      {/* ========================================================================= */}
      {step === 'camera' && (
        <div className="relative w-full h-full flex flex-col justify-between bg-black overflow-hidden">
          {/* Top Camera Progress Bar when recording */}
          {isRecording && (
            <div className="absolute top-0 inset-x-0 h-1.5 bg-white/20 z-50 overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.9)]"
                style={{ width: `${recordingProgressPercent}%` }}
              />
            </div>
          )}

          {/* --- TOP CAMERA OVERLAY --- */}
          <div className="absolute top-0 inset-x-0 z-40 p-4 pt-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
            {/* Top-Left: Close Button -> /shorts */}
            <button
              onClick={() => {
                stopCamera();
                navigate('/shorts');
              }}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10"
              title="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top-Center: Recording Timer / Max Duration Selector */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{formatTime(recordDuration)} / {formatTime(maxDurationSeconds)}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMaxDurationSeconds(prev => (prev === 60 ? 30 : prev === 30 ? 15 : 60));
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/15 flex items-center gap-1.5 transition-all"
                  title="Toggle Maximum Duration"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{maxDurationSeconds}s</span>
                </button>
              )}
            </div>

            {/* Top-Right: Camera Utility Controls */}
            <div className="flex items-center gap-2">
              {/* Sound Track Picker */}
              <button
                onClick={() => setIsAudioPickerOpen(true)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/10 ${
                  audioUrl ? 'bg-blue-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title="Add Audio Track"
              >
                <Music className="w-5 h-5" />
              </button>

              {/* Flash / Light Simulation */}
              {mode === 'record' && (
                <button
                  onClick={() => setIsFlashActive(p => !p)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/10 ${
                    isFlashActive ? 'bg-yellow-500 text-black' : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                  title="Toggle Flash"
                >
                  {isFlashActive ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                </button>
              )}

              {/* Flip Camera */}
              {mode === 'record' && !recordedBlobUrl && (
                <button
                  onClick={toggleCameraFacing}
                  className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* --- CENTER FULL-SCREEN VIEWFINDER --- */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
            {/* Flash Overlay */}
            {isFlashActive && (
              <div className="absolute inset-0 bg-white/20 z-30 pointer-events-none mix-blend-screen" />
            )}

            {/* 1. RECORD MODE: Live Camera Stream OR Playback Preview */}
            {mode === 'record' && (
              <div className="absolute inset-0 w-full h-full">
                {recordedBlobUrl ? (
                  /* Recorded Video Review Preview */
                  <div className="relative w-full h-full">
                    <video
                      ref={recordedPreviewRef}
                      src={recordedBlobUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-16 left-4 z-30 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-400 flex items-center gap-1.5 border border-green-500/30">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Take Recorded ({formatTime(recordDuration)})</span>
                    </div>
                  </div>
                ) : (
                  /* Live Camera Viewfinder Edge-to-Edge */
                  <div className="relative w-full h-full">
                    <video
                      ref={videoStreamRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover z-10"
                    />

                    {/* Interactive Fallback Camera Stream in case hardware permission is denied or sandbox without webcam */}
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 z-0">
                        <video
                          ref={fallbackVideoRef}
                          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute top-16 inset-x-4 z-20 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-400 animate-pulse" />
                            <span className="text-xs font-semibold text-gray-200">Simulated HD Camera Ready</span>
                          </div>
                          <button
                            onClick={startCamera}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] font-bold text-white transition-colors"
                          >
                            Grant Access
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. UPLOAD VIDEO MODE */}
            {mode === 'upload-video' && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                {mediaUrls.length > 0 ? (
                  <div className="relative w-full h-full">
                    <video
                      src={mediaUrls[0]}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-24 left-4 right-4 z-30 flex items-center justify-between">
                      <button
                        onClick={() => videoInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20"
                      >
                        Change Video
                      </button>
                      <button
                        onClick={() => setStep('details-and-tags')}
                        className="px-5 py-2 rounded-xl bg-[#002B7F] hover:bg-blue-600 text-white text-xs font-bold shadow-lg"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full max-w-sm aspect-[9/16] max-h-[70vh] border-2 border-dashed border-white/25 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:bg-white/5 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Select Video File</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-xs">
                      Upload vertical MP4, MOV, or WebM clips up to {config.maxVideoFileSizeMB}MB.
                    </p>
                    <button className="px-6 py-2.5 rounded-full bg-[#002B7F] text-white text-xs font-bold group-hover:bg-blue-600 shadow-lg">
                      Choose from Device
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. ADD PHOTO POST MODE */}
            {mode === 'add-photo' && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                {mediaUrls.length > 0 ? (
                  <div className="relative w-full h-full flex flex-col justify-between">
                    <div className="relative flex-1 w-full overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={mediaUrls[carouselPhotoIndex] || mediaUrls[0]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Carousel Indicator */}
                      <div className="absolute top-16 inset-x-0 flex items-center justify-center gap-1.5 z-30">
                        {mediaUrls.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${
                              carouselPhotoIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Navigation Arrows */}
                      {carouselPhotoIndex > 0 && (
                        <button
                          onClick={() => setCarouselPhotoIndex(p => p - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white backdrop-blur-md z-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      {carouselPhotoIndex < mediaUrls.length - 1 && (
                        <button
                          onClick={() => setCarouselPhotoIndex(p => p + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white backdrop-blur-md z-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Thumbnail Strip & Actions */}
                    <div className="mb-20 pt-2 flex items-center justify-between gap-2 px-4 z-30">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[65%]">
                        {mediaUrls.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCarouselPhotoIndex(idx)}
                            className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border ${
                              carouselPhotoIndex === idx ? 'border-blue-400 scale-105' : 'border-white/20 opacity-70'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePhoto(idx);
                              }}
                              className="absolute top-0 right-0 bg-red-600 p-0.5 rounded-bl text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {mediaUrls.length < config.maxCarouselPhotos && (
                          <button
                            onClick={() => photoInputRef.current?.click()}
                            className="w-10 h-10 rounded-lg border border-dashed border-white/40 flex items-center justify-center text-white/70 hover:text-white flex-shrink-0"
                            title="Add More Photos"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setStep('details-and-tags')}
                        className="px-5 py-2.5 rounded-xl bg-[#002B7F] hover:bg-blue-600 text-white text-xs font-bold shadow-lg flex-shrink-0"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full max-w-sm aspect-[9/16] max-h-[70vh] border-2 border-dashed border-white/25 hover:border-purple-500 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:bg-white/5 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Add Photo Post</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-xs">
                      Select 1 to {config.maxCarouselPhotos} photos to create an interactive learning deck.
                    </p>
                    <button className="px-6 py-2.5 rounded-full bg-[#002B7F] text-white text-xs font-bold group-hover:bg-blue-600 shadow-lg">
                      Upload Photos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- BOTTOM SHUTTER, GALLERY BUTTON & MODE CAROUSEL --- */}
          <div className="relative mt-auto bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-4 flex flex-col items-center gap-3 z-40">
            {/* Shutter / Capture Trigger Row */}
            <div className="flex items-center justify-between w-full max-w-xs px-2">
              {/* Left Action: Gallery Button (Instagram style thumbnail icon) */}
              <div className="w-14 flex justify-start">
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-white/80 hover:border-white shadow-lg backdrop-blur-md active:scale-95 transition-transform group flex items-center justify-center bg-black/50"
                  title="Open Gallery"
                >
                  <img src={latestThumbnail} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                  <ImageIcon className="w-3.5 h-3.5 text-white drop-shadow absolute bottom-1 right-1" />
                </button>
              </div>

              {/* Center: Compact Record Shutter Button */}
              <div className="relative flex items-center justify-center">
                {mode === 'record' ? (
                  recordedBlobUrl ? (
                    /* Proceed to Next Step */
                    <button
                      onClick={() => setStep('details-and-tags')}
                      className="px-5 py-2.5 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white font-bold text-xs shadow-xl flex items-center gap-1.5 animate-bounce"
                    >
                      <span>Proceed</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    /* Instagram Camera Smaller Shutter */
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className="relative w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                      title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {/* Outer Ring */}
                      <div
                        className={`absolute inset-0 rounded-full border-[3px] transition-all duration-300 ${
                          isRecording
                            ? 'border-red-500 scale-110'
                            : 'border-white hover:border-gray-200'
                        }`}
                      />

                      {/* Inner Trigger */}
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          isRecording
                            ? 'w-6 h-6 bg-red-600 rounded-md animate-pulse'
                            : 'w-11 h-11 bg-white hover:bg-gray-100 flex items-center justify-center'
                        }`}
                      >
                        {!isRecording && <div className="w-9 h-9 rounded-full border-2 border-red-500" />}
                      </div>
                    </button>
                  )
                ) : mode === 'upload-video' ? (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg active:scale-95 transition-all"
                    title="Upload Video"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-500 shadow-lg active:scale-95 transition-all"
                    title="Upload Photos"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Right Action: Pause/Resume or Retake or Stop */}
              <div className="w-14 flex justify-end">
                {mode === 'record' && recordedBlobUrl ? (
                  <button
                    onClick={handleRetake}
                    className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
                    title="Retake Video"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                ) : mode === 'record' && isRecording ? (
                  <button
                    onClick={handleTogglePauseRecording}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${
                      isPaused ? 'bg-green-600 text-white animate-pulse' : 'bg-white/20 text-white'
                    }`}
                    title={isPaused ? 'Resume Recording' : 'Pause Recording'}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  </button>
                ) : (
                  <div className="w-10 h-10" />
                )}
              </div>
            </div>

            {/* --- HORIZONTALLY SCROLLABLE OPTIONS CAROUSEL (Instagram Style) --- */}
            <div
              ref={modeScrollRef}
              className="flex items-center justify-center gap-6 overflow-x-auto no-scrollbar py-1 px-4 max-w-full text-[11px] font-bold uppercase tracking-wider"
            >
              {/* Option 1: RECORD VIDEO (Default) */}
              <button
                onClick={() => handleSelectMode('record')}
                className={`flex flex-col items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'record' ? 'text-white font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>RECORD VIDEO</span>
                {mode === 'record' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
              </button>

              {/* Option 2: UPLOAD VIDEO */}
              <button
                onClick={() => handleSelectMode('upload-video')}
                className={`flex flex-col items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'upload-video' ? 'text-white font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>UPLOAD VIDEO</span>
                {mode === 'upload-video' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
              </button>

              {/* Option 3: ADD PHOTO POST */}
              <button
                onClick={() => handleSelectMode('add-photo')}
                className={`flex flex-col items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                  mode === 'add-photo' ? 'text-white font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>ADD PHOTO POST</span>
                {mode === 'add-photo' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DETAILS & TAGS (Clean Enterprise Light UI) */}
      {/* ========================================================================= */}
      {step === 'details-and-tags' && (
        <div className="fixed inset-0 top-0 md:top-16 bottom-0 bg-gray-50 text-gray-900 overflow-y-auto pb-24 z-50">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('camera')}
                  className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Back to Camera"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#002B7F]" />
                    <span>Publish Learning Short</span>
                  </h1>
                  <p className="text-xs text-gray-500">Provide metadata, tags, and cover for employee discovery</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Media Preview Thumbnail & Mode Summary */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {mediaType === 'video' ? (
                    <video src={mediaUrls[0]} className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#002B7F] px-2 py-0.5 rounded">
                    {mediaType === 'video' ? 'Video Short' : mediaType === 'carousel' ? `Photo Deck (${mediaUrls.length} cards)` : 'Single Photo'}
                  </span>
                  <div className="text-xs font-semibold text-gray-700 mt-1">
                    {mediaType === 'video' ? `Clip ready for review` : `${mediaUrls.length} slides loaded`}
                  </div>
                  <button
                    onClick={() => setStep('camera')}
                    className="text-[11px] text-blue-600 hover:underline font-bold mt-1 inline-block"
                  >
                    Change media
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Short Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Demystifying Kafka Partitioning in 60s"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:bg-white transition-all"
                  maxLength={100}
                />
                <div className="text-right text-[10px] text-gray-400 mt-1">{title.length}/100</div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly explain what colleagues will learn from this short..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:bg-white transition-all resize-none"
                  maxLength={400}
                />
              </div>

              {/* Predefined Enterprise Learning Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Enterprise Tags <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2.5">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search enterprise tags..."
                    className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-gray-200 rounded-xl bg-gray-50">
                  {config.predefinedTags
                    .filter(t => t.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                    .map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSelectedTags(prev =>
                              isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all ${
                            isSelected
                              ? 'bg-[#002B7F] text-white font-bold shadow-sm'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Custom Tag Addition */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Add Custom Tag
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="#NewTopic"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
                {tagError && <p className="text-xs text-red-600 mt-1">{tagError}</p>}
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customTags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span>{tag}</span>
                        <X
                          className="w-3.5 h-3.5 cursor-pointer hover:text-red-700"
                          onClick={() => setCustomTags(prev => prev.filter(t => t !== tag))}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('camera')}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100"
                >
                  Back to Camera
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-8 py-2.5 rounded-xl bg-[#002B7F] hover:bg-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Moderation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Track Picker Modal */}
      {isAudioPickerOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-blue-400" />
                <span>Select Learning Audio</span>
              </h3>
              <button onClick={() => setIsAudioPickerOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Soundtracks</div>
              {stockAudios.map((stock, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setAudioUrl(stock.url);
                    setAudioTitle(stock.title);
                    setIsAudioPickerOpen(false);
                    showToast(`🎵 Attached ${stock.title}`);
                  }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="text-xs font-semibold text-white">{stock.title}</div>
                  <Music className="w-4 h-4 text-blue-400" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => audioInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Upload Audio File (.mp3, .wav)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateShortPage;
