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
  Camera,
  StopCircle,
  RefreshCw,
  Upload,
  Search,
  Check,
  Zap,
  ZapOff,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  FileCheck,
  GripVertical,
  Headphones,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  shortsService,
  ShortMediaType,
  INITIAL_CREATORS
} from '../services/shortsService';

type CreationStep = 'capture' | 'photo-audio' | 'preview' | 'details-and-tags';
type CreationMode = 'record' | 'upload-video' | 'add-photo';

interface CuratedTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  url: string;
}

const CURATED_SOUNDTRACKS: CuratedTrack[] = [
  {
    id: 'track_1',
    title: 'Deep Focus & Flow (Lo-Fi Beat)',
    category: 'Engineering & Code',
    duration: '0:45',
    url: 'https://actions.google.com/sounds/v1/science_fiction/scifi_hum.ogg'
  },
  {
    id: 'track_2',
    title: 'Tech Explainer (Upbeat Acoustic)',
    category: 'Architecture & Design',
    duration: '0:50',
    url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg'
  },
  {
    id: 'track_3',
    title: 'Enterprise Innovation (Electronic Pulse)',
    category: 'Cloud & Infrastructure',
    duration: '0:55',
    url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_depart.ogg'
  },
  {
    id: 'track_4',
    title: 'Productivity Pulse (Ambient Synth)',
    category: 'Agile & Best Practices',
    duration: '0:40',
    url: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg'
  }
];

export const CreateShortPage: React.FC = () => {
  const navigate = useNavigate();
  const config = shortsService.getConfig();

  // Multi-step creation workflow: capture -> photo-audio (intermediate for photos) -> preview -> details-and-tags
  const [step, setStep] = useState<CreationStep>('capture');
  const [mode, setMode] = useState<CreationMode>('record');
  const [mediaType, setMediaType] = useState<ShortMediaType>('video');

  // Max duration (60s default)
  const maxDurationSeconds = 60;

  // Live Camera & Recording State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Reel-Style Video Preview State
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);

  // Audio Controls
  const [isVideoAudioEnabled, setIsVideoAudioEnabled] = useState(true); // Original Video Sound
  const [isAddedAudioEnabled, setIsAddedAudioEnabled] = useState(true); // Added Music / External Audio

  // External Audio State
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>('');
  const [selectedCuratedId, setSelectedCuratedId] = useState<string | null>(null);
  const [previewAudioPlayingId, setPreviewAudioPlayingId] = useState<string | null>(null);

  // Media state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [carouselPhotoIndex, setCarouselPhotoIndex] = useState(0);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');

  // Drag and drop photo sequencing state
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  // Metadata Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const externalAudioRef = useRef<HTMLAudioElement>(null);
  const trackAudioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Latest thumbnail for circular gallery button
  const latestThumbnail = shortsService.getApprovedShorts()[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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
          console.warn('AutoPlay error:', err);
        });
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setHasCameraPermission(false);
    }
  }, [cameraFacing, stopCamera]);

  // Start camera on mount if in capture step and (record mode or add-photo mode)
  useEffect(() => {
    if (step === 'capture' && (mode === 'record' || mode === 'add-photo') && !recordedBlobUrl) {
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
    setStep('capture');
    setAudioUrl('');
    setAudioTitle('');
    setSelectedCuratedId(null);

    if (newMode === 'record') {
      setMediaType('video');
      setMediaUrls([]);
      startCamera();
    } else if (newMode === 'upload-video') {
      stopCamera();
      setMediaType('video');
      setMediaUrls([]);
    } else if (newMode === 'add-photo') {
      setMediaType('photo');
      setMediaUrls([]);
      startCamera();
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Start video recording
  const handleStartRecording = () => {
    recordedChunksRef.current = [];
    setRecordDuration(0);
    setIsPaused(false);

    let stream = streamRef.current;
    if (!stream && videoStreamRef.current) {
      // @ts-ignore
      if (videoStreamRef.current.captureStream) {
        // @ts-ignore
        stream = videoStreamRef.current.captureStream();
      }
    }

    if (stream) {
      try {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          setMediaUrls([url]);
          setMediaType('video');
          setIsPreviewPlaying(true);
          setStep('preview');
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('MediaRecorder fallback:', e);
      }
    }

    setIsRecording(true);

    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => {
        const next = prev + 1;
        if (next >= maxDurationSeconds) {
          handleStopRecording();
          return maxDurationSeconds;
        }
        return next;
      });
    }, 1000);

    showToast('🔴 Recording 60s Learning Short');
  };

  // Pause / Resume recording
  const handleTogglePauseRecording = () => {
    if (!isRecording) return;
    if (isPaused) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(p => {
          const n = p + 1;
          if (n >= maxDurationSeconds) {
            handleStopRecording();
            return maxDurationSeconds;
          }
          return n;
        });
      }, 1000);
      setIsPaused(false);
      showToast('▶️ Resumed recording');
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsPaused(true);
      showToast('⏸️ Paused recording');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      setRecordedBlobUrl(fallbackUrl);
      setMediaUrls([fallbackUrl]);
      setMediaType('video');
      setIsPreviewPlaying(true);
      setStep('preview');
    }
    stopCamera();
  };

  // Retake video
  const handleRetake = () => {
    setRecordedBlobUrl(null);
    setMediaUrls([]);
    setRecordDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setStep('capture');
    startCamera();
  };

  // Snap photo from camera
  const handleSnapPhoto = () => {
    const video = videoStreamRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setMediaUrls(prev => {
          const next = [...prev, dataUrl];
          setMediaType(next.length > 1 ? 'carousel' : 'photo');
          return next;
        });
        showToast('📸 Photo captured! Add more or tap Next: Add Audio');
        return;
      }
    }

    const fallbackPhotos = [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
    ];
    const picked = fallbackPhotos[mediaUrls.length % fallbackPhotos.length];
    setMediaUrls(prev => {
      const next = [...prev, picked];
      setMediaType(next.length > 1 ? 'carousel' : 'photo');
      return next;
    });
    showToast('📸 Photo snapped! Add more or proceed to Add Audio');
  };

  // Handle Video Upload from Device
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > config.maxVideoFileSizeMB * 1024 * 1024) {
      setErrorMsg(`Video exceeds max allowed size of ${config.maxVideoFileSizeMB}MB`);
      showToast(`⚠️ File exceeds max ${config.maxVideoFileSizeMB}MB`);
      return;
    }

    const url = URL.createObjectURL(file);
    setMediaUrls([url]);
    setMediaType('video');
    setIsPreviewPlaying(true);
    setStep('preview');
  };

  // Handle Multi-Photo Upload from Gallery (Supports multiple)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const maxPhotos = config.maxCarouselPhotos;

    for (let i = 0; i < Math.min(files.length, maxPhotos); i++) {
      urls.push(URL.createObjectURL(files[i]));
    }

    setMediaUrls(prev => {
      const combined = [...prev, ...urls].slice(0, maxPhotos);
      setMediaType(combined.length > 1 ? 'carousel' : 'photo');
      return combined;
    });
    setCarouselPhotoIndex(0);
    showToast(`📸 ${urls.length} photo${urls.length > 1 ? 's' : ''} added from gallery!`);
  };

  // Circular Gallery Picker (supports both video and photos)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mode === 'add-photo') {
      const urls: string[] = [];
      const maxPhotos = config.maxCarouselPhotos;
      for (let i = 0; i < Math.min(files.length, maxPhotos); i++) {
        urls.push(URL.createObjectURL(files[i]));
      }
      setMediaUrls(prev => {
        const combined = [...prev, ...urls].slice(0, maxPhotos);
        setMediaType(combined.length > 1 ? 'carousel' : 'photo');
        return combined;
      });
      showToast(`📸 ${urls.length} photo${urls.length > 1 ? 's' : ''} selected from gallery`);
      return;
    }

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      setMediaType('video');
      setMediaUrls([url]);
      setIsPreviewPlaying(true);
      setStep('preview');
    } else {
      setMediaUrls(prev => {
        const next = [...prev, url];
        setMediaType(next.length > 1 ? 'carousel' : 'photo');
        return next;
      });
      setStep('photo-audio');
    }
  };

  // Handle Custom Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > config.maxAudioFileSizeMB * 1024 * 1024) {
      setErrorMsg(`Audio exceeds maximum size of ${config.maxAudioFileSizeMB}MB`);
      showToast(`⚠️ Audio exceeds ${config.maxAudioFileSizeMB}MB limit`);
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
    setSelectedCuratedId(null);
    setIsAddedAudioEnabled(true);
    showToast(`🎵 Audio "${file.name}" attached`);
  };

  const handleSelectCuratedTrack = (track: CuratedTrack) => {
    setAudioUrl(track.url);
    setAudioTitle(track.title);
    setSelectedCuratedId(track.id);
    setIsAddedAudioEnabled(true);
    showToast(`🎵 Selected "${track.title}"`);
  };

  const handleToggleTrackAudioPreview = (track: CuratedTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewAudioPlayingId === track.id) {
      if (trackAudioRef.current) {
        trackAudioRef.current.pause();
      }
      setPreviewAudioPlayingId(null);
    } else {
      setPreviewAudioPlayingId(track.id);
      if (trackAudioRef.current) {
        trackAudioRef.current.src = track.url;
        trackAudioRef.current.play().catch(() => {});
      }
    }
  };

  const handleRemoveAudio = () => {
    setAudioUrl('');
    setAudioTitle('');
    setSelectedCuratedId(null);
    setIsAddedAudioEnabled(false);
    if (trackAudioRef.current) {
      trackAudioRef.current.pause();
    }
    setPreviewAudioPlayingId(null);
    showToast('Removed audio track');
  };

  // Reordering Photo Deck in Preview
  const handleDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === index) return;

    const updated = [...mediaUrls];
    const [moved] = updated.splice(draggedPhotoIndex, 1);
    updated.splice(index, 0, moved);
    setDraggedPhotoIndex(index);
    setMediaUrls(updated);
  };

  const handleDragEnd = () => {
    setDraggedPhotoIndex(null);
  };

  // Remove single photo in preview
  const handleRemovePhoto = (index: number) => {
    const next = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(next);
    if (carouselPhotoIndex >= next.length) {
      setCarouselPhotoIndex(Math.max(0, next.length - 1));
    }
    if (next.length === 0) {
      setStep('capture');
    } else if (next.length === 1) {
      setMediaType('photo');
    }
    showToast('Photo removed');
  };

  // Custom Tag Addition (Max 10 total topics, NO hashtags)
  const handleAddCustomTag = () => {
    setTagError(null);
    let tag = customTagInput.replace(/^#/, '').trim();
    if (!tag) return;

    if (selectedTags.length + customTags.length >= 10) {
      setTagError('⚠️ Maximum 10 topics allowed per reel.');
      return;
    }

    if (tag.length < 2 || tag.length > 30) {
      setTagError('Tags must be between 2 and 30 characters.');
      return;
    }

    if (
      selectedTags.some(t => t.toLowerCase() === tag.toLowerCase()) ||
      customTags.some(t => t.toLowerCase() === tag.toLowerCase())
    ) {
      setTagError('This tag is already added.');
      return;
    }

    setCustomTags(prev => [...prev, tag]);
    setCustomTagInput('');
  };

  // Final Publish Submission
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

    if (allTags.length > 10) {
      showToast('⚠️ Maximum 10 topics allowed per reel');
      return;
    }

    setIsSubmitting(true);

    const res = shortsService.submitShort({
      title: title.trim(),
      description: description.trim(),
      mediaType: mediaUrls.length > 1 && mediaType !== 'video' ? 'carousel' : mediaType,
      mediaUrls,
      audioUrl: isAddedAudioEnabled ? (audioUrl || undefined) : undefined,
      audioTitle: isAddedAudioEnabled ? audioTitle : (isVideoAudioEnabled ? 'Original Sound' : undefined),
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

  // Single tap on preview video to pause/resume
  const handleTogglePreviewPlay = () => {
    if (previewVideoRef.current) {
      if (isPreviewPlaying) {
        previewVideoRef.current.pause();
        if (externalAudioRef.current) externalAudioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        previewVideoRef.current.play();
        if (externalAudioRef.current && isAddedAudioEnabled) externalAudioRef.current.play();
        setIsPreviewPlaying(true);
      }
    }
  };

  const recordingProgressPercent = Math.min(100, (recordDuration / maxDurationSeconds) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-[100dvh] md:min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col items-center justify-center p-0 md:py-3 select-none relative">
      {/* Toast Notification (Top floating) */}
      {toastMessage && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900/95 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="video/*,image/*"
        multiple
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

      {/* Hidden audio element for sample preview */}
      <audio ref={trackAudioRef} onEnded={() => setPreviewAudioPlayingId(null)} className="hidden" />

      {/* Main Studio Frame Container: 100dvh on mobile, responsive centered phone studio on web */}
      <div className="relative w-full h-[100dvh] md:h-[820px] md:max-h-[calc(100vh-5.5rem)] md:max-w-[430px] bg-black md:rounded-3xl md:border md:border-white/15 md:shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* ========================================================================= */}
        {/* STEP 1: CAPTURE SCREEN */}
        {/* ========================================================================= */}
        {step === 'capture' && (
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
                title="Close Studio"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top-Center: Recording Timer if recording */}
              <div className="flex items-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-lg animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{formatTime(recordDuration)} / 01:00</span>
                  </div>
                )}
              </div>

              {/* Top-Right: Flash Toggle */}
              <div className="flex items-center gap-2">
                {(mode === 'record' || mode === 'add-photo') && (
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
              </div>
            </div>

            {/* --- CENTER FULL-SCREEN VIEWFINDER --- */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
              {isFlashActive && (
                <div className="absolute inset-0 bg-white/20 z-30 pointer-events-none mix-blend-screen" />
              )}

              {/* 1. RECORD MODE: Live Camera Stream */}
              {mode === 'record' && (
                <div className="absolute inset-0 w-full h-full">
                  <video
                    ref={videoStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />

                  {/* Simulated Camera Feed Fallback */}
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 z-0">
                      <video
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
                          <span className="text-xs font-semibold text-gray-200">Studio HD Camera</span>
                        </div>
                        <button
                          onClick={startCamera}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-[11px] font-bold text-white transition-colors"
                        >
                          Enable Cam
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. UPLOAD VIDEO MODE: Clean Dropzone */}
              {mode === 'upload-video' && (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full max-w-sm aspect-[9/16] max-h-[70vh] border-2 border-dashed border-white/25 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:bg-white/5 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Select Video File</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-xs">
                      Upload MP4, MOV, or WebM clips up to {config.maxVideoFileSizeMB}MB.
                    </p>
                    <button className="px-6 py-2.5 rounded-full bg-[#002B7F] text-white text-xs font-bold group-hover:bg-blue-600 shadow-lg">
                      Choose from Device
                    </button>
                  </div>
                </div>
              )}

              {/* 3. ADD PHOTO POST MODE: Snap Photo from Camera OR Upload from Gallery */}
              {mode === 'add-photo' && (
                <div className="absolute inset-0 w-full h-full">
                  <video
                    ref={videoStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />

                  {/* Simulated Camera Feed Fallback */}
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 z-0">
                      <img
                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    </div>
                  )}

                  {/* Banner when photos have been added -> Navigates to intermediate photo-audio step */}
                  {mediaUrls.length > 0 && (
                    <div className="absolute top-16 inset-x-4 z-40 flex items-center justify-between p-3 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">
                          {mediaUrls.length} {mediaUrls.length === 1 ? 'Photo' : 'Photos'} Ready
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setStep('photo-audio');
                        }}
                        className="px-4 py-1.5 bg-[#002B7F] hover:bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <span>Next: Add Audio</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- BOTTOM SHUTTER ROW & MODE CAROUSEL --- */}
            <div className="relative mt-auto bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6 flex flex-col items-center gap-4 z-40">
              {/* Shutter / Capture Trigger Row */}
              <div className="flex items-center justify-between w-full max-w-xs px-2">
                {/* Left Action: Circular Gallery Button (Choose from gallery handles single or multiple photos) */}
                <div className="w-14 flex justify-start">
                  <button
                    onClick={() => {
                      if (mode === 'add-photo') {
                        photoInputRef.current?.click();
                      } else {
                        galleryInputRef.current?.click();
                      }
                    }}
                    className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/90 hover:border-white shadow-lg backdrop-blur-md active:scale-95 transition-transform group flex items-center justify-center bg-black/60"
                    title={mode === 'add-photo' ? 'Choose photos from gallery (single or multiple)' : 'Choose from Gallery'}
                  >
                    <img src={latestThumbnail} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                  </button>
                </div>

                {/* Center: Recording / Snap Button */}
                <div className="relative flex items-center justify-center">
                  {mode === 'record' ? (
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className="relative w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                      title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                      <div
                        className={`absolute inset-0 rounded-full border-[3px] transition-all duration-300 ${
                          isRecording ? 'border-red-500 scale-110' : 'border-white hover:border-gray-200'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          isRecording
                            ? 'w-6 h-6 bg-red-600 rounded-md animate-pulse'
                            : 'w-10 h-10 bg-white hover:bg-gray-100 flex items-center justify-center'
                        }`}
                      >
                        {!isRecording && <div className="w-8 h-8 rounded-full border-2 border-red-500" />}
                      </div>
                    </button>
                  ) : mode === 'upload-video' ? (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="p-3.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg active:scale-95 transition-all"
                      title="Upload Video"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  ) : (
                    /* Photo snap button in add-photo mode */
                    <button
                      onClick={handleSnapPhoto}
                      className="relative w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                      title="Snap Photo"
                    >
                      <div className="absolute inset-0 rounded-full border-[3px] border-white hover:border-gray-200" />
                      <div className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-gray-800" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Right Action: SWITCH CAMERA ICON is strictly to the right of the recording button */}
                <div className="w-14 flex justify-end">
                  {mode === 'record' && isRecording ? (
                    <button
                      onClick={handleTogglePauseRecording}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 ${
                        isPaused ? 'bg-green-600 text-white animate-pulse' : 'bg-white/20 text-white'
                      }`}
                      title={isPaused ? 'Resume' : 'Pause'}
                    >
                      {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                    </button>
                  ) : (mode === 'record' || mode === 'add-photo') ? (
                    <button
                      onClick={toggleCameraFacing}
                      className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10"
                      title="Switch Camera"
                      aria-label="Switch Camera"
                    >
                      <RefreshCw className="w-5 h-5 text-white" />
                    </button>
                  ) : (
                    <div className="w-12 h-12" />
                  )}
                </div>
              </div>

              {/* --- HORIZONTALLY SCROLLABLE OPTIONS CAROUSEL --- */}
              <div className="flex items-center justify-center gap-6 overflow-x-auto no-scrollbar py-1 px-4 max-w-full text-[11px] font-bold uppercase tracking-wider mt-1">
                <button
                  onClick={() => handleSelectMode('record')}
                  className={`flex flex-col items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                    mode === 'record' ? 'text-white font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>RECORD VIDEO</span>
                  {mode === 'record' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                </button>

                <button
                  onClick={() => handleSelectMode('upload-video')}
                  className={`flex flex-col items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                    mode === 'upload-video' ? 'text-white font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>UPLOAD VIDEO</span>
                  {mode === 'upload-video' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                </button>

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
        {/* INTERMEDIATE STEP: UPLOAD & SELECT AUDIO FOR PHOTO POST */}
        {/* ========================================================================= */}
        {step === 'photo-audio' && (
          <div className="relative w-full h-full flex flex-col justify-between bg-slate-900 text-white overflow-y-auto">
            {/* Top Bar with Back Button */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('capture')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Back to Camera"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-blue-400" />
                    <span>Upload or Select Audio</span>
                  </h2>
                  <p className="text-[11px] text-gray-400">Step 2: Add soundtrack to photo deck</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('preview');
                }}
                className="text-xs text-gray-400 hover:text-white font-semibold transition-colors px-2 py-1"
              >
                Skip
              </button>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4 flex-1">
              {/* Photo Deck Thumbnail Strip Preview */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300">Ready Photos ({mediaUrls.length})</span>
                  <span className="text-[10px] text-blue-400">Audio will loop across all slides</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/70 text-[9px] font-mono text-white rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Custom Audio File Option */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Upload Your Audio File</h3>
                      <p className="text-[10px] text-gray-400">MP3, WAV, M4A up to {config.maxAudioFileSizeMB}MB</p>
                    </div>
                  </div>

                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-[#002B7F] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>

                {audioUrl && !selectedCuratedId && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 truncate">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate font-semibold">{audioTitle || 'Uploaded Audio Track'}</span>
                    </div>
                    <button
                      onClick={handleRemoveAudio}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Curated Enterprise Learning Soundtracks */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Curated Learning Tracks</h3>
                      <p className="text-[10px] text-gray-400">Royalty-free background tracks</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {CURATED_SOUNDTRACKS.map(track => {
                    const isSelected = selectedCuratedId === track.id;
                    const isPlaying = previewAudioPlayingId === track.id;

                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectCuratedTrack(track)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900/30 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play / Pause Preview Button */}
                          <button
                            onClick={(e) => handleToggleTrackAudioPreview(track, e)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0 transition-colors"
                            title={isPlaying ? 'Pause preview' : 'Play preview'}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <span>{track.category}</span>
                              <span>•</span>
                              <span>{track.duration}</span>
                            </p>
                          </div>
                        </div>

                        {/* Select state */}
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <span className="p-1 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-semibold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15">
                              Use Track
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between sticky bottom-0 z-30">
              <button
                onClick={() => setStep('capture')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white"
              >
                Back to Photos
              </button>

              <button
                onClick={() => {
                  if (trackAudioRef.current) trackAudioRef.current.pause();
                  setPreviewAudioPlayingId(null);
                  setStep('preview');
                }}
                className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Preview</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PREVIEW STAGE (Photo Deck / Reel Preview with Top-Left Back Button) */}
        {/* ========================================================================= */}
        {step === 'preview' && (
          <div className="relative w-full h-full flex flex-col justify-between bg-black overflow-hidden">
            {/* Top Preview Bar: Top-Left Back Button + Top-Right Audio & Mute Controls */}
            <div className="absolute top-0 inset-x-0 z-40 p-4 pt-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
              {/* Top-Left Back Button (While previewing photo post or video) */}
              <button
                onClick={() => {
                  if (mediaType !== 'video') {
                    setStep('photo-audio');
                  } else {
                    setStep('capture');
                  }
                }}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-lg"
                title={mediaType !== 'video' ? 'Back to Audio Selection' : 'Back to Capture'}
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              {/* Right Action Icons: Change Audio & Mute/Unmute */}
              <div className="flex items-center gap-2">
                {/* Change Audio Button for Photo Post */}
                {mediaType !== 'video' && (
                  <button
                    onClick={() => setStep('photo-audio')}
                    className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 border border-white/20 text-xs font-semibold flex items-center gap-1.5"
                    title="Change Audio Track"
                  >
                    <Music className="w-3.5 h-3.5 text-blue-400" />
                    <span>{audioUrl ? 'Change Audio' : 'Add Audio'}</span>
                  </button>
                )}

                {/* Mute/Unmute for Added Audio */}
                {audioUrl && (
                  <button
                    onClick={() => setIsAddedAudioEnabled(p => !p)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/20 ${
                      isAddedAudioEnabled ? 'bg-emerald-600 text-white' : 'bg-black/60 text-gray-400'
                    }`}
                    title={isAddedAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                  >
                    {isAddedAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-400" />}
                  </button>
                )}

                {/* Video Sound Mute Toggle */}
                {mediaType === 'video' && (
                  <button
                    onClick={() => setIsVideoAudioEnabled(p => !p)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/20 ${
                      isVideoAudioEnabled ? 'bg-blue-600 text-white' : 'bg-black/60 text-gray-400'
                    }`}
                    title={isVideoAudioEnabled ? 'Mute Video Sound' : 'Unmute Video Sound'}
                  >
                    {isVideoAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-400" />}
                  </button>
                )}
              </div>
            </div>

            {/* Center Reel-Style Player (Single tap to Pause/Resume) */}
            <div
              className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden cursor-pointer"
              onClick={handleTogglePreviewPlay}
            >
              {/* VIDEO Short Preview */}
              {mediaType === 'video' && mediaUrls[0] && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={previewVideoRef}
                    src={mediaUrls[0]}
                    autoPlay
                    loop
                    playsInline
                    muted={!isVideoAudioEnabled}
                    onTimeUpdate={() => {
                      if (previewVideoRef.current) {
                        setPreviewCurrentTime(previewVideoRef.current.currentTime);
                        setPreviewDuration(previewVideoRef.current.duration || 0);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (previewVideoRef.current) {
                        setPreviewDuration(previewVideoRef.current.duration || 0);
                      }
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Centered Pause Bubble Icon */}
                  {!isPreviewPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-scale-up">
                        <Play className="w-8 h-8 fill-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Deck Carousel Preview */}
              {mediaType !== 'video' && mediaUrls.length > 0 && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={mediaUrls[carouselPhotoIndex] || mediaUrls[0]}
                    alt="Slide"
                    className="w-full h-full object-cover"
                  />

                  {/* Carousel Dots Horizontally Centered */}
                  <div className="absolute bottom-28 inset-x-0 flex items-center justify-center gap-1.5 z-30 pointer-events-auto">
                    {mediaUrls.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselPhotoIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          carouselPhotoIndex === idx ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Photo slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next Arrows */}
                  {carouselPhotoIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselPhotoIndex(p => p - 1);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md z-30 hover:bg-black/80"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {carouselPhotoIndex < mediaUrls.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselPhotoIndex(p => p + 1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md z-30 hover:bg-black/80"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Audio Playback for Photo Post */}
                  {audioUrl && (
                    <audio
                      ref={externalAudioRef}
                      src={audioUrl}
                      autoPlay
                      loop
                      muted={!isAddedAudioEnabled}
                    />
                  )}
                </div>
              )}

              {/* Thin Horizontal Reel Progress Bar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
                <div
                  className="h-full bg-blue-500 transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  style={{
                    width: `${
                      mediaType === 'video'
                        ? previewDuration > 0
                          ? (previewCurrentTime / previewDuration) * 100
                          : 0
                        : ((carouselPhotoIndex + 1) / (mediaUrls.length || 1)) * 100
                    }%`
                  }}
                />
              </div>
            </div>

            {/* Drag-and-Drop Sequencing Strip for Photo Deck */}
            {mediaType !== 'video' && mediaUrls.length > 0 && (
              <div className="bg-black/85 px-4 py-2 border-t border-white/10 z-40">
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                  <span>Sequence Slides ({mediaUrls.length})</span>
                  <span className="text-blue-400">Drag or tap to order</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setCarouselPhotoIndex(idx)}
                      className={`relative w-12 h-14 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 flex-shrink-0 transition-transform group ${
                        carouselPhotoIndex === idx ? 'border-blue-400 scale-105 shadow-md' : 'border-white/20 opacity-75'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-0.5 left-0.5 px-1 bg-black/70 text-[9px] font-mono text-white rounded">
                        {idx + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(idx);
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-600/90 hover:bg-red-700 text-white"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: Retake & Next */}
            <div className="relative bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6 flex items-center justify-between max-w-md mx-auto w-full z-40">
              <button
                onClick={() => {
                  if (mode === 'record') {
                    handleRetake();
                  } else if (mode === 'upload-video') {
                    setStep('capture');
                    videoInputRef.current?.click();
                  } else {
                    setStep('capture');
                  }
                }}
                className="px-5 py-2.5 rounded-full border border-white/25 bg-black/40 text-gray-200 text-xs font-bold hover:bg-white/10 flex items-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{mode === 'record' ? 'Retake' : mode === 'upload-video' ? 'Re-upload' : 'Add More Photos'}</span>
              </button>

              <button
                onClick={() => setStep('details-and-tags')}
                className="px-7 py-2.5 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <span>Next →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DETAILS & TAGS */}
        {/* ========================================================================= */}
        {step === 'details-and-tags' && (
          <div className="relative w-full h-full bg-gray-50 text-gray-900 overflow-y-auto pb-16 z-30">
            <div className="p-4 space-y-5">
              {/* Header inside the box */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <button
                  onClick={() => setStep('preview')}
                  className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  title="Back to Preview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#002B7F]" />
                  <span>Publish Short</span>
                </h1>
              </div>

              {/* Media Preview Card */}
              <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                <div className="w-14 h-18 bg-black rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {mediaType === 'video' ? (
                    <video src={mediaUrls[0]} className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#002B7F] px-2 py-0.5 rounded-full">
                    {mediaType === 'video' ? 'Video Short' : mediaType === 'carousel' ? `Photo Deck (${mediaUrls.length} slides)` : 'Photo Short'}
                  </span>
                  <div className="text-xs font-semibold text-gray-700 mt-1">
                    {audioTitle ? `Audio: ${audioTitle}` : mediaType === 'video' ? 'Original Sound' : 'Silent Photo Deck'}
                  </div>
                  <button
                    onClick={() => setStep('preview')}
                    className="text-[11px] text-blue-600 hover:underline font-bold mt-0.5 inline-block"
                  >
                    Edit preview & audio
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Short Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Demystifying Kafka Partitioning in 60s"
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition-all"
                  maxLength={100}
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{title.length}/100</div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly explain what colleagues will learn from this short..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition-all resize-none"
                  maxLength={400}
                />
              </div>

              {/* Predefined Enterprise Learning Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Enterprise Tags
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search enterprise tags..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-white">
                  {config.predefinedTags
                    .filter(t => t.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                    .map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setTagError(null);
                            if (!isSelected && selectedTags.length + customTags.length >= 10) {
                              setTagError('⚠️ Maximum 10 topics allowed per reel.');
                              return;
                            }
                            setSelectedTags(prev =>
                              isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-full font-mono transition-all ${
                            isSelected
                              ? 'bg-[#002B7F] text-white font-bold shadow-2xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag.replace(/^#/, '')}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Custom Tag Addition */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Add Custom Tag (Max 10 total topics)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value.replace(/^#/, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="e.g. KafkaStreaming"
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-4 py-1.5 bg-gray-800 text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tagError && <p className="text-xs text-red-600 mt-1">{tagError}</p>}
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customTags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-700"
                          onClick={() => setCustomTags(prev => prev.filter(t => t !== tag))}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Moderation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShortPage;
