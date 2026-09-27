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
  Hash,
  HelpCircle,
  Bell,
  BarChart3,
  CheckCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  FolderPlus,
  Folder,
  Lock,
  Globe
} from 'lucide-react';
import {
  ShortItem,
  shortsService,
  ShortsRecommendationConfig,
  INITIAL_CREATORS,
  REPORT_REASONS,
  ReportReasonType,
  ShortNotification,
  ShortDraft,
  ShortCollection
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
  const [isWhySeeingModalOpen, setIsWhySeeingModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [savedShortIds, setSavedShortIds] = useState<string[]>(() => shortsService.getSavedShortIds());
  const [userReactions, setUserReactions] = useState<Record<string, 'interested' | 'not_interested' | null>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Notifications State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<ShortNotification[]>(() => shortsService.getNotifications());
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Plus button draft check state
  const [isDraftPromptOpen, setIsDraftPromptOpen] = useState(false);
  const [latestDraft, setLatestDraft] = useState<ShortDraft | null>(null);

  useEffect(() => {
    const handleNotifsUpdate = () => {
      setNotifications(shortsService.getNotifications());
    };
    window.addEventListener('jio_shorts_notifications_updated', handleNotifsUpdate);
    return () => window.removeEventListener('jio_shorts_notifications_updated', handleNotifsUpdate);
  }, []);

  const handlePlusClick = () => {
    const drafts = shortsService.getDrafts();
    if (drafts.length > 0) {
      setLatestDraft(drafts[0]);
      setIsDraftPromptOpen(true);
    } else {
      navigate('/shorts/create');
    }
  };

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

  // Collections and Save Modal State
  const [isSaveCollectionModalOpen, setIsSaveCollectionModalOpen] = useState(false);
  const [collectionsList, setCollectionsList] = useState<ShortCollection[]>(() => shortsService.getCollections());
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColIsPrivate, setNewColIsPrivate] = useState(true);

  useEffect(() => {
    const handleCollectionsUpdate = () => {
      setCollectionsList(shortsService.getCollections());
      setSavedShortIds(shortsService.getSavedShortIds());
    };
    window.addEventListener('jio_shorts_collections_updated', handleCollectionsUpdate);
    window.addEventListener('jio_shorts_saved_updated', handleCollectionsUpdate);
    return () => {
      window.removeEventListener('jio_shorts_collections_updated', handleCollectionsUpdate);
      window.removeEventListener('jio_shorts_saved_updated', handleCollectionsUpdate);
    };
  }, []);

  const handleToggleCollectionSave = (collectionId: string) => {
    if (!currentShort) return;
    const isCurrentlyIn = shortsService.isShortInCollection(collectionId, currentShort.id);
    const col = collectionsList.find(c => c.id === collectionId);
    if (isCurrentlyIn) {
      shortsService.removeShortFromCollection(collectionId, currentShort.id);
      showToast(`Removed from "${col?.name || 'Collection'}"`);
    } else {
      shortsService.addShortToCollection(collectionId, currentShort.id);
      showToast(`🔖 Saved to "${col?.name || 'Collection'}"!`);
    }
    setCollectionsList(shortsService.getCollections());
    setSavedShortIds(shortsService.getSavedShortIds());
  };

  const handleCreateAndSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShort || !newColTitle.trim()) return;
    const newCol = shortsService.createCollection(
      newColTitle.trim(),
      newColDesc.trim() || undefined,
      newColIsPrivate
    );
    shortsService.addShortToCollection(newCol.id, currentShort.id);
    setCollectionsList(shortsService.getCollections());
    setSavedShortIds(shortsService.getSavedShortIds());
    setNewColTitle('');
    setNewColDesc('');
    setNewColIsPrivate(true);
    setIsCreatingCollection(false);
    showToast(`✨ Created "${newCol.name}" & saved reel!`);
  };

  const toggleSaveShort = (shortId: string) => {
    setIsSaveCollectionModalOpen(true);
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
    if (fromSource === 'saved') {
      const allSaved = shortsService.getSavedShorts();
      if (orderedShortIds && orderedShortIds.length > 0) {
        const idMap = new Map(allSaved.map(s => [s.id, s]));
        const ordered = orderedShortIds
          .map(id => idMap.get(id))
          .filter((s): s is ShortItem => !!s);
        if (ordered.length > 0) return ordered;
      }
      if (allSaved.length > 0) return allSaved;
    }
    const allApproved = shortsService.getApprovedShorts();
    if (orderedShortIds && orderedShortIds.length > 0) {
      const idMap = new Map(allApproved.map(s => [s.id, s]));
      const ordered = orderedShortIds
        .map(id => idMap.get(id))
        .filter((s): s is ShortItem => !!s);
      return ordered.length > 0 ? ordered : shortsService.getPersonalizedFeed();
    }
    return shortsService.getPersonalizedFeed();
  }, [config, orderedShortIds, fromSource]);

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
    shortsService.toggleLike(currentShort.id);
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

      {/* Desktop & Mobile Responsive Reels Layout */}
      <div className="flex items-center justify-center gap-6 lg:gap-10 w-full h-full max-w-6xl px-2 sm:px-6">
        
        {/* --- DESKTOP ONLY: Left Side Column (Plus/Back button, Creator Profile, Description, Tags) --- */}
        <div className="hidden md:flex flex-col justify-between w-72 lg:w-80 h-[640px] max-h-[85vh] py-2 text-left text-white shrink-0">
          {/* Top Left: Plus Button or Back Button */}
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
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-bold">Back</span>
              </button>
            ) : (
              <button
                onClick={handlePlusClick}
                className="p-3 rounded-2xl bg-[#002B7F] hover:bg-blue-800 text-white transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg"
                title="Create Learning Short"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
                <span className="text-xs font-extrabold tracking-wide">Create Short</span>
              </button>
            )}
          </div>

          {/* Bottom Left: Profile, Caption, Description & Tags */}
          <div className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-2xl">
            {/* Creator Profile */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate(`/shorts/creator/${currentShort.author.id}`)}
                className="cursor-pointer group flex items-center gap-3"
              >
                <img
                  src={currentShort.author.avatar || INITIAL_CREATORS['u_current'].avatar}
                  alt={currentShort.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-md group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {currentShort.author.name}
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    {currentShort.author.id === 'u_current' || currentShort.author.name.includes('Ajinkya') ? 'ajinkya4.patil' : `${currentShort.author.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.patil`}
                  </p>
                </div>
              </div>

              {!isOwnProfile && !isFollowingAuthor && (
                <button
                  onClick={handleToggleFollow}
                  className="ml-auto px-3 py-1.5 rounded-full bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </button>
              )}
            </div>

            {/* Caption & Description */}
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white leading-snug">{currentShort.title}</h4>
              {(currentShort.caption || currentShort.description) && (
                <p className="text-xs text-gray-300 leading-relaxed max-h-28 overflow-y-auto pr-1">
                  {currentShort.caption || currentShort.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {currentShort.tags && currentShort.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentShort.tags.map((rawTag) => {
                  const cleanTag = rawTag.replace(/^#/, '');
                  return (
                    <button
                      key={cleanTag}
                      onClick={() => navigate(`/shorts/search?topic=${encodeURIComponent(cleanTag)}`)}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-blue-200 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      {cleanTag}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Audio */}
            {currentShort.audioTitle && (
              <div className="flex items-center gap-2 text-xs text-blue-300 pt-1">
                <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="truncate">{currentShort.audioTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* --- CENTER: Main Reel Viewport Container (9:16 Aspect Ratio) --- */}
        <div
          className="relative w-full h-full max-w-[430px] md:max-w-[390px] h-[640px] md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col justify-between shrink-0"
        >
          {/* Top Bar Overlay (MOBILE ONLY: md:hidden) */}
          <div className="absolute top-0 inset-x-0 z-40 p-3.5 pt-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-auto md:hidden">
            <div>
              {fromSource ? (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-white hover:opacity-80 transition-all active:scale-95 flex items-center justify-center group"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
              ) : (
                <button
                  onClick={handlePlusClick}
                  className="p-2 text-white hover:opacity-80 transition-all active:scale-95 flex items-center justify-center group"
                >
                  <Plus className="w-7 h-7 stroke-[2.5] text-white" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/shorts/search')}
                className="p-2 text-white hover:text-white/80 transition-all active:scale-90 cursor-pointer"
              >
                <Search className="w-5 h-5 text-white stroke-[2.2]" />
              </button>

              <button
                onClick={() => navigate(`/shorts/creator/${INITIAL_CREATORS['u_current'].id}`)}
                className="p-2 text-white hover:text-white/80 transition-all active:scale-90 cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <User className="w-5 h-5 text-white stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Main Media Screen (Video / Carousel / Photo) */}
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

            {/* Pause & Mute Overlay */}
            {!isPlaying && !showDoubleTapHeart && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-black/30 transition-all gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="pointer-events-auto p-2.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 shadow-xl flex items-center justify-center transition-all active:scale-95 animate-scale-up"
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

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

          {/* Bottom Info Overlay (MOBILE ONLY: md:hidden) */}
          <div className="absolute bottom-1 inset-x-0 z-30 p-4 pb-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none md:hidden">
            <div className="max-w-[78%] space-y-2 pointer-events-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  onClick={() => navigate(`/shorts/creator/${currentShort.author.id}`)}
                  className="flex items-center gap-2 cursor-pointer group max-w-full"
                >
                  <img
                    src={currentShort.author.avatar || INITIAL_CREATORS['u_current'].avatar}
                    alt={currentShort.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/40 shadow-md"
                  />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">{currentShort.author.name}</span>
                </div>
              </div>

              <p className="text-xs text-white leading-snug drop-shadow line-clamp-2">
                {currentShort.caption || currentShort.title}
              </p>

              {currentShort.tags && currentShort.tags.length > 0 && (
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  {currentShort.tags.slice(0, 2).map((rawTag) => {
                    const cleanTag = rawTag.replace(/^#/, '');
                    return (
                      <span key={cleanTag} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium">
                        {cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right-Hand Action Buttons (MOBILE ONLY: md:hidden) */}
          <div className="absolute right-3 bottom-8 z-50 flex flex-col items-center gap-3 pointer-events-auto md:hidden">
            <button onClick={handleToggleLike} className="p-1 text-white flex items-center justify-center">
              <Heart className={`w-6.5 h-6.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
            <button onClick={handleOpenShare} className="p-1 text-white flex items-center justify-center">
              <Share2 className="w-6.5 h-6.5 text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleSaveShort(currentShort.id); }} className="p-1 text-white flex items-center justify-center">
              <Bookmark className={`w-6.5 h-6.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(true); }} className="p-1 text-white flex items-center justify-center">
              <MoreVertical className="w-6.5 h-6.5 text-white" />
            </button>
          </div>

          {/* Progress Line */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-50 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200 ease-linear shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* --- DESKTOP ONLY: Right Side Column (Search, Profile, Action Buttons: Heart, Share, Save, Three-Dots) --- */}
        <div className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-[640px] max-h-[85vh] py-2 text-white shrink-0">
          {/* Top Right: Search & Profile Icons (NO Notification Icon) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/shorts/search')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-md"
              title="Search Learning Shorts"
            >
              <Search className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => navigate(`/shorts/creator/${INITIAL_CREATORS['u_current'].id}`)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-md"
              title="My Reels Profile"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Action Buttons Column: Heart, Share, Save, Three Dots */}
          <div className="space-y-5 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-2xl">
            {/* Heart (Like) Button */}
            <button
              onClick={handleToggleLike}
              className="flex items-center gap-3.5 group cursor-pointer w-full text-left"
            >
              <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-rose-500/20 text-white transition-all group-hover:scale-110">
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </div>
              <div>
                <span className="text-xs font-bold block">{currentShort.likesCount}</span>
                <span className="text-[10px] text-gray-400">Likes</span>
              </div>
            </button>

            {/* Share Button */}
            <button
              onClick={handleOpenShare}
              className="flex items-center gap-3.5 group cursor-pointer w-full text-left"
            >
              <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-blue-500/20 text-white transition-all group-hover:scale-110">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold block">{currentShort.sharesCount}</span>
                <span className="text-[10px] text-gray-400">Shares</span>
              </div>
            </button>

            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveShort(currentShort.id);
              }}
              className="flex items-center gap-3.5 group cursor-pointer w-full text-left"
            >
              <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-amber-500/20 text-white transition-all group-hover:scale-110">
                <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
              </div>
              <div>
                <span className="text-xs font-bold block">{isSaved ? 'Saved' : 'Save'}</span>
                <span className="text-[10px] text-gray-400">Collections</span>
              </div>
            </button>

            {/* Three Dots Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreMenuOpen(true);
              }}
              className="flex items-center gap-3.5 group cursor-pointer w-full text-left"
            >
              <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 text-white transition-all group-hover:scale-110">
                <MoreVertical className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold block">More</span>
                <span className="text-[10px] text-gray-400">Options</span>
              </div>
            </button>

            {/* Up & Down Navigation */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className={`flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center cursor-pointer ${
                  currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                title="Previous Reel"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === feedShorts.length - 1}
                className={`flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center cursor-pointer ${
                  currentIndex === feedShorts.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                title="Next Reel"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

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
              {/* View Analytics (Shown for author's own short) */}
              {(isOwnProfile || fromSource === 'profile') && (
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsAnalyticsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 transition-colors text-left font-semibold text-xs text-blue-300 border border-blue-500/30 mb-1 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white">View Analytics</span>
                    <span className="text-[10px] text-gray-300">Views, completion rate, engagement & retention</span>
                  </div>
                </button>
              )}

              {/* Why am I seeing this post? */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsWhySeeingModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left font-semibold text-xs text-white"
              >
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex flex-col">
                  <span>Why am I seeing this post?</span>
                  <span className="text-[10px] text-gray-400">Recommendation based on role, interests & behavior</span>
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

      {/* --- Why Am I Seeing This Post Explanation Modal --- */}
      {isWhySeeingModalOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsWhySeeingModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Why am I seeing this post?</h3>
                  <p className="text-[10px] text-gray-400">Recommendation Transparency</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhySeeingModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <p className="text-white font-medium">
                This short is shown as per the platform recommendation basis:
              </p>

              <div className="space-y-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Employee Role: </span>
                    <span className="text-gray-300">Recommended for your job function and developmental competencies ({currentShort.author.role || 'Enterprise Tech'}).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Employee Platform Interest: </span>
                    <span className="text-gray-300">Topics matched with your skills and tags ({currentShort.tags.map(t => t.replace('#', '')).slice(0, 3).join(', ') || 'General Knowledge'}).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">User Behavior on Platform: </span>
                    <span className="text-gray-300">Based on reels you watch, like, and engage with across your sessions.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsWhySeeingModalOpen(false)}
              className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* --- Save to Collection Modal Bottom Sheet --- */}
      {isSaveCollectionModalOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => {
            setIsSaveCollectionModalOpen(false);
            setIsCreatingCollection(false);
          }}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-sm w-full flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Draggable Handle Bar (No cross button per requirements) */}
            <div
              className="pt-3 pb-1 cursor-pointer flex justify-center bg-slate-900 flex-shrink-0"
              onClick={() => {
                setIsSaveCollectionModalOpen(false);
                setIsCreatingCollection(false);
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
            </div>

            {/* Header: Title and small New Collection button on top right */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Save to Collection</h3>
              </div>

              {!isCreatingCollection && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(true)}
                  className="px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-400/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New collection</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isCreatingCollection ? (
                /* Inline Collection Creation Form (Title + Privacy only, NO description per requirements) */
                <form onSubmit={handleCreateAndSaveCollection} className="space-y-3.5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Collection Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newColTitle}
                      onChange={(e) => setNewColTitle(e.target.value)}
                      placeholder="e.g. System Design, AI Tutorials"
                      className="w-full px-3.5 py-2 bg-black/50 border border-white/20 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5">
                      Privacy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewColIsPrivate(true)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          newColIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-400 shadow-xs'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewColIsPrivate(false)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          !newColIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-400 shadow-xs'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Public</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newColTitle.trim()}
                      className="px-4 py-2 bg-[#002B7F] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Create & Save</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Collections List (Only thumbnail, name of collection, checkmark indicator. NO number of items, NO default tag) */
                <div className="space-y-1.5">
                  {collectionsList.map((col) => {
                    const isIncluded = col.shortIds.includes(currentShort.id);
                    // Get latest reel thumbnail in this collection
                    const colShorts = col.shortIds
                      .map(id => shortsService.getAllShorts().find(s => s.id === id))
                      .filter((s): s is ShortItem => !!s);
                    const latestShort = colShorts[0];
                    const thumb = latestShort?.thumbnailUrl || latestShort?.mediaUrls[0] || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={col.id}
                        onClick={() => handleToggleCollectionSave(col.id)}
                        className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-98 text-left ${
                          isIncluded
                            ? 'bg-amber-500/15 border-l-2 border-amber-400'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-white/10">
                            <img
                              src={thumb}
                              alt={col.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Collection Name Only (NO item count, NO default tag) */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">
                              {col.name}
                            </h4>
                          </div>
                        </div>

                        {/* Checkmark Indicator */}
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isIncluded
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'border border-white/20 text-transparent'
                          }`}
                        >
                          {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSaveCollectionModalOpen(false);
                  setIsCreatingCollection(false);
                }}
                className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-gray-300 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
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

      {/* --- Plus Button Draft Continuation Modal Prompt --- */}
      {isDraftPromptOpen && latestDraft && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsDraftPromptOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Continue Saved Draft?</h3>
                  <p className="text-[10px] text-gray-400">You have an unfinished learning short</p>
                </div>
              </div>
              <button
                onClick={() => setIsDraftPromptOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-12 h-16 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/20 relative">
                {latestDraft.mediaUrls[0] && latestDraft.mediaType === 'video' ? (
                  <video src={latestDraft.mediaUrls[0]} className="w-full h-full object-cover" />
                ) : (
                  <img src={latestDraft.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                )}
                <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-[8px] font-mono text-white rounded">
                  {latestDraft.durationSeconds || 15}s
                </span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h4 className="text-xs font-bold text-white truncate">
                  {latestDraft.title || 'Untitled Draft Reel'}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {latestDraft.clipsCount || 1} {latestDraft.mediaType === 'video' ? 'clip(s)' : 'photo(s)'} • Saved {new Date(latestDraft.updatedAt).toLocaleDateString()}
                </p>
                <span className="inline-block px-1.5 py-0.5 mt-1 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">
                  Draft
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsDraftPromptOpen(false);
                  navigate(`/shorts/create?draftId=${latestDraft.id}`);
                }}
                className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue with Last Draft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsDraftPromptOpen(false);
                  navigate('/shorts/create');
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
              >
                Create New Short
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Reel Analytics Modal (Three Dots Menu -> View Analytics) --- */}
      {isAnalyticsModalOpen && currentShort && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAnalyticsModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reel Analytics</h3>
                  <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{currentShort.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Views</span>
                <p className="text-base font-extrabold text-white mt-0.5">{currentShort.viewsCount}</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Likes</span>
                <p className="text-base font-extrabold text-rose-400 mt-0.5">{currentShort.likesCount}</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Shares</span>
                <p className="text-base font-extrabold text-blue-400 mt-0.5">{currentShort.sharesCount}</p>
              </div>
            </div>

            {/* Engagement & Completion */}
            <div className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Completion Rate</span>
                <span className="font-bold text-emerald-400">86%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-300 font-medium">Avg Watch Time</span>
                <span className="font-bold text-white">14.8s / {currentShort.durationSeconds || 15}s</span>
              </div>
            </div>

            {/* Audience Demographics */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Viewer Demographics</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Engineering & Architecture</span>
                  <span className="font-bold text-white">52%</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Product Management</span>
                  <span className="font-bold text-white">26%</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Platform Operations</span>
                  <span className="font-bold text-white">22%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAnalyticsModalOpen(false)}
              className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- User Notifications Modal Drawer --- */}
      {isNotificationModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsNotificationModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/20 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-gray-400">Likes, follows, moderation & approvals</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={() => {
                      shortsService.markAllNotificationsRead();
                      setNotifications(shortsService.getNotifications());
                      showToast('✅ All marked as read');
                    }}
                    className="p-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Endless Scroll of Notifications List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bell className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-xs font-semibold text-gray-300">No notifications yet</p>
                  <p className="text-[10px] text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        shortsService.markNotificationRead(notif.id);
                        setNotifications(shortsService.getNotifications());
                        if (notif.reelId) {
                          setIsNotificationModalOpen(false);
                          navigate(`/shorts?short=${notif.reelId}`);
                        }
                      }}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                        !notif.read ? 'bg-white/10 border border-white/15' : 'bg-transparent hover:bg-white/5'
                      }`}
                    >
                      {/* Icon per type */}
                      <div className="flex-shrink-0 mt-0.5">
                        {notif.type === 'like' && (
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <Heart className="w-4 h-4 fill-current" />
                          </div>
                        )}
                        {notif.type === 'follow' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <UserPlus className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'approved' && (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'submitted' && (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'rejected' && (
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <Flag className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug mt-0.5">{notif.message}</p>
                        {notif.reelTitle && (
                          <span className="inline-block mt-1 text-[10px] text-blue-400 font-semibold underline truncate max-w-full">
                            Watch reel: {notif.reelTitle}
                          </span>
                        )}
                      </div>

                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900 flex-shrink-0">
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-gray-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification (Centered in the middle of the screen) */}
      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-2xl shadow-2xl z-[99999] animate-scale-up border border-white/20 pointer-events-none text-center max-w-xs">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShortsViewer;
