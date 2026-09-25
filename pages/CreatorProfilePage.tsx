import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  UserPlus,
  UserCheck,
  Film,
  Play,
  Layers,
  Edit3,
  Check,
  Grid3X3,
  Bookmark,
  BarChart3,
  Contact,
  Sparkles,
  Eye,
  Clock,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import {
  ShortAuthor,
  ShortItem,
  shortsService,
  INITIAL_CREATORS
} from '../services/shortsService';

type ProfileTab = 'shorts' | 'saved' | 'analytics' | 'about';

export const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [creator, setCreator] = useState<ShortAuthor | null>(null);
  const [creatorShorts, setCreatorShorts] = useState<ShortItem[]>([]);
  const [savedShorts, setSavedShorts] = useState<ShortItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const initialTabParam = searchParams.get('tab') as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    initialTabParam && ['shorts', 'saved', 'analytics', 'about'].includes(initialTabParam)
      ? initialTabParam
      : 'shorts'
  );

  // Edit Bio state (Learner can ONLY change description / bio inline)
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBio, setEditBio] = useState('');

  const loadCreatorData = () => {
    if (!creatorId) return;

    const result = shortsService.getShortsByCreator(creatorId);
    if (result) {
      setCreator(result.author);
      setCreatorShorts(result.shorts);
      setEditBio(result.author.bio);
    } else {
      const fallback = INITIAL_CREATORS[creatorId];
      if (fallback) {
        setCreator(fallback);
        setCreatorShorts(shortsService.getApprovedShorts().filter(s => s.author.id === creatorId));
        setEditBio(fallback.bio);
      }
    }

    setSavedShorts(shortsService.getSavedShorts());
    setIsFollowing(shortsService.isFollowingCreator(creatorId));
    setFollowersCount(shortsService.getCreatorFollowersCount(creatorId));
  };

  useEffect(() => {
    loadCreatorData();
  }, [creatorId]);

  useEffect(() => {
    const handleSavedUpdated = () => {
      setSavedShorts(shortsService.getSavedShorts());
    };
    window.addEventListener('jio_shorts_saved_updated', handleSavedUpdated);
    window.addEventListener('jio_shorts_updated', handleSavedUpdated);
    return () => {
      window.removeEventListener('jio_shorts_saved_updated', handleSavedUpdated);
      window.removeEventListener('jio_shorts_updated', handleSavedUpdated);
    };
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ProfileTab | null;
    if (tabParam && ['shorts', 'saved', 'analytics', 'about'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleToggleFollow = () => {
    if (!creatorId) return;
    const res = shortsService.toggleFollowCreator(creatorId);
    setIsFollowing(res.isFollowing);
    setFollowersCount(res.followersCount);
  };

  const handlePlayShort = (shortId: string) => {
    navigate(`/shorts?short=${shortId}&from=profile`);
  };

  const handleRemoveSaved = (e: React.MouseEvent, shortId: string) => {
    e.stopPropagation();
    shortsService.toggleSaveShort(shortId);
    setSavedShorts(shortsService.getSavedShorts());
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorId || !creator) return;

    shortsService.updateCreatorProfile(creatorId, {
      bio: editBio.trim()
    });

    setCreator(prev => prev ? {
      ...prev,
      bio: editBio.trim()
    } : null);

    setIsEditingBio(false);
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-xl font-bold">Creator Profile Not Found</h2>
        <button
          onClick={() => navigate('/shorts')}
          className="px-5 py-2.5 bg-[#002B7F] rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shorts</span>
        </button>
      </div>
    );
  }

  const isCurrentLearner = creatorId === 'u_current' || creator.name.includes('Learner') || creator.name.includes('You');

  // Creator Analytics Calculations
  const totalViews = creatorShorts.reduce((acc, s) => acc + (s.viewsCount || 0), isCurrentLearner ? 24850 : 15200);
  const viewsGoal = 30000;
  const viewsGoalPercent = Math.min(100, Math.round((totalViews / viewsGoal) * 100));

  const totalLikes = creatorShorts.reduce((acc, s) => acc + (s.likesCount || 0), isCurrentLearner ? 3420 : 1850);
  const completionRate = 88.4;
  const engagementRate = 16.2;
  const watchHours = 432.5;
  const watchHoursGoal = 500;
  const watchHoursPercent = Math.min(100, Math.round((watchHours / watchHoursGoal) * 100));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-1 sm:pt-3">
      <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4">
        {/* Main Creator Profile Card with Minimal Space Waste */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs">
          {/* Back button directly above profile circle photo with minimal space (Less-than icon) */}
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => navigate('/shorts')}
              className="p-1.5 -ml-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all active:scale-95 flex items-center justify-center shadow-2xs group"
              title="Back to Shorts"
              aria-label="Back to Shorts"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Profile Section: Avatar on Left, Name & Actions on Right */}
          <div className="flex items-start gap-3.5">
            {/* Left: Compact Profile Picture */}
            <div className="relative shrink-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#002B7F]/20 ring-2 ring-white shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 p-1 bg-[#002B7F] text-white rounded-full shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Right: Info, Name, Counters & Follow Button Below */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Name & Role */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight">
                    {creator.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                    <span className="truncate">{creator.role}</span>
                    <span>•</span>
                    <span className="truncate">{creator.department}</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters (Do NOT show saved count when viewing own profile) */}
              <div className="flex items-center gap-4 text-xs pt-0.5">
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900">{creatorShorts.length}</span>
                  <span className="text-gray-500 ml-1">Shorts</span>
                </div>
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900">{followersCount}</span>
                  <span className="text-gray-500 ml-1">Followers</span>
                </div>
              </div>

              {/* Follow Button: Placed BELOW the numbers of shorts and followers */}
              {!isCurrentLearner && (
                <div className="pt-1">
                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-[#002B7F] text-white hover:bg-blue-800 active:scale-95'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio / Description Box with Inline Editing directly in this box */}
          <div className="mt-2.5 bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-200 text-left transition-all">
            {isEditingBio ? (
              <form onSubmit={handleSaveBio} className="space-y-2">
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Add your description or technical expertise..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-[#002B7F] rounded-lg text-xs text-gray-900 focus:outline-none resize-none leading-relaxed shadow-2xs"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditBio(creator.bio);
                      setIsEditingBio(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#002B7F] hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-gray-700 leading-relaxed flex-1">
                  {creator.bio || 'Creator has not added a description yet.'}
                </p>

                {isCurrentLearner && (
                  <button
                    onClick={() => {
                      setEditBio(creator.bio);
                      setIsEditingBio(true);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-gray-500 hover:text-[#002B7F] border border-gray-200 shadow-2xs transition-colors shrink-0"
                    title="Edit Description"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submenu Navigation - STRICTLY ICONS ONLY (No text labels) */}
        <div className="mt-3">
          <div className={`grid ${isCurrentLearner ? 'grid-cols-4' : 'grid-cols-2'} bg-white rounded-xl p-1 border border-gray-200 shadow-2xs`}>
            {/* Tab 1: Published Shorts */}
            <button
              onClick={() => setActiveTab('shorts')}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center ${
                activeTab === 'shorts'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Published Shorts"
              aria-label="Published Shorts"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>

            {/* Tab 2: Saved Shorts Collection (Own Profile Only) */}
            {isCurrentLearner && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2.5 rounded-lg transition-all flex items-center justify-center relative ${
                  activeTab === 'saved'
                    ? 'bg-[#002B7F] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Saved Shorts Collection"
                aria-label="Saved Shorts Collection"
              >
                <Bookmark className={`w-5 h-5 ${activeTab === 'saved' ? 'fill-white' : ''}`} />
                {savedShorts.length > 0 && (
                  <span className={`absolute top-1.5 right-3 w-2 h-2 rounded-full ${
                    activeTab === 'saved' ? 'bg-amber-300' : 'bg-[#002B7F]'
                  }`} />
                )}
              </button>
            )}

            {/* Tab 3: Creator Analytics (Own Profile Only) */}
            {isCurrentLearner && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2.5 rounded-lg transition-all flex items-center justify-center ${
                  activeTab === 'analytics'
                    ? 'bg-[#002B7F] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Creator Analytics"
                aria-label="Creator Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            )}

            {/* Tab 4: About / Professional Profile */}
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center ${
                activeTab === 'about'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="About & Experience"
              aria-label="About & Experience"
            >
              <Contact className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PUBLISHED SHORTS GRID */}
          {/* ========================================================================= */}
          {activeTab === 'shorts' && (
            <div className="mt-2">
              {creatorShorts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-xs space-y-2">
                  <Film className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">No published shorts yet</p>
                  <p className="text-[11px] text-gray-500">
                    This creator hasn't published any learning shorts yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                  {creatorShorts.map(short => (
                    <div
                      key={short.id}
                      onClick={() => handlePlayShort(short.id)}
                      className="group relative aspect-[3/4] bg-gray-950 overflow-hidden cursor-pointer transition-transform active:scale-[0.98]"
                    >
                      {/* Thumbnail Media */}
                      {short.mediaType === 'video' ? (
                        <video
                          src={short.mediaUrls[0]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={short.mediaUrls[0]}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Format Badge */}
                      <div className="absolute top-1 right-1 z-10 drop-shadow-md">
                        {short.mediaType === 'video' ? (
                          <Film className="w-3.5 h-3.5 text-white drop-shadow" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 text-white drop-shadow" />
                        )}
                      </div>

                      {/* Dark Overlay with Title & Stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-70 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-1.5 text-white">
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2 drop-shadow mb-0.5">
                          {short.title}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-gray-300 drop-shadow">
                          <span className="font-mono text-gray-200 truncate max-w-[55px]">{short.tags[0]}</span>
                          <span className="text-gray-200 font-semibold">{short.likesCount} ❤️</span>
                        </div>
                      </div>

                      {/* Center Play Icon on Hover */}
                      <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-[#002B7F] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-[#002B7F] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SAVED SHORTS COLLECTION */}
          {/* ========================================================================= */}
          {activeTab === 'saved' && (
            <div className="mt-2 space-y-2">
              <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                    <Bookmark className="w-4 h-4 fill-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Saved Shorts Collection</h3>
                    <p className="text-[11px] text-gray-500">
                      {savedShorts.length} {savedShorts.length === 1 ? 'learning short bookmarked' : 'learning shorts bookmarked'}
                    </p>
                  </div>
                </div>
              </div>

              {savedShorts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">Your collection is empty</p>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                      Tap the bookmark icon on any learning short to save it for quick access here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                  {savedShorts.map(short => (
                    <div
                      key={short.id}
                      onClick={() => handlePlayShort(short.id)}
                      className="group relative aspect-[3/4] bg-gray-950 overflow-hidden cursor-pointer transition-transform active:scale-[0.98]"
                    >
                      {/* Thumbnail Media */}
                      {short.mediaType === 'video' ? (
                        <video
                          src={short.mediaUrls[0]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={short.mediaUrls[0]}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Remove Bookmark Button (Top Right) */}
                      <button
                        onClick={(e) => handleRemoveSaved(e, short.id)}
                        className="absolute top-1 right-1 z-20 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-xs transition-colors"
                        title="Remove from saved collection"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Format Badge */}
                      <div className="absolute top-1 left-1 z-10 drop-shadow-md">
                        {short.mediaType === 'video' ? (
                          <Film className="w-3.5 h-3.5 text-white drop-shadow" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 text-white drop-shadow" />
                        )}
                      </div>

                      {/* Dark Overlay with Title & Stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-1.5 text-white">
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2 drop-shadow mb-0.5">
                          {short.title}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-gray-300 drop-shadow">
                          <span className="font-mono text-gray-200 truncate max-w-[55px]">{short.tags[0]}</span>
                          <span className="text-gray-200 font-semibold">{short.likesCount} ❤️</span>
                        </div>
                      </div>

                      {/* Center Play Icon on Hover */}
                      <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-[#002B7F] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-[#002B7F] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CREATOR ANALYTICS (Metrics with Gray Progress Bars & Numbers) */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="mt-2 space-y-3">
              {/* 4 Core Metrics Grid with Numbers & Neutral Gray Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Metric 1: Total Views vs Monthly Goal */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Total Views</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700">{viewsGoalPercent}%</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-lg font-extrabold text-gray-900">{totalViews.toLocaleString()}</span>
                      <span className="text-gray-400 text-[11px]">Goal: {viewsGoal.toLocaleString()}</span>
                    </div>
                    {/* Visual Progress Bar - Neutral Gray */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${viewsGoalPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metric 2: Completion & Retention Rate */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Completion Rate</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700">{completionRate}%</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-lg font-extrabold text-gray-900">{completionRate}%</span>
                      <span className="text-gray-400 text-[11px]">Target: 80%</span>
                    </div>
                    {/* Visual Progress Bar - Neutral Gray */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metric 3: Learner Engagement */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Engagement Score</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700">{engagementRate}%</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-lg font-extrabold text-gray-900">{engagementRate}%</span>
                      <span className="text-gray-400 text-[11px]">{totalLikes} Likes & Saves</span>
                    </div>
                    {/* Visual Progress Bar - Neutral Gray */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, engagementRate * 5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metric 4: Watch Hours */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Watch Time</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700">{watchHoursPercent}%</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-lg font-extrabold text-gray-900">{watchHours} hrs</span>
                      <span className="text-gray-400 text-[11px]">Milestone: {watchHoursGoal} hrs</span>
                    </div>
                    {/* Visual Progress Bar - Neutral Gray */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gray-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${watchHoursPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic Skill Category Penetration Progress Bars - Neutral Gray, No Hashtags */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center justify-between">
                  <span>Topic Penetration & Learner Reach</span>
                  <span className="text-[11px] text-gray-500 font-normal">By skill discipline</span>
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">CloudArchitecture & Kubernetes</span>
                      <span className="font-extrabold text-gray-700">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gray-500 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">GenAI & LLM Fine-Tuning</span>
                      <span className="font-extrabold text-gray-700">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gray-500 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">SystemDesign & Microservices</span>
                      <span className="font-extrabold text-gray-700">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gray-500 h-full rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">SecurityCompliance & IAM</span>
                      <span className="font-extrabold text-gray-700">64%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gray-500 h-full rounded-full" style={{ width: '64%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ABOUT & EXPERIENCE */}
          {/* ========================================================================= */}
          {activeTab === 'about' && (
            <div className="mt-2 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-1">Professional Summary</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {creator.bio || 'No summary provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-100">
                {/* 1. Business Unit */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Business Unit</span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block">{creator.department}</span>
                </div>

                {/* 2. Job Role */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Job Role</span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block">{creator.role}</span>
                </div>

                {/* 3. Job Position */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Job Position</span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block">Senior Lead Specialist</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfilePage;
