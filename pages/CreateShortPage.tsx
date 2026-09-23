import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  X,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import {
  shortsService,
  ShortMediaType,
  INITIAL_CREATORS
} from '../services/shortsService';

type CreationStep = 'select-mode' | 'media-input' | 'thumbnail-select' | 'details-and-tags';
type CreationMode = 'record' | 'upload-video' | 'add-photo';

export const CreateShortPage: React.FC = () => {
  const navigate = useNavigate();
  const config = shortsService.getConfig();

  const [step, setStep] = useState<CreationStep>('select-mode');
  const [mode, setMode] = useState<CreationMode>('record');
  const [mediaType, setMediaType] = useState<ShortMediaType>('video');

  // Media URLs
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>('');

  // Thumbnail selection (Mandatory for video)
  const [thumbnailOption, setThumbnailOption] = useState<'auto' | 'custom'>('auto');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');

  // Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#SystemDesign']);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);

  // Recording State & Permissions
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Drag & drop photo reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Request browser camera & mic permissions
  const requestCameraAccess = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      setHasCameraPermission(true);
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera permission denied or unavailable:', err);
      setHasCameraPermission(false);
      setCameraError('Camera / microphone permission was not granted. Please allow camera access in browser settings or upload a video file instead.');
    }
  };

  // Switch creation mode
  const handleSelectMode = (selected: CreationMode) => {
    setMode(selected);
    setErrorMsg(null);
    setMediaUrls([]);
    setRecordedBlobUrl(null);
    setHasCameraPermission(null);

    if (selected === 'record') {
      setMediaType('video');
      setStep('media-input');
      requestCameraAccess();
    } else if (selected === 'upload-video') {
      setMediaType('video');
      setStep('media-input');
    } else if (selected === 'add-photo') {
      setMediaType('photo');
      setStep('media-input');
    }
  };

  // Start recording
  const handleStartRecording = () => {
    if (!streamRef.current) {
      // Hardware fallback simulation
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
        setMediaUrls([url]);
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
    } catch (e) {
      console.error(e);
      setCameraError('Could not record on this browser. Please try uploading a file instead.');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (!streamRef.current) {
      const demoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      setRecordedBlobUrl(demoUrl);
      setMediaUrls([demoUrl]);
    }
  };

  // Retake recording
  const handleRetake = () => {
    setRecordedBlobUrl(null);
    setMediaUrls([]);
    setRecordDuration(0);
    requestCameraAccess();
  };

  // Handle local video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxVideoFileSizeMB) {
      setErrorMsg(`Video size (${sizeMB.toFixed(1)} MB) exceeds the maximum limit of ${config.maxVideoFileSizeMB} MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setMediaUrls([url]);
  };

  // Handle local photo files upload (up to config.maxCarouselPhotos, default 20)
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
  };

  // Move photo left/right or drag-and-drop
  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= mediaUrls.length) return;
    const updated = [...mediaUrls];
    const item = updated.splice(from, 1)[0];
    updated.splice(to, 0, item);
    setMediaUrls(updated);
  };

  const removeSinglePhoto = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    setMediaType(updated.length > 1 ? 'carousel' : 'photo');
  };

  // Handle Audio Upload
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
  };

  // Custom thumbnail image upload
  const handleCustomThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomThumbnailUrl(URL.createObjectURL(file));
  };

  // Tag selection toggle
  const togglePredefinedTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Filter predefined tags by search
  const filteredPredefinedTags = config.predefinedTags.filter(t =>
    t.toLowerCase().includes(tagSearchQuery.toLowerCase().trim())
  );

  // Add custom tag
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
      }, 1000);
    } else {
      showToast(`❌ Submission failed: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-4">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb / Top Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-6 bg-white px-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 'details-and-tags') {
                  setStep(mode === 'upload-video' || mode === 'record' ? 'thumbnail-select' : 'media-input');
                } else if (step === 'thumbnail-select') {
                  setStep('media-input');
                } else if (step === 'media-input') {
                  stopCamera();
                  setStep('select-mode');
                } else {
                  navigate(-1);
                }
              }}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#002B7F]" />
                <span>Create Learning Short</span>
              </h1>
              <p className="text-xs text-gray-500">
                Share high-impact 60-second micro-learning clips or visual decks with colleagues
              </p>
            </div>
          </div>

          {/* Step Progress Pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <span className={step === 'select-mode' ? 'text-[#002B7F] font-bold' : ''}>1. Format</span>
            <span>›</span>
            <span className={step === 'media-input' ? 'text-[#002B7F] font-bold' : ''}>2. Content</span>
            <span>›</span>
            <span className={step === 'details-and-tags' ? 'text-[#002B7F] font-bold' : ''}>3. Details & Tags</span>
          </div>
        </div>

        {/* STEP 1: SELECT FORMAT (Compact, visible at one glance) */}
        {step === 'select-mode' && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">What would you like to share?</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select your preferred learning media format to begin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Option 1: Record Video */}
              <div
                onClick={() => handleSelectMode('record')}
                className="bg-white border-2 border-gray-200 hover:border-red-500 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group active:scale-98"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center sm:mb-3 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600">
                      Record Video
                    </h3>
                    <p className="text-[11px] text-gray-500 sm:mt-1 leading-snug">
                      Record live micro-learning clips directly via webcam or camera.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-red-600">
                  <span>Start Camera</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option 2: Upload Video */}
              <div
                onClick={() => handleSelectMode('upload-video')}
                className="bg-white border-2 border-gray-200 hover:border-[#002B7F] rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group active:scale-98"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#002B7F] flex items-center justify-center sm:mb-3 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#002B7F]">
                      Upload Video
                    </h3>
                    <p className="text-[11px] text-gray-500 sm:mt-1 leading-snug">
                      Upload an existing video file (.mp4, .webm, .mov) from device.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#002B7F]">
                  <span>Select Video File</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option 3: Add Photo Post */}
              <div
                onClick={() => handleSelectMode('add-photo')}
                className="bg-white border-2 border-gray-200 hover:border-emerald-600 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group active:scale-98"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center sm:mb-3 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-600">
                      Add Photo Post
                    </h3>
                    <p className="text-[11px] text-gray-500 sm:mt-1 leading-snug">
                      Create a single slide or swipeable photo carousel with audio.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
                  <span>Upload Photos</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2A: RECORD VIDEO */}
        {step === 'media-input' && mode === 'record' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="text-left border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900">Record Video Short</h2>
              <p className="text-xs text-gray-500">
                Position yourself in front of your camera. When ready, press Start Recording.
              </p>
            </div>

            {/* Permission Prompt / State */}
            {hasCameraPermission === false && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-3">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Camera & Microphone Permission Required</span>
                </p>
                <p>
                  Please allow camera and mic access in your browser to record live. If you do not have a camera attached, you can test with our pre-recorded demo video or switch to Upload Video.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={requestCameraAccess}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                  >
                    Grant Camera Access
                  </button>
                  <button
                    onClick={() => {
                      const demo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                      setRecordedBlobUrl(demo);
                      setMediaUrls([demo]);
                    }}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-800 rounded-xl font-bold hover:bg-amber-50"
                  >
                    Use Sample Recording
                  </button>
                </div>
              </div>
            )}

            {/* Video Viewport */}
            <div className="relative aspect-[9/16] max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-gray-100">
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
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
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

            {/* Recording Controls: Always Visible */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {!recordedBlobUrl ? (
                !isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 animate-bounce"
                  >
                    <StopCircle className="w-5 h-5 text-red-500" />
                    <span>Stop Recording ({recordDuration}s)</span>
                  </button>
                )
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      setStep('thumbnail-select');
                    }}
                    className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <span>Next: Choose Thumbnail</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2B: UPLOAD VIDEO */}
        {step === 'media-input' && mode === 'upload-video' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="text-left border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900">Upload Video Short</h2>
              <p className="text-xs text-gray-500">
                Select a video file from your computer or phone (.mp4, .webm, .mov up to {config.maxVideoFileSizeMB} MB)
              </p>
            </div>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoUpload}
            />

            {mediaUrls.length === 0 ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#002B7F] rounded-3xl p-10 text-center cursor-pointer transition-all hover:bg-blue-50/50 space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#002B7F] flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Click to choose video file</p>
                  <p className="text-xs text-gray-500 mt-1">Supports MP4, WebM, MOV</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[9/16] max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-black shadow-lg">
                  <video src={mediaUrls[0]} controls className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setMediaUrls([])}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Choose Different Video
                  </button>
                  <button
                    onClick={() => setStep('thumbnail-select')}
                    className="px-6 py-2 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold text-white shadow-md"
                  >
                    Next: Choose Thumbnail →
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2C: ADD PHOTO POST (with Drag-and-Drop / Reordering, Remove One, and Clear All) */}
        {step === 'media-input' && mode === 'add-photo' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="text-left border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900">Add Photo Post / Carousel</h2>
              <p className="text-xs text-gray-500">
                Upload 1 to {config.maxCarouselPhotos} photos. You can drag and drop or use arrows to change sequence.
              </p>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
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

            {/* Photo Uploader Dropzone */}
            <div
              onClick={() => photoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-3xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/50 space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">Click to upload photos</p>
                <p className="text-[11px] text-gray-500 mt-0.5">JPG, PNG, WebP • Max {config.maxCarouselPhotos} photos</p>
              </div>
            </div>

            {/* Photo Gallery with Sequence Reordering */}
            {mediaUrls.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-bold text-gray-900">
                    {mediaUrls.length} Photo{mediaUrls.length > 1 ? 's' : ''} (Swipeable Deck)
                  </span>
                  <button
                    onClick={() => setMediaUrls([])}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    Clear All Photos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200 group shadow-xs"
                    >
                      <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Slide Badge */}
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Slide {idx + 1}
                      </span>

                      {/* Remove single photo button */}
                      <button
                        onClick={() => removeSinglePhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Sequence Shift Controls (Left / Right) */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
                        <button
                          disabled={idx === 0}
                          onClick={() => movePhoto(idx, idx - 1)}
                          className={`p-1 rounded-lg bg-white/90 text-gray-800 text-xs shadow-sm font-bold ${
                            idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'
                          }`}
                        >
                          ‹
                        </button>
                        <span className="text-[10px] text-white font-bold bg-black/50 px-1.5 py-0.5 rounded">
                          Move
                        </span>
                        <button
                          disabled={idx === mediaUrls.length - 1}
                          onClick={() => movePhoto(idx, idx + 1)}
                          className={`p-1 rounded-lg bg-white/90 text-gray-800 text-xs shadow-sm font-bold ${
                            idx === mediaUrls.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'
                          }`}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Voiceover Audio with Clear Max Size Limit */}
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-purple-600" />
                        <span>Optional Background Voiceover / Audio</span>
                      </h4>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Max audio file size: {config.maxAudioFileSizeMB} MB (MP3, WAV, M4A, AAC)
                      </p>
                    </div>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      {audioUrl ? 'Change Audio' : '+ Add Audio'}
                    </button>
                  </div>
                  {audioUrl && (
                    <div className="text-xs text-emerald-800 bg-white p-2.5 rounded-xl border border-purple-200 flex items-center justify-between">
                      <span className="font-semibold">🎵 {audioTitle || 'Audio track attached'}</span>
                      <button
                        onClick={() => {
                          setAudioUrl('');
                          setAudioTitle('');
                        }}
                        className="text-red-600 hover:text-red-700 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep('details-and-tags')}
                    className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold text-white shadow-md"
                  >
                    Next: Details & Tags →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2.5: MANDATORY THUMBNAIL SELECTION (For Videos) */}
        {step === 'thumbnail-select' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="text-left border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900">Choose Short Thumbnail</h2>
              <p className="text-xs text-gray-500">
                A good cover image helps colleagues discover your Short in the search grid.
              </p>
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomThumbnailUpload}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Auto-generate from video */}
              <div
                onClick={() => setThumbnailOption('auto')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  thumbnailOption === 'auto'
                    ? 'border-[#002B7F] bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-900">Auto-Generate From Video</span>
                  {thumbnailOption === 'auto' && (
                    <div className="w-5 h-5 rounded-full bg-[#002B7F] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Automatically captures the most representative first frame from your video.
                </p>
              </div>

              {/* Option B: Upload custom image */}
              <div
                onClick={() => {
                  setThumbnailOption('custom');
                  if (!customThumbnailUrl) {
                    thumbnailInputRef.current?.click();
                  }
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  thumbnailOption === 'custom'
                    ? 'border-[#002B7F] bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-900">Upload Custom Image</span>
                  {thumbnailOption === 'custom' && (
                    <div className="w-5 h-5 rounded-full bg-[#002B7F] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload a 9:16 or high-contrast image (JPG/PNG).
                </p>

                {thumbnailOption === 'custom' && customThumbnailUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={customThumbnailUrl}
                      alt="Custom Thumbnail"
                      className="w-12 h-16 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        thumbnailInputRef.current?.click();
                      }}
                      className="text-xs text-[#002B7F] font-bold underline"
                    >
                      Change Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep('media-input')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep('details-and-tags')}
                className="px-6 py-2 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold text-white shadow-md"
              >
                Next: Details & Tags →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS, TAG SEARCH & SUBMISSION */}
        {step === 'details-and-tags' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
            <div className="text-left border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900">Title, Description & Tags</h2>
              <p className="text-xs text-gray-500">
                Help other employees discover this micro-learning content through topics and tags.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-900 block">
                Short Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3 Essential Rules for Low-Latency Microservices"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 focus:border-[#002B7F] focus:bg-white rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-900 block">
                Key Learning Takeaway / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize the core concept covered in this 60-second learning short..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 focus:border-[#002B7F] focus:bg-white rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Predefined Enterprise Tags with Search */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-900 block">
                Enterprise Predefined Learning Shorts Tags
              </label>

              {/* Tag Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Search enterprise tags (e.g. SystemDesign, AI, DevOps)..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B7F]"
                />
              </div>

              {/* Predefined Tags Chip Selector */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                {filteredPredefinedTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePredefinedTag(tag)}
                      className={`text-xs px-3 py-1 rounded-xl font-mono transition-all ${
                        isSelected
                          ? 'bg-[#002B7F] text-white shadow-xs font-bold'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Tag Input (Subject to approver moderation review) */}
            <div className="space-y-1.5 text-left pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-900 block">
                Add Custom Tag (Sent for Approver Review)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  placeholder="e.g. #PromptEngineering"
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B7F] font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                >
                  + Add Tag
                </button>
              </div>
              {tagError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{tagError}</span>
                </p>
              )}

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customTags.map(t => (
                    <span
                      key={t}
                      className="text-xs bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1.5"
                    >
                      <span>{t}</span>
                      <button
                        onClick={() => setCustomTags(prev => prev.filter(tag => tag !== t))}
                        className="hover:text-purple-950 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setStep(mode === 'upload-video' || mode === 'record' ? 'thumbnail-select' : 'media-input');
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
              >
                Back
              </button>

              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-7 py-3 bg-[#002B7F] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit for Moderation</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Toast */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl z-[99999] animate-fade-in-up border border-gray-700">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShortPage;
