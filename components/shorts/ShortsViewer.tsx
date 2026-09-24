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
  Film
} from 'lucide-react';
import {
  ShortItem,
  shortsService,
  ShortsRecommendationConfig
} from '../../services/shortsService';

interface ShortsViewerProps {
  initialShortId?: string;
  orderedShortIds?: string[];
}

export const ShortsViewer: React.FC<ShortsViewerProps> = ({
  initialShortId,
  orderedShortIds
}) => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 600) return;

    if (e.deltaY > 35) {
      lastWheelTimeRef.current = now;
      goToNext();
    } else if (e.deltaY < -35) {
      lastWheelTimeRef.current = now;
      goToPrev();
    }
  };

  // Touch handlers for swipe up/down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - endY;

    if (diffY > 40) {
      goToNext();
    } else if (diffY < -40) {
      goToPrev();
    }
    touchStartY.current = null;
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
          {/* Top-Left: Plus Icon (Always shown on every reel) */}
          <div>
            <button
              onClick={() => navigate('/shorts/create')}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/20 flex items-center justify-center group"
              title="Create Learning Short"
              aria-label="Create Learning Short"
            >
              <Plus className="w-5 h-5 stroke-[2.5] text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Top-Right: Search Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shorts/search')}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all active:scale-95 border border-white/10"
              title="Search Learning Shorts"
              aria-label="Search Learning Shorts"
            >
              <Search className="w-5 h-5" />
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

              {/* Carousel Slide Indicators */}
              <div className="absolute top-16 inset-x-0 z-30 flex items-center justify-center gap-1.5 px-6">
                {currentShort.mediaUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselPhotoIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      carouselPhotoIndex === idx
                        ? 'w-8 bg-white shadow-md'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

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

          {/* Centered Pause Indicator Icon */}
          {!isPlaying && !showDoubleTapHeart && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/25 transition-all">
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

        {/* --- 3. Right-Hand Action Buttons (Like, Share, Sound - Positioned Lower) --- */}
        <div className="absolute right-3 bottom-5 z-40 flex flex-col items-center gap-3">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleToggleLike}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-xl ${
                isLiked
                  ? 'bg-rose-600 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              title="Like Short (or Double Tap Video)"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
              {currentShort.likesCount}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleOpenShare}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 shadow-xl"
              title="Share Deep Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
              {currentShort.sharesCount}
            </span>
          </div>

          {/* Sound / Mute Button (Positioned cleanly below share with tight spacing) */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-xl ${
                isMuted ? 'bg-amber-500/90 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="text-[8px] font-bold text-gray-300 drop-shadow mt-0.5 uppercase">
              {isMuted ? 'Muted' : 'Sound'}
            </span>
          </div>
        </div>

        {/* --- 4. Bottom Info Overlay (Constrained width, inline view more, carousel topics) --- */}
        <div className="absolute bottom-1 inset-x-0 z-40 p-4 pb-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none">
          {/* Main content column constrained to max 78% width to never collide with right buttons */}
          <div className="max-w-[78%] space-y-2 pointer-events-auto">
            {/* Creator Profile Link */}
            <div
              onClick={() => navigate(`/shorts/creator/${currentShort.author.id}`)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                src={currentShort.author.avatar}
                alt={currentShort.author.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-400 group-hover:scale-105 transition-transform shadow-md flex-shrink-0"
              />
              <div className="text-left overflow-hidden">
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 flex items-center gap-1.5 transition-colors truncate">
                  <span className="truncate">{currentShort.author.name}</span>
                  <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                    Creator
                  </span>
                </div>
                <div className="text-[10px] text-gray-300 truncate">
                  {currentShort.author.role}
                </div>
              </div>
            </div>

            {/* Short Title */}
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow line-clamp-2">
                {currentShort.title}
              </h3>
            </div>

            {/* Expandable Description (Inline "View more" / "View less" in the exact SAME LINE) */}
            {currentShort.description && (
              <div className="text-left">
                <p className="text-[11px] text-gray-200 leading-relaxed drop-shadow">
                  <span>
                    {isDescriptionExpanded
                      ? currentShort.description
                      : currentShort.description.slice(0, 65) + (currentShort.description.length > 65 ? '...' : '')}
                  </span>
                  {currentShort.description.length > 65 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded(!isDescriptionExpanded);
                      }}
                      className="inline font-bold text-blue-300 hover:text-blue-200 underline ml-1.5 cursor-pointer"
                    >
                      {isDescriptionExpanded ? 'View less' : 'View more'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Topics / Tags as a Carousel (Single Line, Horizontally Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
              {currentShort.tags.map(tag => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shorts/search`);
                  }}
                  className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-mono px-2 py-0.5 rounded-full cursor-pointer transition-colors backdrop-blur-xs flex-shrink-0"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Audio Title if exists */}
            {currentShort.audioTitle && (
              <div className="flex items-center gap-1.5 text-[10px] text-blue-300 truncate pt-0.5">
                <Music className="w-3 h-3 flex-shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="truncate">{currentShort.audioTitle}</span>
              </div>
            )}
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
