import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Sparkles,
  ArrowRight,
  Bookmark,
  Settings
} from 'lucide-react';
import {
  shortsService,
  ShortMediaType,
  ShortDraft,
  INITIAL_CREATORS
} from '../services/shortsService';

type CreationStep = 'capture' | 'photo-audio' | 'preview' | 'details-and-tags';
type CreationMode = 'video' | 'photo';

export interface RecordedClip {
  id: string;
  blob?: Blob;
  url: string;
  durationSeconds: number;
}

const GALLERY_VIDEOS = [
  {
    id: 'g_vid_1',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Cloud Microservices Architecture',
    durationSeconds: 15,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&fit=crop&q=80'
  },
  {
    id: 'g_vid_2',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'System Design Overview',
    durationSeconds: 15,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&fit=crop&q=80'
  },
  {
    id: 'g_vid_3',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    title: 'DevOps & CI/CD Pipeline',
    durationSeconds: 15,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&fit=crop&q=80'
  },
  {
    id: 'g_vid_4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    title: 'PostgreSQL Failover Analysis',
    durationSeconds: 15,
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&fit=crop&q=80'
  }
];

const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80'
];

export const CreateShortPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const config = shortsService.getConfig();

  // Multi-step creation workflow: capture -> photo-audio (intermediate for photos) -> preview -> details-and-tags
  const [step, setStep] = useState<CreationStep>('capture');
  const [mode, setMode] = useState<CreationMode>('video');
  const [mediaType, setMediaType] = useState<ShortMediaType>('video');

  // Gallery and Drafts Menu State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'gallery' | 'drafts' | 'settings'>('gallery');
  const [draftsList, setDraftsList] = useState<ShortDraft[]>(() => shortsService.getDrafts());
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState<string[]>([]);
  const [selectedGalleryVideos, setSelectedGalleryVideos] = useState<string[]>([]);
  const [galleryVideoDurationLimit, setGalleryVideoDurationLimit] = useState<number>(60);
  const [isCameraSettingsOpen, setIsCameraSettingsOpen] = useState(false);
  const [autoDeriveThumbnail, setAutoDeriveThumbnail] = useState(true);

  // Max duration (60s default)
  const maxDurationSeconds = 60;

  // Live Camera & Recording State
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>(() => {
    const saved = localStorage.getItem('jio_shorts_default_camera');
    return (saved === 'environment' || saved === 'user') ? saved : 'user';
  });
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([]);
  const currentClipStartTimeRef = useRef<number>(0);
  const currentClipChunksRef = useRef<Blob[]>([]);
  const touchStartYRef = useRef<number | null>(null);

  // Reel-Style Video Preview State (Multi-Clip Amalgamation & Sequencing)
  const [previewActiveClipIndex, setPreviewActiveClipIndex] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [draggedVideoClipIndex, setDraggedVideoClipIndex] = useState<number | null>(null);

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

  // Metadata Form (Short Captions only, mandatory, max 500 characters)
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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

  // Start camera on mount if in capture step
  useEffect(() => {
    if (step === 'capture' && !recordedBlobUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, recordedBlobUrl, startCamera, stopCamera]);

  // Load draft from URL param if present
  useEffect(() => {
    if (draftIdParam) {
      const draft = shortsService.getDraftById(draftIdParam);
      if (draft) {
        setMediaType(draft.mediaType);
        setMode(draft.mediaType === 'video' ? 'video' : 'photo');
        setMediaUrls(draft.mediaUrls);
        if (draft.description || draft.title) {
          setCaption(draft.description || draft.title || '');
        }
        if (draft.tags) {
          setSelectedTags(draft.tags);
        }
        if (draft.durationSeconds) {
          setRecordDuration(draft.durationSeconds);
        }
        if (draft.mediaType === 'video') {
          setRecordedBlobUrl(draft.mediaUrls[0]);
          setRecordedClips([
            {
              id: `draft_clip_${draft.id}`,
              url: draft.mediaUrls[0],
              durationSeconds: draft.durationSeconds || 15
            }
          ]);
          setIsPaused(true);
        }
        showToast(`📂 Resumed draft "${draft.title || 'Untitled'}"`);
      }
    }
  }, [draftIdParam]);

  // Listen to drafts updates
  useEffect(() => {
    const handleDraftsUpdate = () => {
      setDraftsList(shortsService.getDrafts());
    };
    window.addEventListener('jio_shorts_drafts_updated', handleDraftsUpdate);
    return () => window.removeEventListener('jio_shorts_drafts_updated', handleDraftsUpdate);
  }, []);

  // Switch creation mode (only video and photo)
  const handleSelectMode = (newMode: CreationMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setErrorMsg(null);
    setRecordedBlobUrl(null);
    setRecordedClips([]);
    setRecordDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setStep('capture');
    setAudioUrl('');
    setAudioTitle('');
    setSelectedCuratedId(null);

    if (newMode === 'video') {
      setMediaType('video');
      setMediaUrls([]);
      startCamera();
    } else if (newMode === 'photo') {
      setMediaType('photo');
      setMediaUrls([]);
      startCamera();
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Single Center Recording Button Handler:
  // - If not recording: Starts recording a clip
  // - If recording: Pauses recording (saves clip in same session)
  // - If paused with existing clips: Tapping center adds another clip to that same reel session
  const handleRecordButtonTap = () => {
    if (isRecording) {
      handlePauseClipRecording();
    } else {
      handleStartOrResumeClipRecording();
    }
  };

  // Start or resume clip recording
  const handleStartOrResumeClipRecording = () => {
    currentClipChunksRef.current = [];
    currentClipStartTimeRef.current = Date.now();
    setIsPaused(false);
    setIsRecording(true);

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
            currentClipChunksRef.current.push(e.data);
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('MediaRecorder error:', e);
      }
    }

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }

    recordTimerRef.current = setInterval(() => {
      setRecordDuration(prev => {
        const next = prev + 1;
        if (next >= maxDurationSeconds) {
          handlePauseClipRecording();
          return maxDurationSeconds;
        }
        return next;
      });
    }, 1000);

    const clipIndex = recordedClips.length + 1;
    showToast(`🔴 Recording clip #${clipIndex}... Tap to pause.`);
  };

  // Pause recording and save the clip segment
  const handlePauseClipRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(true);

    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - currentClipStartTimeRef.current) / 1000)
    );

    let clipUrl = '';
    let clipBlob: Blob | undefined;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (currentClipChunksRef.current.length > 0) {
          clipBlob = new Blob(currentClipChunksRef.current, { type: 'video/webm' });
          clipUrl = URL.createObjectURL(clipBlob);
        }
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    if (!clipUrl) {
      clipUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }

    const newClip: RecordedClip = {
      id: `clip_${Date.now()}_${recordedClips.length + 1}`,
      blob: clipBlob,
      url: clipUrl,
      durationSeconds: elapsedSeconds
    };

    setRecordedClips(prev => [...prev, newClip]);
    showToast(`⏸️ Clip #${recordedClips.length + 1} paused (${elapsedSeconds}s). Tap to add next clip.`);
  };

  // Undo last recorded clip
  const handleUndoClip = () => {
    if (recordedClips.length === 0) return;
    const lastClip = recordedClips[recordedClips.length - 1];
    const remaining = recordedClips.slice(0, -1);
    setRecordedClips(remaining);

    const newDuration = Math.max(0, recordDuration - lastClip.durationSeconds);
    setRecordDuration(newDuration);

    if (remaining.length === 0) {
      setIsPaused(false);
      setRecordDuration(0);
      showToast('↩️ Discarded clip. Reel reset.');
    } else {
      showToast(`↩️ Removed clip #${recordedClips.length} (${remaining.length} clips remaining)`);
    }
  };

  // Next from recording (transitions directly to review/preview page with ALL clips amalgamated)
  const handleNextFromRecording = () => {
    if (isRecording) {
      handlePauseClipRecording();
    }
    
    // Ensure all recorded clips are in mediaUrls
    let clipsToUse = [...recordedClips];
    if (clipsToUse.length === 0) {
      const primaryUrl = recordedBlobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      const singleClip: RecordedClip = {
        id: `clip_${Date.now()}`,
        url: primaryUrl,
        durationSeconds: recordDuration || 15
      };
      clipsToUse = [singleClip];
      setRecordedClips(clipsToUse);
    }

    setRecordedBlobUrl(clipsToUse[0]?.url);
    setMediaUrls(clipsToUse.map(c => c.url));
    setPreviewActiveClipIndex(0);
    setMediaType('video');
    setIsPreviewPlaying(true);
    stopCamera();
    setStep('preview');
  };

  // Set default camera preference
  const handleSetDefaultCamera = (facing: 'user' | 'environment') => {
    localStorage.setItem('jio_shorts_default_camera', facing);
    setCameraFacing(facing);
    setIsCameraSettingsOpen(false);
    showToast(facing === 'user' ? '🤳 Front camera set as default' : '📷 Rear camera set as default');
  };

  // Scroll/Swipe up gesture handlers on capture screen to open Choose from Photo/Video Gallery
  const handleTouchStartCapture = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEndCapture = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    // Swiped up by at least 35px
    if (deltaY > 35) {
      setGalleryTab('gallery');
      setIsGalleryModalOpen(true);
    }
    touchStartYRef.current = null;
  };

  const handleWheelCapture = (e: React.WheelEvent) => {
    if (e.deltaY > 25) {
      setGalleryTab('gallery');
      setIsGalleryModalOpen(true);
    }
  };

  // Save reel to Drafts
  const handleSaveAsDraft = () => {
    const primaryUrl = recordedClips[0]?.url || recordedBlobUrl || mediaUrls[0] || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    shortsService.saveDraft({
      mediaType: mode === 'video' ? 'video' : (mediaUrls.length > 1 ? 'carousel' : 'photo'),
      mediaUrls: recordedClips.length > 0 ? recordedClips.map(c => c.url) : (mediaUrls.length > 0 ? mediaUrls : [primaryUrl]),
      durationSeconds: recordDuration || 15,
      clipsCount: mode === 'video' ? Math.max(1, recordedClips.length) : Math.max(1, mediaUrls.length),
      title: caption.trim() ? (caption.trim().slice(0, 50)) : `Draft Reel (${recordDuration || 15}s)`,
      description: caption.trim() || '',
      tags: selectedTags
    });
    setDraftsList(shortsService.getDrafts());
    showToast('💾 Reel saved as Draft!');
    setTimeout(() => {
      navigate('/shorts');
    }, 700);
  };

  // Retake video
  const handleRetake = () => {
    setRecordedBlobUrl(null);
    setMediaUrls([]);
    setRecordedClips([]);
    setRecordDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setStep('capture');
    startCamera();
  };

  // Snap photo from camera
  const handleSnapPhoto = () => {
    const video = videoStreamRef.current;
    const maxPhotos = config.maxCarouselPhotos || 10;
    if (mediaUrls.length >= maxPhotos) {
      showToast(`⚠️ Maximum ${maxPhotos} photos reached`);
      return;
    }

    if (video && video.readyState >= 2) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1920;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setMediaUrls(prev => {
            const next = [...prev, dataUrl];
            setMediaType(next.length > 1 ? 'carousel' : 'photo');
            showToast(`📸 Photo #${next.length} captured! (${next.length}/${maxPhotos})`);
            return next;
          });
          return;
        }
      } catch (e) {
        console.warn('Canvas photo capture error:', e);
      }
    }

    const fallbackPhotos = [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80'
    ];
    const picked = fallbackPhotos[mediaUrls.length % fallbackPhotos.length];
    setMediaUrls(prev => {
      const next = [...prev, picked];
      setMediaType(next.length > 1 ? 'carousel' : 'photo');
      showToast(`📸 Photo #${next.length} added! (${next.length}/${maxPhotos})`);
      return next;
    });
  };

  // Combine gallery video with existing recorded clips (no duration limit constraint)
  const handleAddVideoFromGallery = (videoUrl: string, durationSec: number = 15, title?: string) => {
    const effectiveDuration = durationSec || 15;
    const newClip: RecordedClip = {
      id: `clip_gal_${Date.now()}_${recordedClips.length + 1}`,
      url: videoUrl,
      durationSeconds: effectiveDuration
    };

    setRecordedClips(prev => [...prev, newClip]);
    setRecordDuration(prev => prev + effectiveDuration);
    setIsPaused(true);
    setIsRecording(false);
    setIsGalleryModalOpen(false);
    showToast(`🎬 Added ${effectiveDuration}s video from gallery`);
  };

  const handleToggleSelectGalleryPhoto = (url: string) => {
    setSelectedGalleryPhotos(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleConfirmAddGalleryPhotos = () => {
    if (selectedGalleryPhotos.length === 0) {
      setIsGalleryModalOpen(false);
      return;
    }
    const maxPhotos = config.maxCarouselPhotos;
    setMediaUrls(prev => {
      const combined = [...prev, ...selectedGalleryPhotos].slice(0, maxPhotos);
      setMediaType(combined.length > 1 ? 'carousel' : 'photo');
      return combined;
    });
    setSelectedGalleryPhotos([]);
    setIsGalleryModalOpen(false);
  };

  const handleToggleSelectGalleryVideo = (url: string) => {
    setSelectedGalleryVideos(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const handleConfirmAddGalleryVideos = () => {
    if (selectedGalleryVideos.length === 0) {
      setIsGalleryModalOpen(false);
      return;
    }

    let currentDuration = recordDuration;
    const newClips: RecordedClip[] = [];

    for (const url of selectedGalleryVideos) {
      const effectiveDuration = 15;
      newClips.push({
        id: `clip_gal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        url,
        durationSeconds: effectiveDuration
      });
      currentDuration += effectiveDuration;
    }

    if (newClips.length > 0) {
      setRecordedClips(prev => [...prev, ...newClips]);
      setRecordDuration(currentDuration);
      setIsPaused(true);
      setIsRecording(false);
      showToast(`🎬 Added ${newClips.length} video clip(s) from gallery`);
    }
    setSelectedGalleryVideos([]);
    setIsGalleryModalOpen(false);
  };

  const handleResumeDraft = (draft: ShortDraft) => {
    setMediaType(draft.mediaType);
    setMode(draft.mediaType === 'video' ? 'video' : 'photo');
    setMediaUrls(draft.mediaUrls);
    if (draft.description || draft.title) {
      setCaption(draft.description || draft.title || '');
    }
    if (draft.tags) {
      setSelectedTags(draft.tags);
    }
    if (draft.durationSeconds) {
      setRecordDuration(draft.durationSeconds);
    }
    if (draft.mediaType === 'video') {
      setRecordedBlobUrl(draft.mediaUrls[0]);
      setRecordedClips(
        draft.mediaUrls.map((url, i) => ({
          id: `draft_clip_${draft.id}_${i}`,
          url,
          durationSeconds: Math.round((draft.durationSeconds || 15) / Math.max(1, draft.mediaUrls.length))
        }))
      );
      setIsPaused(true);
    }
    setIsGalleryModalOpen(false);
    showToast(`📂 Resumed draft "${draft.title || 'Untitled'}"`);
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shortsService.deleteDraft(draftId);
    setDraftsList(shortsService.getDrafts());
    showToast('🗑️ Draft deleted');
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
    const remaining = Math.max(0, maxDurationSeconds - recordDuration);
    const clipDuration = Math.min(15, remaining > 0 ? remaining : 15);
    handleAddVideoFromGallery(url, clipDuration, file.name);
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
    setIsGalleryModalOpen(false);
  };

  // Circular Gallery Picker (supports both video and photos)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mode === 'photo') {
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
      showToast(`📸 ${urls.length} photo${urls.length > 1 ? 's' : ''} added from gallery`);
      return;
    }

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      stopCamera();
      setRecordedBlobUrl(null);
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

  // Video Clip Sequencing & Reordering in Preview
  const handleVideoDragStart = (index: number) => {
    setDraggedVideoClipIndex(index);
  };

  const handleVideoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedVideoClipIndex === null || draggedVideoClipIndex === index) return;

    const updatedClips = [...recordedClips];
    const [moved] = updatedClips.splice(draggedVideoClipIndex, 1);
    updatedClips.splice(index, 0, moved);
    setDraggedVideoClipIndex(index);
    setRecordedClips(updatedClips);
    setMediaUrls(updatedClips.map(c => c.url));
  };

  const handleVideoDragEnd = () => {
    setDraggedVideoClipIndex(null);
  };

  // Remove single video clip in preview
  const handleRemoveVideoClip = (index: number) => {
    const clipToRemove = recordedClips[index];
    const nextClips = recordedClips.filter((_, i) => i !== index);
    setRecordedClips(nextClips);
    setMediaUrls(nextClips.map(c => c.url));
    if (clipToRemove) {
      setRecordDuration(prev => Math.max(0, prev - clipToRemove.durationSeconds));
    }
    if (previewActiveClipIndex >= nextClips.length) {
      setPreviewActiveClipIndex(Math.max(0, nextClips.length - 1));
    }
    if (nextClips.length === 0) {
      setStep('capture');
      startCamera();
      showToast('↩️ Removed all clips. Back to camera.');
    } else {
      showToast(`Removed clip #${index + 1}`);
    }
  };

  // Automatically transition to next clip in combined amalgamated video
  const handleVideoClipEnded = () => {
    if (recordedClips.length > 1) {
      setPreviewActiveClipIndex(prev => (prev + 1) % recordedClips.length);
    }
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
    if (!acceptedTerms) {
      showToast('⚠️ Please accept the policies and terms and conditions to publish');
      return;
    }

    if (!caption.trim()) {
      showToast('⚠️ Please enter short captions for your Short');
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
      caption: caption.trim(),
      title: caption.trim().length > 60 ? caption.trim().slice(0, 60) + '...' : caption.trim(),
      description: caption.trim(),
      mediaType: mediaUrls.length > 1 && mediaType !== 'video' ? 'carousel' : mediaType,
      mediaUrls,
      thumbnailUrl: (!autoDeriveThumbnail && customThumbnailUrl) ? customThumbnailUrl : undefined,
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
          <div
            className="relative w-full h-full flex flex-col justify-between bg-black overflow-hidden"
            onTouchStart={handleTouchStartCapture}
            onTouchEnd={handleTouchEndCapture}
            onWheel={handleWheelCapture}
          >
            {/* Multi-Clip Segmented Progress Line at Top for Videos */}
            {mode === 'video' && (recordedClips.length > 0 || isRecording) && (
              <div className="absolute top-0 inset-x-0 h-1.5 bg-black/40 z-50 flex items-center gap-1 px-1">
                {recordedClips.map((clip, idx) => (
                  <div
                    key={clip.id || idx}
                    className="h-1 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,1)] transition-all"
                    style={{
                      width: `${Math.max(3, (clip.durationSeconds / maxDurationSeconds) * 100)}%`
                    }}
                    title={`Clip #${idx + 1}: ${clip.durationSeconds}s`}
                  />
                ))}
                {isRecording && (
                  <div
                    className="h-1 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,1)] transition-all"
                    style={{
                      width: `${Math.max(4, 100 - (recordedClips.reduce((acc, c) => acc + c.durationSeconds, 0) / maxDurationSeconds) * 100)}%`
                    }}
                  />
                )}
              </div>
            )}

            {/* Photo Stages Segmented Progress Line at Top for Photos */}
            {mode === 'photo' && mediaUrls.length > 0 && (
              <div className="absolute top-0 inset-x-0 h-1.5 bg-black/40 z-50 flex items-center gap-1.5 px-2">
                {mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,1)] transition-all animate-fade-in"
                    title={`Photo #${idx + 1}`}
                  />
                ))}
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
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 cursor-pointer"
                title="Close Studio"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top-Center: Recording Timer (Video) or Photo Stage Counter (Photo) */}
              <div className="flex items-center gap-2">
                {mode === 'video' && (isRecording || recordedClips.length > 0) && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-lg ${
                      isRecording
                        ? 'bg-red-600/90 text-white animate-pulse'
                        : 'bg-black/70 text-white border border-white/20'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRecording ? 'bg-white animate-ping' : 'bg-amber-400'
                      }`}
                    />
                    <span>
                      {formatTime(recordDuration)} / 01:00 ({recordedClips.length + (isRecording ? 1 : 0)}{' '}
                      {recordedClips.length + (isRecording ? 1 : 0) === 1 ? 'clip' : 'clips'})
                    </span>
                  </div>
                )}

                {mode === 'photo' && mediaUrls.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-lg bg-blue-900/80 text-blue-200 border border-blue-400/30">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>
                      {mediaUrls.length} / {config.maxCarouselPhotos || 10} Photos Added
                    </span>
                  </div>
                )}
              </div>

              {/* Top-Right: Flash Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlashActive(p => !p)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 border border-white/10 ${
                    isFlashActive ? 'bg-yellow-500 text-black' : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                  title="Toggle Flash"
                >
                  {isFlashActive ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* --- CENTER FULL-SCREEN VIEWFINDER (Live Camera for both Video & Photo) --- */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
              {isFlashActive && (
                <div className="absolute inset-0 bg-white/20 z-30 pointer-events-none mix-blend-screen" />
              )}

              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-10"
              />

              {/* Simulated Camera Feed Fallback if permission denied/testing */}
              {hasCameraPermission === false && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 z-0">
                  {mode === 'video' ? (
                    <video
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}
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

            {/* --- BOTTOM SECTION: SHUTTER AREA & BLACK MENU SECTION --- */}
            <div className="relative mt-auto w-full z-40 flex flex-col items-center">
              {/* Shutter / Trigger Area (Above the black menu section) */}
              <div className="w-full flex flex-col items-center justify-center pb-4 px-4 bg-gradient-to-t from-black via-black/85 to-transparent">
                {/* Center Shutter Button Row: Flex row with same horizontal alignment, undo and next closer to center */}
                <div className="w-full flex items-center justify-center gap-4 sm:gap-5 min-h-[80px]">
                  {/* Left: Undo button (Vertically centered on same line) */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    {mode === 'video' && recordedClips.length > 0 && !isRecording && (
                      <button
                        type="button"
                        onClick={handleUndoClip}
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                        title="Undo last clip"
                        aria-label="Undo last clip"
                      >
                        <RotateCcw className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {mode === 'photo' && mediaUrls.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setMediaUrls(prev => prev.slice(0, -1));
                        }}
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                        title="Remove last photo"
                        aria-label="Remove last photo"
                      >
                        <RotateCcw className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Center: Record / Snap Button (Vertically centered on same line) */}
                  <div className="flex items-center justify-center">
                    {mode === 'video' ? (
                      <button
                        type="button"
                        onClick={handleRecordButtonTap}
                        className="relative w-16 h-16 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                        title={
                          isRecording
                            ? 'Pause Recording'
                            : recordedClips.length > 0
                            ? 'Record Next Clip'
                            : 'Start Recording'
                        }
                        aria-label="Record Video"
                      >
                        {/* Outer boundary ring */}
                        <div
                          className={`absolute inset-0 rounded-full border-3 transition-all duration-300 ${
                            isRecording
                              ? 'border-red-500 scale-105 animate-pulse'
                              : 'border-white hover:border-gray-200'
                          }`}
                        />

                        {/* Inner Button Content */}
                        {isRecording ? (
                          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-lg transition-all animate-pulse">
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-3.5 bg-white rounded-full" />
                              <div className="w-1 h-3.5 bg-white rounded-full" />
                            </div>
                          </div>
                        ) : recordedClips.length > 0 ? (
                          <div className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-all">
                            <div className="w-6 h-6 rounded-full bg-red-600 shadow-sm transition-transform" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-all">
                            <div className="w-7 h-7 rounded-full border-2 border-red-500" />
                          </div>
                        )}
                      </button>
                    ) : (
                      /* Photo Mode Snap Button */
                      <button
                        onClick={handleSnapPhoto}
                        className="relative w-16 h-16 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                        title="Snap Photo"
                        aria-label="Snap Photo"
                      >
                        <div className="absolute inset-0 rounded-full border-3 border-white hover:border-gray-200" />
                        <div className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md">
                          <Camera className="w-5 h-5 text-gray-800" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Right: Next Button (Vertically centered on same line) */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    {mode === 'video' && recordedClips.length > 0 && !isRecording && (
                      <button
                        type="button"
                        onClick={handleNextFromRecording}
                        className="w-11 h-11 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                        title="Next"
                        aria-label="Next"
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </button>
                    )}
                    {mode === 'photo' && mediaUrls.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep('photo-audio')}
                        className="w-11 h-11 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
                        title="Next"
                        aria-label="Next"
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Black color menu section at the bottom of the page */}
              <div className="w-full bg-black border-t border-white/10 px-4 py-3 flex items-center justify-between">
                {/* Left bottom corner: Choose from gallery button - Opens Gallery & Drafts Modal */}
                <div className="w-14 flex justify-start">
                  <button
                    onClick={() => {
                      setGalleryTab('gallery');
                      setIsGalleryModalOpen(true);
                    }}
                    className="w-11 h-11 rounded-xl overflow-hidden border border-white/40 hover:border-white shadow-md active:scale-95 transition-all flex items-center justify-center bg-white/10 relative group"
                    title={mode === 'video' ? 'Open Video Gallery & Drafts' : 'Open Photo Gallery & Drafts'}
                    aria-label="Choose from Gallery"
                  >
                    <img
                      src={latestThumbnail}
                      alt="Gallery"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                  </button>
                </div>

                {/* Middle: Video and Photo options (By default video) */}
                <div className="flex items-center gap-8">
                  <button
                    type="button"
                    onClick={() => handleSelectMode('video')}
                    className={`text-xs uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      mode === 'video' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200 font-medium'
                    }`}
                  >
                    <span>VIDEO</span>
                    {mode === 'video' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,1)]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode('photo')}
                    className={`text-xs uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      mode === 'photo' ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200 font-medium'
                    }`}
                  >
                    <span>PHOTO</span>
                    {mode === 'photo' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,1)]" />
                    )}
                  </button>
                </div>

                {/* Right bottom corner: Switch camera button (Enhanced size!) */}
                <div className="w-14 flex justify-end">
                  <button
                    onClick={toggleCameraFacing}
                    className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-90 border border-white/25 flex items-center justify-center shadow-lg"
                    title="Switch Camera"
                    aria-label="Switch Camera"
                  >
                    <RefreshCw className="w-5 h-5 text-white" />
                  </button>
                </div>
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
              {/* VIDEO Short Preview (Amalgamated sequence of recorded and gallery clips) */}
              {mediaType === 'video' && (mediaUrls.length > 0 || recordedClips.length > 0) && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={previewVideoRef}
                    key={recordedClips[previewActiveClipIndex]?.id || `vid_${previewActiveClipIndex}_${mediaUrls[previewActiveClipIndex]}`}
                    src={recordedClips[previewActiveClipIndex]?.url || mediaUrls[previewActiveClipIndex] || mediaUrls[0]}
                    autoPlay
                    loop={recordedClips.length <= 1}
                    playsInline
                    muted={!isVideoAudioEnabled}
                    onEnded={handleVideoClipEnded}
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

                  {/* Active Clip Badge Overlay if multiple clips exist */}
                  {recordedClips.length > 1 && (
                    <div className="absolute top-16 left-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white flex items-center gap-1.5 shadow-lg">
                      <Film className="w-3.5 h-3.5 text-blue-400" />
                      <span>Playing Clip #{previewActiveClipIndex + 1} of {recordedClips.length}</span>
                    </div>
                  )}

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

            {/* Video Clips Sequencing Strip with Drag & Drop, Remove, and Add Clip */}
            {mediaType === 'video' && recordedClips.length > 0 && (
              <div className="bg-black/85 px-4 py-2 border-t border-white/10 z-40">
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Clips Sequence ({recordedClips.length})</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-blue-400 font-mono font-bold">{recordDuration}s</span>
                  </span>
                  <span className="text-gray-400 text-[9px]">Drag to reorder • Tap to play</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {recordedClips.map((clip, idx) => (
                    <div
                      key={clip.id || idx}
                      draggable
                      onDragStart={() => handleVideoDragStart(idx)}
                      onDragOver={(e) => handleVideoDragOver(e, idx)}
                      onDragEnd={handleVideoDragEnd}
                      onClick={() => setPreviewActiveClipIndex(idx)}
                      className={`relative w-14 h-16 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 flex-shrink-0 transition-transform group bg-gray-900 ${
                        previewActiveClipIndex === idx ? 'border-blue-400 scale-105 shadow-md ring-1 ring-blue-400/50' : 'border-white/20 opacity-80'
                      }`}
                    >
                      <video src={clip.url} className="w-full h-full object-cover pointer-events-none" />
                      <span className="absolute top-0.5 left-0.5 px-1 bg-black/75 text-[9px] font-mono text-white rounded">
                        #{idx + 1}
                      </span>
                      <span className="absolute bottom-0.5 left-0.5 px-1 bg-black/75 text-[8px] font-mono text-gray-300 rounded">
                        {clip.durationSeconds}s
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideoClip(idx);
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Remove Clip"
                        aria-label="Remove Clip"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}

                  {/* Add Clip Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryTab('gallery');
                      setIsGalleryModalOpen(true);
                    }}
                    className="w-14 h-16 rounded-xl border-2 border-dashed border-white/30 hover:border-blue-400 bg-white/5 hover:bg-blue-600/10 text-gray-300 hover:text-white flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-all cursor-pointer"
                    title="Add more video clips to reel"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] font-bold">Add Clip</span>
                  </button>
                </div>
              </div>
            )}

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
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Remove Photo"
                        aria-label="Remove Photo"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: Retake (icon with hover text), Save as Draft (text button), and Next (icon + text) */}
            <div className="relative bg-gradient-to-t from-black via-black/90 to-transparent p-4 pb-6 flex items-center justify-between max-w-md mx-auto w-full z-40 gap-3">
              {/* Left: Retake Button (Shows icon, and on hovering shows the text) */}
              <button
                type="button"
                onClick={() => {
                  if (mode === 'video') {
                    handleRetake();
                  } else {
                    setStep('capture');
                  }
                }}
                className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 shadow-md cursor-pointer flex-shrink-0"
                title={mode === 'video' ? 'Retake Video' : 'Retake Photos'}
                aria-label={mode === 'video' ? 'Retake Video' : 'Retake Photos'}
              >
                <RotateCcw className="w-5 h-5 text-white transition-transform group-hover:-rotate-90 duration-300" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 text-xs font-semibold">
                  {mode === 'video' ? 'Retake Video' : 'Retake Photos'}
                </span>
              </button>

              {/* Center: Save as Draft (Keep the text button) */}
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="px-4 py-2.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Save as Draft"
              >
                <span>Save as Draft</span>
              </button>

              {/* Right: Next Button (Complete next icon plus text button) */}
              <button
                type="button"
                onClick={() => setStep('details-and-tags')}
                className="px-6 py-2.5 rounded-full bg-[#002B7F] hover:bg-blue-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer flex-shrink-0"
                title="Next"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 text-white" />
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
                  {!autoDeriveThumbnail && customThumbnailUrl ? (
                    <img src={customThumbnailUrl} alt="Thumbnail Cover" className="w-full h-full object-cover" />
                  ) : mediaType === 'video' ? (
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

              {/* Video Thumbnail Options (Auto-selected checkbox or custom single photo upload) */}
              {mediaType === 'video' && (
                <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Video Thumbnail Cover
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {autoDeriveThumbnail ? 'Derived from video' : 'Custom photo'}
                    </span>
                  </div>

                  {/* Auto-selected Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoDeriveThumbnail}
                      onChange={(e) => setAutoDeriveThumbnail(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#002B7F] focus:ring-[#002B7F]"
                    />
                    <span className="text-xs text-gray-800 font-semibold">
                      Derive video thumbnail automatically from video
                    </span>
                  </label>

                  {/* If checkbox is unselected: Custom single photo upload */}
                  {!autoDeriveThumbnail && (
                    <div className="pt-2 border-t border-gray-100 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-18 bg-gray-900 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          {customThumbnailUrl ? (
                            <img src={customThumbnailUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-1">
                              <ImageIcon className="w-5 h-5 text-gray-400 mx-auto" />
                              <span className="text-[8px] text-gray-400">No Photo</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <p className="text-xs font-bold text-gray-800">Custom Thumbnail Photo</p>
                          <p className="text-[11px] text-gray-500">Upload a single photo to use as cover thumbnail.</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => thumbnailInputRef.current?.click()}
                              className="px-3 py-1.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{customThumbnailUrl ? 'Change Photo' : 'Upload Single Photo'}</span>
                            </button>
                            {customThumbnailUrl && (
                              <button
                                type="button"
                                onClick={() => setCustomThumbnailUrl('')}
                                className="px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Short Captions (Mandatory long text with max 500 characters, no title and no description) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Short Captions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write short captions for your learning reel... Describe key takeaways, concepts, or highlights (up to 500 characters)"
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition-all resize-none shadow-2xs leading-relaxed"
                  maxLength={500}
                />
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className={caption.trim() ? "text-gray-500" : "text-amber-600 font-medium"}>
                    {caption.trim() ? "Mandatory field" : "Caption is required to publish"}
                  </span>
                  <span className={`font-mono ${caption.length >= 480 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                    {caption.length}/500
                  </span>
                </div>
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

              {/* Terms and Conditions Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#002B7F] focus:ring-[#002B7F]"
                  />
                  <span className="text-xs text-gray-700 leading-snug">
                    I accept the platform <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-[#002B7F] font-bold underline hover:text-blue-800">policies and terms and conditions</button> regarding micro-learning content submission.
                  </span>
                </label>
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

        {/* Terms & Conditions Modal */}
        {isTermsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsTermsModalOpen(false)}>
            <div className="bg-white text-gray-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Platform Policies & Terms</h3>
                <button onClick={() => setIsTermsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-600 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
                <p>1. <strong>Original Content:</strong> All submitted short videos, photo decks, and learning notes must be original work created by the employee or properly attributed.</p>
                <p>2. <strong>Professional Conduct:</strong> Content must adhere to enterprise compliance, confidentiality, and professional standards.</p>
                <p>3. <strong>Moderation Review:</strong> All uploads are subject to Content Manager review before appearing in the enterprise feed.</p>
                <p>4. <strong>Compliance Adherence:</strong> Violation of platform policies will result in content rejection or revocation.</p>
              </div>
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setIsTermsModalOpen(false);
                }}
                className="w-full py-2.5 bg-[#002B7F] text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-800 transition-colors"
              >
                Accept & Close
              </button>
            </div>
          </div>
        )}

        {/* --- Gallery & Saved Drafts Menu Modal (Mobile Bottom Sheet & Web Center Modal) --- */}
        {isGalleryModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
            onClick={() => setIsGalleryModalOpen(false)}
          >
            <div
              className="bg-slate-900 border border-white/20 text-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-md max-h-[88vh] md:max-h-[82vh] flex flex-col overflow-hidden animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header with Settings Icon and Close Button */}
              <div className="p-3.5 px-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70 backdrop-blur-md">
                {galleryTab === 'settings' ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGalleryTab('gallery')}
                      className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 p-1.5 -ml-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <h3 className="text-sm font-bold text-white">Studio Settings</h3>
                  </div>
                ) : galleryTab === 'drafts' ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGalleryTab('gallery')}
                      className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 p-1.5 -ml-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <h3 className="text-sm font-bold text-white">Saved Drafts ({draftsList.length})</h3>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400">
                      {mode === 'video' ? (
                        <Video className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {mode === 'video' ? 'Choose from Video Gallery' : 'Choose from Photo Gallery'}
                      </h3>
                      <p className="text-[10px] text-gray-400">
                        {mode === 'video' ? 'Select videos to combine' : 'Select up to 10 photos'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {galleryTab === 'gallery' && (
                    <>
                      {/* Small compact grayish button for View Drafts */}
                      <button
                        type="button"
                        onClick={() => setGalleryTab('drafts')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        View Drafts
                      </button>

                      {/* Settings Icon: Opens settings page inside modal */}
                      <button
                        type="button"
                        onClick={() => setGalleryTab('settings')}
                        className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Camera Preferences & Studio Settings"
                        aria-label="Camera Settings"
                      >
                        <Settings className="w-4.5 h-4.5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsGalleryModalOpen(false);
                      setGalleryTab('gallery');
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close Gallery"
                    aria-label="Close Gallery"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ==================== VIEW: SETTINGS SUBPAGE ==================== */}
                {galleryTab === 'settings' && (
                  <div className="space-y-4 py-1 animate-fade-in">
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-blue-400" />
                            <span>Default Camera</span>
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Choose which camera is active when opening the recording studio.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSetDefaultCamera('user')}
                          className={`p-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border ${
                            cameraFacing === 'user'
                              ? 'bg-[#002B7F] text-white border-blue-400 shadow-md ring-1 ring-blue-400'
                              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-lg">🤳</span>
                          <span>Front Camera</span>
                          <span className="text-[10px] font-normal text-blue-200">
                            {cameraFacing === 'user' ? '✓ Default Selected' : 'Tap to set default'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDefaultCamera('environment')}
                          className={`p-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border ${
                            cameraFacing === 'environment'
                              ? 'bg-[#002B7F] text-white border-blue-400 shadow-md ring-1 ring-blue-400'
                              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-lg">📷</span>
                          <span>Rear Camera</span>
                          <span className="text-[10px] font-normal text-blue-200">
                            {cameraFacing === 'environment' ? '✓ Default Selected' : 'Tap to set default'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-blue-900/20 border border-blue-500/20 rounded-2xl text-xs text-blue-200 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span>Settings are auto-saved</span>
                      </p>
                      <p className="text-[11px] text-gray-300">
                        Your preferred camera mode will be remembered across sessions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGalleryTab('gallery')}
                      className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold transition-colors shadow-md"
                    >
                      Done & Return to Gallery
                    </button>
                  </div>
                )}

                {/* ==================== VIEW 1: DRAFTS LIST ==================== */}
                {galleryTab === 'drafts' && (
                  <div className="space-y-2.5">
                    {draftsList.length === 0 ? (
                      <div className="py-12 px-4 text-center space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-500">
                          <Film className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-300">No Saved Drafts</h4>
                          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                            Save in-progress reels using the "Save as Draft" button in the recording studio.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGalleryTab('gallery')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Explore Gallery
                        </button>
                      </div>
                    ) : (
                      draftsList.map(draft => (
                        <div
                          key={draft.id}
                          onClick={() => handleResumeDraft(draft)}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-98"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-14 h-16 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/20">
                              {draft.mediaUrls[0] && draft.mediaType === 'video' ? (
                                <video src={draft.mediaUrls[0]} className="w-full h-full object-cover" />
                              ) : (
                                <img src={draft.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                              )}
                              <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-[8px] font-mono text-white rounded">
                                {draft.durationSeconds || 15}s
                              </span>
                            </div>

                            <div className="min-w-0 text-left">
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                {draft.title || draft.description || 'Untitled Reel Draft'}
                              </h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {draft.clipsCount || 1} {draft.mediaType === 'video' ? 'clip(s)' : 'slide(s)'} • {draft.durationSeconds || 15}s
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">
                                  {draft.mediaType === 'video' ? 'Video Draft' : 'Photo Draft'}
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  {new Date(draft.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteDraft(draft.id, e)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Draft"
                              aria-label="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="p-1 text-gray-500 group-hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ==================== VIEW 2: GALLERY (VIDEOS ONLY OR PHOTOS ONLY) ==================== */}
                {galleryTab === 'gallery' && (
                  <div className="space-y-4">
                    {/* Mode Specific Options */}
                    {mode === 'video' ? (
                      /* VIDEO GALLERY MODE (Videos only, multi-select and combine) */
                      <div className="space-y-3">
                        {/* Video Grid (Videos Only) */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-gray-300">Enterprise Video Clips</span>
                            <span className="text-[10px] text-gray-400">
                              {selectedGalleryVideos.length} selected
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {GALLERY_VIDEOS.map(video => {
                              const isSelected = selectedGalleryVideos.includes(video.url);
                              return (
                                <div
                                  key={video.id}
                                  onClick={() => handleToggleSelectGalleryVideo(video.url)}
                                  className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all aspect-[9/14] group bg-black ${
                                    isSelected
                                      ? 'border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] scale-[1.02]'
                                      : 'border-white/15 hover:border-white/40'
                                  }`}
                                >
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                                  {/* Selection Checkmark Badge */}
                                  <div className="absolute top-2 right-2 z-20">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-blue-600 text-white shadow-md'
                                          : 'bg-black/60 border border-white/40 text-transparent'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  </div>

                                  {/* Video Title */}
                                  <div className="absolute bottom-2 inset-x-2 z-10">
                                    <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                                      {video.title}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* PHOTO GALLERY MODE (Multi-select photos) */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-300">Select Photos</span>
                          <span className="text-[10px] text-blue-400 font-bold">
                            {selectedGalleryPhotos.length}/{config.maxCarouselPhotos} selected
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {GALLERY_PHOTOS.map((url, idx) => {
                            const selIndex = selectedGalleryPhotos.indexOf(url);
                            const isSelected = selIndex !== -1;
                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleSelectGalleryPhoto(url)}
                                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                                  isSelected
                                    ? 'border-blue-500 shadow-md scale-[1.02]'
                                    : 'border-white/15 hover:border-white/40'
                                }`}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-1.5 right-1.5">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                      isSelected
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-black/60 border border-white/40 text-transparent'
                                    }`}
                                  >
                                    {isSelected ? selIndex + 1 : ''}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Bottom CTA Bar */}
              {galleryTab === 'gallery' && (
                <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGalleryModalOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-white/20 text-gray-300 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  {mode === 'video' ? (
                    <button
                      type="button"
                      disabled={selectedGalleryVideos.length === 0}
                      onClick={handleConfirmAddGalleryVideos}
                      className="flex-1 py-2.5 bg-[#002B7F] hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#002B7F] text-white rounded-full text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {selectedGalleryVideos.length > 0
                          ? `Add Selected Video${selectedGalleryVideos.length > 1 ? 's' : ''} (${selectedGalleryVideos.length}) to Reel`
                          : 'Select Video(s) to Add'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={selectedGalleryPhotos.length === 0}
                      onClick={handleConfirmAddGalleryPhotos}
                      className="flex-1 py-2.5 bg-[#002B7F] hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#002B7F] text-white rounded-full text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {selectedGalleryPhotos.length > 0
                          ? `Add Selected Photos (${selectedGalleryPhotos.length})`
                          : 'Select Photos to Add'}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShortPage;
