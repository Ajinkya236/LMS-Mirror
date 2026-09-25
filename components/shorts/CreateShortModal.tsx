import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  Layers,
  Music,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Play,
  ArrowLeft,
  Camera,
  Film,
  Disc,
  StopCircle,
  RefreshCw,
  Sliders
} from 'lucide-react';
import {
  shortsService,
  ShortMediaType,
  INITIAL_CREATORS
} from '../../services/shortsService';

interface CreateShortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onShortCreated?: () => void;
}

type CreateMode = 'select' | 'record-video' | 'upload-video' | 'add-photo' | 'metadata';

export const CreateShortModal: React.FC<CreateShortModalProps> = ({
  isOpen,
  onClose,
  onToast,
  onShortCreated
}) => {
  const config = shortsService.getConfig();

  const [mode, setMode] = useState<CreateMode>('select');
  const [mediaType, setMediaType] = useState<ShortMediaType>('video');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPredefinedTags, setSelectedPredefinedTags] = useState<string[]>(['CloudArchitecture']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [userTags, setUserTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Webcam recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setMediaType('video');
      setMediaUrls([]);
      setAudioUrl('');
      setAudioTitle('');
      setTitle('');
      setDescription('');
      setSelectedPredefinedTags(['CloudArchitecture']);
      setUserTags([]);
      setFileError(null);
      setTagError(null);
      setRecordedBlobUrl(null);
      setIsRecording(false);
      setRecordDuration(0);
      setCameraError(null);
    } else {
      stopCameraStream();
    }
  }, [isOpen]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play();
      }
    } catch (err: any) {
      console.warn('Webcam access not allowed or unavailable:', err);
      setCameraError('Camera access unavailable. You can use our sample recording preset or upload a video file instead.');
    }
  };

  const handleStartRecordFlow = () => {
    setMode('record-video');
    setMediaType('video');
    setMediaUrls([]);
    setRecordedBlobUrl(null);
    startCamera();
  };

  const handleStartRecording = () => {
    if (!streamRef.current) {
      // Fallback simulation if no real camera hardware is connected
      setIsRecording(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      return;
    }

    try {
      recordedChunksRef.current = [];
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
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting media recorder:', err);
      setCameraError('Unable to record video on this browser. Please upload a file instead.');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!streamRef.current) {
      // Simulated sample capture
      setRecordedBlobUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }
  };

  const handleUseRecording = () => {
    if (recordedBlobUrl) {
      setMediaUrls([recordedBlobUrl]);
      stopCameraStream();
      setMode('metadata');
    }
  };

  const handleRetakeRecording = () => {
    setRecordedBlobUrl(null);
    setRecordDuration(0);
    startCamera();
  };

  // Upload Video Flow
  const handleStartUploadVideoFlow = () => {
    setMode('upload-video');
    setMediaType('video');
    setMediaUrls([]);
  };

  // Add Photo Flow
  const handleStartPhotoFlow = () => {
    setMode('add-photo');
    setMediaType('photo');
    setMediaUrls([]);
  };

  // Handle local video file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size against config
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxVideoFileSizeMB) {
      setFileError(`File size (${sizeMB.toFixed(1)} MB) exceeds the maximum limit of ${config.maxVideoFileSizeMB} MB.`);
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setMediaUrls([fileUrl]);
  };

  // Handle local photo files upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const maxAllowed = config.maxCarouselPhotos;

    for (let i = 0; i < Math.min(files.length, maxAllowed); i++) {
      urls.push(URL.createObjectURL(files[i]));
    }

    const updated = [...mediaUrls, ...urls].slice(0, maxAllowed);
    setMediaUrls(updated);
    if (updated.length > 1) {
      setMediaType('carousel');
    } else {
      setMediaType('photo');
    }
  };

  // Handle Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxAudioFileSizeMB) {
      setFileError(`Audio size exceeds limit of ${config.maxAudioFileSizeMB} MB.`);
      return;
    }
    setAudioUrl(URL.createObjectURL(file));
    setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  // Quick preset loader
  const handleUsePresetVideo = (url: string, defaultTitle: string) => {
    setMediaUrls([url]);
    if (!title) setTitle(defaultTitle);
  };

  const handleUsePresetPhotos = (photos: string[]) => {
    setMediaUrls(photos);
    setMediaType(photos.length > 1 ? 'carousel' : 'photo');
  };

  // Predefined Tag Toggle (Max 10 total topics)
  const togglePredefinedTag = (tag: string) => {
    setTagError(null);
    setSelectedPredefinedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      if (prev.length + userTags.length >= 10) {
        setTagError('⚠️ Maximum 10 topics allowed per reel.');
        return prev;
      }
      return [...prev, tag];
    });
  };

  // Add Custom Tag (Max 10 total topics, NO hashtags)
  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.replace(/^#/, '').trim();

    if (selectedPredefinedTags.length + userTags.length >= 10) {
      setTagError('⚠️ Maximum 10 topics allowed per reel.');
      return;
    }

    const validation = shortsService.validateTag(clean);
    if (!validation.isValid) {
      setTagError(validation.error || 'Invalid tag');
      return;
    }

    if (userTags.includes(clean) || selectedPredefinedTags.includes(clean)) {
      setTagError('Tag already added');
      return;
    }

    setUserTags(prev => [...prev, clean]);
    setCustomTagInput('');
    setTagError(null);
  };

  // Final Submission
  const handleSubmit = () => {
    if (!title.trim()) {
      onToast('⚠️ Please enter a title for your Short');
      return;
    }
    if (mediaUrls.length === 0) {
      onToast('⚠️ Please provide video or photo media');
      return;
    }

    const allTags = Array.from(new Set([...selectedPredefinedTags, ...userTags]));
    if (allTags.length === 0) {
      onToast('⚠️ Please select or add at least one learning tag');
      return;
    }

    if (allTags.length > 10) {
      onToast('⚠️ Maximum 10 topics allowed per reel');
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
      onToast('🎉 Short submitted for Content Manager review!');
      if (onShortCreated) onShortCreated();
      onClose();
    } else {
      onToast(`❌ Error: ${res.error || 'Submission failed'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={() => {
        stopCameraStream();
        onClose();
      }}
    >
      <div
        className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-white/15 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode !== 'select' && (
              <button
                onClick={() => {
                  stopCameraStream();
                  if (mode === 'metadata') {
                    setMode(mediaType === 'video' ? 'upload-video' : 'add-photo');
                  } else {
                    setMode('select');
                  }
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>
                  {mode === 'select' && 'Create Learning Short'}
                  {mode === 'record-video' && 'Record Video Short'}
                  {mode === 'upload-video' && 'Upload Video Short'}
                  {mode === 'add-photo' && 'Add Photo Post / Carousel'}
                  {mode === 'metadata' && 'Add Title & Learning Tags'}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === 'select'
                  ? 'Share a 60-second micro-learning video or photo guide'
                  : 'Submitted content is verified through moderation before appearing in feed'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: SELECT CREATION OPTION */}
          {mode === 'select' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-300">
                Choose how you want to create your knowledge Short:
              </p>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Option 1: Record Video */}
                <div
                  onClick={handleStartRecordFlow}
                  className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/50 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-400 border border-red-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Disc className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-red-300">
                        Record Video
                      </h3>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
                        Live Camera
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Record up to 60 seconds directly using your webcam or phone camera.
                    </p>
                  </div>
                </div>

                {/* Option 2: Upload Video */}
                <div
                  onClick={handleStartUploadVideoFlow}
                  className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Film className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-300">
                        Upload Video
                      </h3>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                        Up to 100 MB
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload an existing video file (.mp4, .webm, .mov) from your device.
                    </p>
                  </div>
                </div>

                {/* Option 3: Add Photo Post */}
                <div
                  onClick={handleStartPhotoFlow}
                  className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">
                        Add Photo Post
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        1 to 20 Photos
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Create a single visual slide or multi-photo swipeable carousel with optional voiceover audio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: RECORD VIDEO FLOW */}
          {mode === 'record-video' && (
            <div className="space-y-4">
              {/* Camera Preview / Recorded Output */}
              <div className="relative aspect-[9/16] max-w-[260px] mx-auto rounded-3xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl">
                {!recordedBlobUrl ? (
                  <>
                    <video
                      ref={videoStreamRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isRecording && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>REC 00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <video
                    src={recordedBlobUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-500/15 border border-amber-400/30 rounded-2xl text-xs text-amber-200">
                  {cameraError}
                  <div className="mt-2">
                    <button
                      onClick={() => setRecordedBlobUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
                      className="px-3 py-1.5 bg-amber-500/30 hover:bg-amber-500/40 text-white rounded-xl text-xs font-bold"
                    >
                      Use Demo Recording Stream
                    </button>
                  </div>
                </div>
              )}

              {/* Record Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {!recordedBlobUrl ? (
                  !isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2"
                    >
                      <Disc className="w-5 h-5" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="px-6 py-3 bg-white text-gray-900 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce"
                    >
                      <StopCircle className="w-5 h-5 text-red-600" />
                      <span>Stop Recording ({recordDuration}s)</span>
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={handleRetakeRecording}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-2xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={handleUseRecording}
                      className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center gap-1.5"
                    >
                      <span>Next: Details & Tags</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 2B: UPLOAD VIDEO FLOW */}
          {mode === 'upload-video' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleVideoFileUpload}
              />

              {mediaUrls.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-white/5 space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Click to select video file</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, WebM, or MOV up to {config.maxVideoFileSizeMB} MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-[9/16] max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-black border border-white/20">
                    <video src={mediaUrls[0]} controls className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setMediaUrls([])}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-gray-300"
                    >
                      Choose Different Video
                    </button>
                    <button
                      onClick={() => setMode('metadata')}
                      className="px-6 py-2 bg-[#002B7F] hover:bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg"
                    >
                      Next: Details & Tags
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fileError}</span>
                </p>
              )}

              {/* Sample Quick Demo Clips */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 block">Or select a high-quality sample video:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUsePresetVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Microservices Distributed Tracing Guide')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left text-xs text-gray-300"
                  >
                    🚀 Microservices Tracing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUsePresetVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'Enterprise Objection Handling Mastery')}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left text-xs text-gray-300"
                  >
                    🤝 Objection Handling
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2C: ADD PHOTO POST FLOW */}
          {mode === 'add-photo' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoFileUpload}
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-emerald-400/50 rounded-3xl p-6 text-center cursor-pointer transition-all hover:bg-white/5 space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white">Click to upload photos (1 to {config.maxCarouselPhotos} photos)</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP • Auto-creates swipeable carousel if multiple</p>
                </div>
              </div>

              {/* Photos Gallery preview */}
              {mediaUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{mediaUrls.length} Photo{mediaUrls.length > 1 ? 's' : ''} added</span>
                    <button
                      onClick={() => setMediaUrls([])}
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {mediaUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/15">
                        <img src={url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] px-1 rounded text-white font-bold">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Optional Voiceover Audio */}
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-purple-400" />
                        <span>Optional Background Voiceover / Audio</span>
                      </span>
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-lg text-xs font-bold"
                      >
                        {audioUrl ? 'Change Audio' : '+ Add Audio'}
                      </button>
                    </div>
                    {audioUrl && (
                      <div className="text-xs text-emerald-300 flex items-center justify-between">
                        <span>🎵 {audioTitle || 'Audio attached'}</span>
                        <button onClick={() => setAudioUrl('')} className="text-rose-400 hover:text-rose-300 text-[10px]">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setMode('metadata')}
                      className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg"
                    >
                      Next: Details & Tags
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Photo Preset */}
              {mediaUrls.length === 0 && (
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 block">Or use our 4-slide Architecture Carousel preset:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleUsePresetPhotos([
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&h=1600&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=1600&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&h=1600&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=1600&fit=crop&q=80'
                      ]);
                      setTitle('RAG Architecture Checklist: 4 Visual Steps');
                    }}
                    className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left text-xs text-gray-300"
                  >
                    📑 4-Slide RAG Architecture Carousel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: METADATA & TAGS */}
          {mode === 'metadata' && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Short Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Core Rules for Clean Microservices in 60s"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Description / Key Takeaway
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly summarize what fellow employees will learn from this short..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Predefined Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">
                  Select Predefined Learning Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {config.predefinedTags.map(tag => {
                    const isSelected = selectedPredefinedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => togglePredefinedTag(tag)}
                        className={`text-xs px-3 py-1 rounded-xl font-mono transition-all ${
                          isSelected
                            ? 'bg-[#002B7F] text-white border border-blue-400/50 shadow-sm'
                            : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Add Custom Tag (Subject to Moderation)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value.replace(/^#/, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                    placeholder="e.g. KafkaStreaming or NextJS"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                  >
                    Add Tag
                  </button>
                </div>
                {tagError && (
                  <p className="text-[11px] text-rose-400">{tagError}</p>
                )}

                {userTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {userTags.map(t => (
                      <span
                        key={t}
                        className="text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1"
                      >
                        <span>{t}</span>
                        <button
                          onClick={() => setUserTags(prev => prev.filter(tag => tag !== t))}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {mode === 'metadata' && (
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
            <button
              onClick={() => setMode(mediaType === 'video' ? 'upload-video' : 'add-photo')}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
            >
              Back
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-[#002B7F] to-blue-600 hover:from-[#002B7F] hover:to-blue-500 text-white rounded-2xl text-xs font-bold shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit for Moderation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShortModal;
