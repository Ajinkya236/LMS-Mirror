import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Play,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  Music,
  Check,
  Copy,
  X,
  Zap,
  ArrowLeft,
  Film,
  MoreVertical,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Flag,
  User,
  UserPlus,
  Sparkles,
  Eye,
  Hash
} from 'lucide-react';
import {
  ShortItem,
  shortsService,
  ShortsRecommendationConfig,
  INITIAL_CREATORS,
  REPORT_REASONS,
  ReportReasonType
} from '../../services/shortsService';

interface ShortsViewerProps {
  initialShortId?: string;
  orderedShortIds?: string[];
  fromSource?: string;
}

export const ShortsViewer: React.FC<ShortsViewerProps> = ({
  initialShortId,
  orderedShortIds,
  fromSource
}) => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportDetail, setReportDetail] = useState('');

  // Persistent mute state during the active Shorts session (sessionStorage)
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('jio_shorts_muted_state');
    return saved !== null ? saved === 'true' : false;
  });

  // 2x Fast-forward accelerated playback on press-and-hold
  const [isAccelerating, setIsAccelerating] = useState(false);
  const holdTimeoutRef = useRef<any>(null);
  const isHoldingRef = useRef(false);

  // Double tap like detection & animated burst heart
  const lastTapRef = useRef<number>(0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  // Video progress & duration for interactive seeking & thin bottom progress bar
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Carousel photo index for photo deck shorts
  const [carouselPhotoIndex, setCarouselPhotoIndex] = useState(0);

  // Watch timer tracking for threshold counting
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [viewCountedForCurrent, setViewCountedForCurrent] = useState(false);

  // Touch swipe coordinates
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // More Options Action Sheet Menu
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
  const [savedShortIds, setSavedShortIds] = useState<string[]>(() => shortsService.getSavedShortIds());
  const [userReactions, setUserReactions] = useState<Record<string, 'interested' | 'not_interested' | null>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleSavedUpdate = () => {
      setSavedShortIds(shortsService.getSavedShortIds());
    };
    window.addEventListener('jio_shorts_saved_updated', handleSavedUpdate);
    return () => window.removeEventListener('jio_shorts_saved_updated', handleSavedUpdate);
  }, []);

  useEffect(() => {
    const handleFollowsUpdate = () => {
      const allShorts = shortsService.getAllShorts();
      const updatedMap: Record<string, boolean> = {};
      allShorts.forEach(s => {
        updatedMap[s.author.id] = shortsService.isFollowingCreator(s.author.id);
      });
      setFollowingMap(updatedMap);
    };
    window.addEventListener('jio_shorts_follows_updated', handleFollowsUpdate);
    handleFollowsUpdate();
    return () => window.removeEventListener('jio_shorts_follows_updated', handleFollowsUpdate);
  }, []);

  const toggleSaveShort = (shortId: string) => {
    const res = shortsService.toggleSaveShort(shortId);
    setSavedShortIds(shortsService.getSavedShortIds());
    showToast(res.isSaved ? '🔖 Saved to your profile collection' : 'Bookmark removed');
    setIsMoreMenuOpen(false);
  };

  const handleInterested = () => {
    if (!currentShort) return;
    setUserReactions(prev => ({ ...prev, [currentShort.id]: 'interested' }));
    setIsMoreMenuOpen(false);
    showToast('✨ Feed updated: We will recommend more shorts on this topic!');
  };

  const handleNotInterested = () => {
    if (!currentShort) return;
    setUserReactions(prev => ({ ...prev, [currentShort.id]: 'not_interested' }));
    setIsMoreMenuOpen(false);
    showToast('👎 Got it: Showing fewer shorts like this');
    setTimeout(() => {
      goToNext();
    }, 400);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentShort) return;
    const res = shortsService.toggleFollowCreator(currentShort.author.id);
    setFollowingMap(prev => ({
      ...prev,
      [currentShort.author.id]: res.isFollowing
    }));
    if (res.isFollowing) {
      showToast(`✨ You are now following ${currentShort.author.name}!`);
    } else {
      showToast(`Unfollowed ${currentShort.author.name}`);
    }
  };

  // Share Modal for Short
  const [sharingShort, setSharingShort] = useState<ShortItem | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Track total unique reels viewed during this Shorts session (plus icon shows for first 4 reels only)
  const [viewedReelsCount, setViewedReelsCount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('jio_shorts_viewed_reel_count');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const viewedIndicesRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    viewedIndicesRef.current.add(currentIndex);
    const count = viewedIndicesRef.current.size;
    setViewedReelsCount(count);
    try {
      sessionStorage.setItem('jio_shorts_viewed_reel_count', String(count));
    } catch (e) {
      console.error(e);
    }
  }, [currentIndex]);

  // Floating Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<any>(null);
  const lastWheelTimeRef = useRef<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get config
  const [config, setConfig] = useState<ShortsRecommendationConfig>(() => shortsService.getConfig());

  // Listen to config updates & store updates
  useEffect(() => {
    const handleConfigChange = () => {
      setConfig(shortsService.getConfig());
    };
    window.addEventListener('jio_shorts_config_changed', handleConfigChange);
    window.addEventListener('jio_shorts_updated', handleConfigChange);
    return () => {
      window.removeEventListener('jio_shorts_config_changed', handleConfigChange);
      window.removeEventListener('jio_shorts_updated', handleConfigChange);
    };
  }, []);

  // Persist mute state to sessionStorage so it stays identical across all short transitions
  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsMuted(prev => {
      const next = !prev;
      sessionStorage.setItem('jio_shorts_muted_state', String(next));
      return next;
    });
  }, []);

  // Fetch approved & visible shorts, following specified custom order if provided
  const feedShorts = useMemo(() => {
    const allApproved = shortsService.getApprovedShorts();
    if (orderedShortIds && orderedShortIds.length > 0) {
      const idMap = new Map(allApproved.map(s => [s.id, s]));
      const ordered = orderedShortIds
        .map(id => idMap.get(id))
        .filter((s): s is ShortItem => !!s);
      return ordered.length > 0 ? ordered : shortsService.getPersonalizedFeed();
    }
    return shortsService.getPersonalizedFeed();
  }, [config, orderedShortIds]);

  // Handle initial short query param or prop
  useEffect(() => {
    if (initialShortId && feedShorts.length > 0) {
      const idx = feedShorts.findIndex(s => s.id === initialShortId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialShortId, feedShorts]);

  const currentShort: ShortItem | undefined = feedShorts[currentIndex];
  const nextShort: ShortItem | undefined = feedShorts[currentIndex + 1];

  // Navigation actions
  const goToNext = useCallback(() => {
    if (currentIndex < feedShorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      showToast('🎉 You have reached the end of the feed!');
    }
  }, [currentIndex, feedShorts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Reset timers, carousel, and seeking when switching to a new short
  useEffect(() => {
    setCarouselPhotoIndex(0);
    setSecondsWatched(0);
    setViewCountedForCurrent(false);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setIsAccelerating(false);
    setIsDescriptionExpanded(false);
    setShowDoubleTapHeart(false);

    if (timerRef.current) clearInterval(timerRef.current);

    if (!currentShort) return;

    // Start watch duration tracking for N-second threshold
    timerRef.current = setInterval(() => {
      setSecondsWatched(prev => {
        const next = prev + 1;
        if (next >= config.viewThresholdSeconds && !viewCountedForCurrent) {
          const res = shortsService.recordView(currentShort.id, next);
          if (res.counted) {
            setViewCountedForCurrent(true);
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentShort?.id, config.viewThresholdSeconds]);

  // Handle Video element playback, mute persistence, and accelerated speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = isAccelerating ? 2.0 : 1.0;

      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }

    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.playbackRate = isAccelerating ? 2.0 : 1.0;

      if (isPlaying && currentShort?.audioUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, isMuted, isAccelerating, currentShort?.audioUrl]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sharingShort) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, sharingShort, toggleMute]);

  // Mouse wheel snap scrolling
  // User Requirement: Scrolling UP shows NEXT reel, scrolling DOWN shows PREVIOUS reel
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 450) return;

    if (e.deltaY < -20) {
      // Scroll UP -> NEXT reel
      lastWheelTimeRef.current = now;
      goToNext();
    } else if (e.deltaY > 20) {
      // Scroll DOWN -> PREVIOUS reel
      lastWheelTimeRef.current = now;
      goToPrev();
    }
  };

  // Touch handlers for swipe up/down and horizontal swipe for photo deck
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const diffY = touchStartY.current - endY;
    const diffX = touchStartX.current - endX;

    // If viewing photo carousel and user swiped horizontally
    if (currentShort?.mediaType === 'carousel' && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 30) {
        // Next photo slide
        setCarouselPhotoIndex(p => Math.min(currentShort.mediaUrls.length - 1, p + 1));
      } else if (diffX < -30) {
        // Prev photo slide
        setCarouselPhotoIndex(p => Math.max(0, p - 1));
      }
      touchStartY.current = null;
      touchStartX.current = null;
      return;
    }

    // Vertical swipe between reels (Swipe UP -> NEXT reel, Swipe DOWN -> PREV reel)
    if (diffY > 35) {
      goToNext();
    } else if (diffY < -35) {
      goToPrev();
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Tap on video: Double Tap to Like OR Single Tap to Pause/Resume
  const handleVideoTap = (e: React.MouseEvent) => {
    if (isHoldingRef.current) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeDiff < 300) {
      // DOUBLE TAP DETECTED -> LIKE REEL
      if (currentShort) {
        const isCurrentlyLiked = shortsService.isLiked(currentShort.id);
        if (!isCurrentlyLiked) {
          shortsService.toggleLike(currentShort.id);
        }
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 900);
      }
    } else {
      // SINGLE TAP -> PAUSE / RESUME
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 300) {
          setIsPlaying(p => !p);
        }
      }, 300);
    }
  };

  // Press-and-hold for temporary 2x accelerated playback
  const handlePointerDown = () => {
    isHoldingRef.current = false;
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsAccelerating(true);
    }, 250);
  };

  const handlePointerUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (isHoldingRef.current) {
      setIsAccelerating(false);
      isHoldingRef.current = false;
    }
  };

  // Like action toggle
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentShort) return;
    const res = shortsService.toggleLike(currentShort.id);
    if (res.isLiked) {
      showToast('❤️ Liked short!');
    }
  };

  // Share action
  const handleOpenShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentShort) return;
    shortsService.recordShare(currentShort.id);
    setSharingShort(currentShort);
  };

  const handleCopyShareLink = () => {
    if (!sharingShort) return;
    const shortUrl = `${window.location.origin}/#/shorts?short=${sharingShort.id}`;
    navigator.clipboard.writeText(shortUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
    showToast('🔗 Deep link copied to clipboard!');
  };

  // Video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeeking) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  // Progress percentage for bottom thin horizontal progress bar
  const progressPercent = useMemo(() => {
    if (currentShort?.mediaType === 'video') {
      if (duration > 0) return (currentTime / duration) * 100;
      return 0;
    }
    if (currentShort?.mediaType === 'carousel' && currentShort.mediaUrls.length > 0) {
      return ((carouselPhotoIndex + 1) / currentShort.mediaUrls.length) * 100;
    }
    return 100;
  }, [currentShort, currentTime, duration, carouselPhotoIndex]);

  if (!currentShort) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Film className="w-12 h-12 text-blue-400 animate-pulse" />
        <h2 className="text-xl font-bold">No Learning Shorts Available</h2>
        <p className="text-xs text-gray-400 text-center max-w-sm">
          Be the first employee to create and share a 60-second learning short!
        </p>
        <button
          onClick={() => navigate('/shorts/create')}
          className="px-6 py-2.5 bg-[#002B7F] rounded-2xl text-xs font-bold text-white shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Learning Short</span>
        </button>
      </div>
    );
  }

  const isLiked = shortsService.isLiked(currentShort.id);
  const isSaved = savedShortIds.includes(currentShort.id);
  const isOwnProfile = currentShort.author.id === INITIAL_CREATORS['u_current'].id;
  const isFollowingAuthor = followingMap[currentShort.author.id] !== undefined
    ? followingMap[currentShort.author.id]
    : shortsService.isFollowingCreator(currentShort.author.id);

  return (
    <div
      className="fixed inset-0 top-0 md:top-16 bottom-16 md:bottom-0 bg-slate-950 flex items-center justify-center select-none overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background preloader for next short */}
      {nextShort && nextShort.mediaType === 'video' && (
        <video src={nextShort.mediaUrls[0]} preload="auto" className="hidden" muted />
      )}

      {/* Main Reel Container (9:16 Aspect Ratio Viewport) */}
      <div
        className="relative w-full h-full max-w-[430px] md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between"
      >
        {/* --- 1. Top Bar Overlay --- */}
        <div className="absolute top-0 inset-x-0 z-40 p-3.5 pt-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-auto">
          {/* Top-Left: Back Button when opened from profile/search OR Plus Icon (No circular border) */}
          <div>
            {fromSource ? (
              <button
                onClick={() => {
                  if (fromSource.startsWith('topic_')) {
                    const topicName = fromSource.replace('topic_', '');
                    navigate(`/shorts/search?topic=${encodeURIComponent(topicName)}`);
                  } else if (fromSource === 'search') {
                    navigate('/shorts/search');
                  } else {
                    navigate(-1);
                  }
                }}
                className="p-2 text-white hover:opacity-80 transition-all active:scale-95 flex items-center justify-center group"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/shorts/create')}
                className="p-2 text-white hover:opacity-80 transition-all active:scale-95 flex items-center justify-center group"
                title="Create Learning Short"
                aria-label="Create Learning Short"
              >
                <Plus className="w-7 h-7 stroke-[2.5] text-white group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {/* Top-Right: Search Button & Creator Profile Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/shorts/search')}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10"
              title="Search Learning Shorts"
              aria-label="Search Learning Shorts"
            >
              <Search className="w-5 h-5 text-white" />
            </button>

            {/* Profile Icon to open user's own Reels Profile */}
            <button
              onClick={() => navigate(`/shorts/creator/${INITIAL_CREATORS['u_current'].id}`)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 hover:border-white transition-all active:scale-95 shadow-md flex-shrink-0"
              title="My Reels Profile"
              aria-label="My Reels Profile"
            >
              <img
                src={INITIAL_CREATORS['u_current'].avatar}
                alt="My Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* --- 2. Main Media Screen (Video / Carousel / Single Photo) --- */}
        <div
          className="relative flex-1 w-full h-full cursor-pointer flex items-center justify-center bg-black overflow-hidden"
          onClick={handleVideoTap}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* VIDEO Short */}
          {currentShort.mediaType === 'video' && (
            <video
              ref={videoRef}
              src={currentShort.mediaUrls[0]}
              playsInline
              loop
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              className="w-full h-full object-cover"
            />
          )}

          {/* CAROUSEL Photo Deck Short */}
          {currentShort.mediaType === 'carousel' && (
            <div className="relative w-full h-full">
              <img
                src={currentShort.mediaUrls[carouselPhotoIndex] || currentShort.mediaUrls[0]}
                alt={currentShort.title}
                className="w-full h-full object-cover"
              />

              {/* Prev / Next Slide Arrows */}
              {carouselPhotoIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselPhotoIndex(p => p - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 text-white backdrop-blur-md"
                >
                  ‹
                </button>
              )}
              {carouselPhotoIndex < currentShort.mediaUrls.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselPhotoIndex(p => p + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 text-white backdrop-blur-md"
                >
                  ›
                </button>
              )}

              {/* Voiceover Audio */}
              {currentShort.audioUrl && (
                <audio
                  ref={audioRef}
                  src={currentShort.audioUrl}
                  loop
                  autoPlay
                  muted={isMuted}
                />
              )}
            </div>
          )}

          {/* SINGLE PHOTO Short */}
          {currentShort.mediaType === 'photo' && (
            <div className="relative w-full h-full">
              <img
                src={currentShort.mediaUrls[0]}
                alt={currentShort.title}
                className="w-full h-full object-cover"
              />
              {currentShort.audioUrl && (
                <audio
                  ref={audioRef}
                  src={currentShort.audioUrl}
                  loop
                  autoPlay
                  muted={isMuted}
                />
              )}
            </div>
          )}

          {/* Centered Pause & Sound Indicator Icon */}
          {!isPlaying && !showDoubleTapHeart && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-black/30 transition-all gap-3">
              {/* Small Sound Icon Button Above Play Icon (Icon ONLY, No Text) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="pointer-events-auto p-2.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 shadow-xl flex items-center justify-center transition-all active:scale-95 animate-scale-up"
                title={isMuted ? 'Unmute sound' : 'Mute sound'}
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-amber-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Play Shutter Indicator */}
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-scale-up">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Double Tap Floating Heart Animation Burst */}
          {showDoubleTapHeart && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-rose-600/90 backdrop-blur-md flex items-center justify-center shadow-2xl animate-ping text-white">
                <Heart className="w-14 h-14 fill-white text-white" />
              </div>
            </div>
          )}

          {/* 2x Fast-Forward Indicator */}
          {isAccelerating && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-blue-600/90 text-white text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-2xl animate-pulse">
              <Zap className="w-4 h-4 fill-white" />
              <span>2X SPEED</span>
            </div>
          )}
        </div>

        {/* --- 4. Bottom Info Overlay (Constrained width, single title/description with three-dot expander, tags button) --- */}
        <div className="absolute bottom-1 inset-x-0 z-30 p-4 pb-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none">
          {/* Photo Post Carousel Dots - Positioned directly above profile menu & profile text */}
          {currentShort.mediaType === 'carousel' && currentShort.mediaUrls.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-3 pointer-events-auto">
              {currentShort.mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselPhotoIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    carouselPhotoIndex === idx
                      ? 'w-6 bg-white shadow-lg ring-1 ring-white/40'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Main content column constrained to max 78% width to never collide with right buttons */}
          <div className="max-w-[78%] space-y-2 pointer-events-auto">
            {/* Creator Profile Link with Profile Picture / Icon & Ghost Follow Button right next to profile name */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                onClick={() => navigate(`/shorts/creator/${currentShort.author.id}`)}
                className="flex items-center gap-2 cursor-pointer group max-w-full"
              >
                {/* Show profile picture of creator, but profile icon only for My Reels (own profile) */}
                {!isOwnProfile && currentShort.author.avatar ? (
                  <img
                    src={currentShort.author.avatar}
                    alt={currentShort.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/40 shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-md"
                    title={isOwnProfile ? "My Reels Profile" : currentShort.author.name}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left overflow-hidden">
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 flex items-center gap-1.5 transition-colors truncate">
                    <span className="truncate">{currentShort.author.name}</span>
                  </div>
                </div>
              </div>

              {/* Follow Button: Shown right next to profile name with NO button background (icon + text only) */}
              {!isOwnProfile && !isFollowingAuthor && (
                <button
                  onClick={handleToggleFollow}
                  className="text-white hover:text-blue-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors p-0 active:scale-95 bg-transparent border-0 shadow-none flex-shrink-0 drop-shadow-md ml-0.5"
                  title={`Follow ${currentShort.author.name}`}
                  aria-label={`Follow ${currentShort.author.name}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </button>
              )}
            </div>

            {/* Single Combined Reel Title & Description Field with Three-Dot Expand/Contract Button */}
            <div className="text-left">
              {currentShort.description ? (
                <p className="text-xs sm:text-sm text-white leading-snug drop-shadow">
                  <span className="font-bold">{currentShort.title}</span>
                  <span className="text-gray-200 ml-1.5 font-normal text-[11px] sm:text-xs">
                    {isDescriptionExpanded
                      ? `— ${currentShort.description}`
                      : currentShort.description.length > 60
                      ? `— ${currentShort.description.slice(0, 60)}`
                      : `— ${currentShort.description}`}
                  </span>
                  {currentShort.description.length > 60 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(!isDescriptionExpanded);
                      }}
                      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-white/25 hover:bg-white/35 text-white text-[10px] font-extrabold tracking-widest cursor-pointer ml-1.5 transition-colors align-middle shadow-xs"
                      title={isDescriptionExpanded ? "Contract description" : "Expand description"}
                      aria-label={isDescriptionExpanded ? "Contract description" : "Expand description"}
                    >
                      •••
                    </button>
                  )}
                </p>
              ) : (
                <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow line-clamp-2">
                  {currentShort.title}
                </h3>
              )}
            </div>

            {/* Tags Area: Shows up to 2 tag bubbles without hashtags, plus an 'N tags' button for remaining tags */}
            {currentShort.tags && currentShort.tags.length > 0 && (
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                {/* Fixed area: Up to 2 tag bubbles (NO hashtags) */}
                {currentShort.tags.slice(0, 2).map((rawTag) => {
                  const cleanTag = rawTag.replace(/^#/, '');
                  return (
                    <button
                      key={rawTag}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shorts/search?topic=${encodeURIComponent(cleanTag)}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium backdrop-blur-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                      title={`Explore ${cleanTag}`}
                    >
                      {cleanTag}
                    </button>
                  );
                })}

                {/* Remaining Tags Button (e.g. "+2 tags") that opens complete list menu */}
                {currentShort.tags.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTagsMenuOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-full bg-blue-500/30 hover:bg-blue-500/45 text-blue-200 hover:text-white border border-blue-400/30 text-[11px] font-semibold backdrop-blur-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                    title="View all tags in menu"
                  >
                    +{currentShort.tags.length - 2} tags
                  </button>
                )}
              </div>
            )}

            {/* Audio Title if exists */}
            {currentShort.audioTitle && (
              <div className="flex items-center gap-1.5 text-[10px] text-blue-300 truncate pt-0.5">
                <Music className="w-3 h-3 flex-shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="truncate">{currentShort.audioTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* --- 3. Right-Hand Action Buttons (Positioned AFTER overlay, z-50, vivid pure white, NO circular rings) --- */}
        <div className="absolute right-2.5 sm:right-3 bottom-5 z-50 flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto">
          {/* Views Count Indicator (Above Like Button) */}
          <div className="flex flex-col items-center select-none pointer-events-none">
            <div className="p-1 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </div>
            <span className="text-[10px] font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {currentShort.viewsCount.toLocaleString()}
            </span>
          </div>

          {/* Like Button (NO circular boundary ring, clean floating icon) */}
          <div className="flex flex-col items-center select-none">
            <button
              onClick={handleToggleLike}
              className="p-1 text-white transition-transform active:scale-125 flex items-center justify-center cursor-pointer hover:scale-110"
              title={isLiked ? "Unlike Short" : "Like Short"}
              aria-label={isLiked ? "Unlike Short" : "Like Short"}
            >
              <Heart
                className={`w-6.5 h-6.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors ${
                  isLiked ? 'fill-rose-500 text-rose-500 stroke-rose-500' : 'text-white stroke-[2.2]'
                }`}
              />
            </button>
            <span className="text-[10px] font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {currentShort.likesCount}
            </span>
          </div>

          {/* Saved Collection Button (Positioned directly BELOW Like button) */}
          <div className="flex flex-col items-center select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveShort(currentShort.id);
              }}
              className="p-1 text-white transition-transform active:scale-125 flex items-center justify-center cursor-pointer hover:scale-110"
              title={isSaved ? "Remove from Saved Collection" : "Save to Collection"}
              aria-label={isSaved ? "Remove from Saved Collection" : "Save to Collection"}
            >
              <Bookmark
                className={`w-6.5 h-6.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors ${
                  isSaved ? 'fill-amber-400 text-amber-400 stroke-amber-400' : 'text-white stroke-[2.2]'
                }`}
              />
            </button>
            <span className="text-[10px] font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </div>

          {/* Share Button (Vivid Pure White Icon, NO circular ring, NO grayish shadow) */}
          <div className="flex flex-col items-center select-none">
            <button
              onClick={handleOpenShare}
              className="p-1 text-white transition-transform active:scale-95 flex items-center justify-center cursor-pointer hover:scale-110"
              title="Share Deep Link"
              aria-label="Share Deep Link"
            >
              <Share2 className="w-6 h-6 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </button>
            <span className="text-[10px] font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5">
              {currentShort.sharesCount}
            </span>
          </div>

          {/* Three-Dot More Options Button (Vivid Pure White Icon, NO circular ring, NO grayish shadow) */}
          <div className="flex flex-col items-center select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen(true);
              }}
              className="p-1 text-white transition-transform active:scale-95 flex items-center justify-center cursor-pointer hover:scale-110"
              title="More Options"
              aria-label="More Options"
            >
              <MoreVertical className="w-6 h-6 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            </button>
          </div>
        </div>

        {/* --- 5. Thin Horizontal Progress Line --- */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-50 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200 ease-linear shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* --- Desktop Floating Up/Down Navigation Buttons beside the Reel --- */}
      <div className="hidden md:flex flex-col gap-3 ml-4 z-40">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-2xl ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          title="Previous Short (Arrow Up)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === feedShorts.length - 1}
          className={`p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 shadow-2xl ${
            currentIndex === feedShorts.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          title="Next Short (Arrow Down)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* --- Share Modal --- */}
      {sharingShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSharingShort(null)}
        >
          <div
            className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900">
                <Share2 className="w-4 h-4 text-[#002B7F]" />
                <span>Share Learning Short</span>
              </h3>
              <button
                onClick={() => setSharingShort(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Share this deep link with team members to open this 60-second Short directly:
            </p>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#002B7F] font-semibold truncate">
                {`https://jio.learn/s/${sharingShort.id}`}
              </span>
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold flex items-center gap-1 text-white flex-shrink-0 shadow-sm"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{shareCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setSharingShort(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Three-Dot More Options Action Sheet Modal --- */}
      {isMoreMenuOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/15 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-4 space-y-2 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2 sm:hidden" />

            <div className="space-y-1">
              {/* Save / Bookmark to Saved Collection */}
              <button
                onClick={() => toggleSaveShort(currentShort.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left font-semibold text-xs text-white"
              >
                <Bookmark className={`w-4 h-4 text-amber-400 ${savedShortIds.includes(currentShort.id) ? 'fill-amber-400' : ''}`} />
                <span>{savedShortIds.includes(currentShort.id) ? 'Remove from Saved Collection' : 'Save to Collection'}</span>
              </button>

              {/* View Saved Shorts */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  navigate(`/shorts/creator/${INITIAL_CREATORS['u_current'].id}?tab=saved`);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left font-semibold text-xs text-amber-300 hover:text-amber-200"
              >
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                <div className="flex flex-col">
                  <span>View Saved Shorts</span>
                  <span className="text-[10px] text-gray-400">Open saved collection in profile ({savedShortIds.length} shorts)</span>
                </div>
              </button>

              {/* Interested */}
              <button
                onClick={handleInterested}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left font-semibold text-xs text-white"
              >
                <ThumbsUp className="w-4 h-4 text-green-400" />
                <div className="flex flex-col">
                  <span>Interested</span>
                  <span className="text-[10px] text-gray-400">Show more shorts like this in my feed</span>
                </div>
              </button>

              {/* Not Interested */}
              <button
                onClick={handleNotInterested}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left font-semibold text-xs text-rose-300 hover:text-rose-200"
              >
                <ThumbsDown className="w-4 h-4 text-rose-400" />
                <div className="flex flex-col">
                  <span>Not Interested</span>
                  <span className="text-[10px] text-gray-400">Show fewer shorts like this topic</span>
                </div>
              </button>

              {/* Report Button */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setSelectedReportReason(REPORT_REASONS[0]);
                  setReportDetail('');
                  setIsReportModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/15 transition-colors text-left font-semibold text-xs text-red-400 hover:text-red-300 border-t border-white/10 pt-3 mt-1"
              >
                <Flag className="w-4 h-4 text-red-400" />
                <div className="flex flex-col">
                  <span className="font-bold">Report Content</span>
                  <span className="text-[10px] text-gray-400">Flag policy, spam, or guideline violation</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsMoreMenuOpen(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-gray-300 transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- Reel Tags Menu Modal --- */}
      {isTagsMenuOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsTagsMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/15 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-4 space-y-3 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-1 sm:hidden" />

            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Reel Learning Topics</h3>
                  <p className="text-[10px] text-gray-400">
                    {currentShort.tags.length} topic tag{currentShort.tags.length !== 1 ? 's' : ''} in this short
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTagsMenuOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 py-1 max-h-60 overflow-y-auto">
              {currentShort.tags.map(tag => {
                const cleanTag = tag.replace(/^#/, '');
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setIsTagsMenuOpen(false);
                      navigate(`/shorts/search?topic=${encodeURIComponent(cleanTag)}`);
                    }}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-xs text-white transition-all active:scale-95 shadow-xs cursor-pointer font-medium"
                  >
                    <span>{cleanTag}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsTagsMenuOpen(false)}
              className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-semibold text-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Report Content Drawer / Footer Menu (Fixed Header & Sticky Footer with Submit & Cancel Buttons) --- */}
      {isReportModalOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col max-h-[88vh] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Fixed Header (Always visible at top) */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Report Content</h3>
                  <p className="text-[11px] text-gray-400">Select policy violation reason and submit for audit</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Middle Body (Reasons + Optional Comments) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Select Reason ({REPORT_REASONS.length} violation policies)
                </p>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReportReason === reason;
                  return (
                    <label
                      key={reason}
                      onClick={() => setSelectedReportReason(reason)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-red-500/25 border-red-500 text-white font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs pr-2">{reason}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-red-400 bg-red-500' : 'border-gray-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Additional Comments (Optional) */}
              <div className="space-y-1 text-left pt-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Additional Comments <span className="font-normal text-gray-500 lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  placeholder="Provide any additional context for content moderation team..."
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none"
                />
              </div>
            </div>

            {/* 3. Sticky Footer with Submit and Cancel Buttons (ALWAYS 100% visible at bottom) */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 border-t border-white/15 bg-slate-900/95 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  shortsService.reportShort(
                    currentShort.id,
                    selectedReportReason,
                    reportDetail,
                    INITIAL_CREATORS['u_current']?.name || 'Learner'
                  );
                  setIsReportModalOpen(false);
                  showToast('🚩 Report submitted to content manager for audit. Thank you.');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl z-[99999] animate-fade-in-up border border-gray-700">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShortsViewer;
