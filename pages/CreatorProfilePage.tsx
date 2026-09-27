import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Trash2,
  Camera,
  Upload,
  X,
  User,
  Image as ImageIcon,
  FileText,
  MoreVertical,
  Folder,
  FolderPlus,
  Lock,
  Globe,
  Plus,
  Bell,
  Share2,
  Copy
} from 'lucide-react';
import {
  ShortAuthor,
  ShortItem,
  ShortDraft,
  ShortCollection,
  shortsService,
  INITIAL_CREATORS
} from '../services/shortsService';

type ProfileTab = 'shorts' | 'saved' | 'analytics' | 'about';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80'
];

export const CreatorProfilePage: React.FC = () => {
  const { creatorId: routeCreatorId, collectionId } = useParams<{ creatorId?: string; collectionId?: string }>();
  const creatorId = routeCreatorId || 'u_current';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [creator, setCreator] = useState<ShortAuthor | null>(null);
  const [creatorShorts, setCreatorShorts] = useState<ShortItem[]>([]);
  const [savedShorts, setSavedShorts] = useState<ShortItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Selected reel for Analytics view
  const [selectedShortForAnalytics, setSelectedShortForAnalytics] = useState<ShortItem | null>(null);
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);

  const initialTabParam = searchParams.get('tab') as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    collectionId || (initialTabParam && ['shorts', 'saved', 'analytics', 'about'].includes(initialTabParam))
      ? 'saved'
      : (initialTabParam as ProfileTab) || 'shorts'
  );

  // Profile Edit States (Username, Description, and Profile Photo)
  const [isEditingProfileView, setIsEditingProfileView] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Collections State in Saved Tab
  const [collections, setCollections] = useState<ShortCollection[]>(() => shortsService.getCollections());
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(collectionId || null);
  const [isShareCollectionModalOpen, setIsShareCollectionModalOpen] = useState(false);
  const [isCopiedCollectionUrl, setIsCopiedCollectionUrl] = useState(false);
  const [isCreateColModalOpen, setIsCreateColModalOpen] = useState(false);
  const [isEditColModalOpen, setIsEditColModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<ShortCollection | null>(null);
  const [deleteConfirmCol, setDeleteConfirmCol] = useState<ShortCollection | null>(null);
  const [isAddReelsToColModalOpen, setIsAddReelsToColModalOpen] = useState(false);

  const [colFormName, setColFormName] = useState('');
  const [colFormDesc, setColFormDesc] = useState('');
  const [colFormIsPrivate, setColFormIsPrivate] = useState(true);

  // Selected collection object
  const activeCollection = useMemo(() => {
    if (!selectedCollectionId) return null;
    return collections.find(c => c.id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  // Shorts inside the currently opened collection
  const activeCollectionShorts = useMemo(() => {
    if (!activeCollection) return [];
    const allApproved = shortsService.getAllShorts();
    return activeCollection.shortIds
      .map(id => allApproved.find(s => s.id === id))
      .filter((s): s is ShortItem => !!s);
  }, [activeCollection]);

  // All approved shorts available to be added into collection
  const availableShortsToAdd = useMemo(() => {
    if (!activeCollection) return [];
    const allApproved = shortsService.getApprovedShorts();
    return allApproved.filter(s => !activeCollection.shortIds.includes(s.id));
  }, [activeCollection]);

  const loadCreatorData = () => {
    if (!creatorId) return;

    const result = shortsService.getShortsByCreator(creatorId);
    if (result) {
      setCreator(result.author);
      setCreatorShorts(result.shorts);
      setEditBio(result.author.bio);
      setEditName(result.author.name);
      setEditAvatar(result.author.avatar || '');
    } else {
      const fallback = INITIAL_CREATORS[creatorId];
      if (fallback) {
        setCreator(fallback);
        setCreatorShorts(shortsService.getApprovedShorts().filter(s => s.author.id === creatorId));
        setEditBio(fallback.bio);
        setEditName(fallback.name);
        setEditAvatar(fallback.avatar || '');
      }
    }

    setSavedShorts(shortsService.getSavedShorts());
    setCollections(shortsService.getCollections());
    setIsFollowing(shortsService.isFollowingCreator(creatorId));
    setFollowersCount(shortsService.getCreatorFollowersCount(creatorId));
  };

  useEffect(() => {
    loadCreatorData();
  }, [creatorId]);

  useEffect(() => {
    const handleSavedUpdated = () => {
      setSavedShorts(shortsService.getSavedShorts());
      setCollections(shortsService.getCollections());
    };
    window.addEventListener('jio_shorts_saved_updated', handleSavedUpdated);
    window.addEventListener('jio_shorts_collections_updated', handleSavedUpdated);
    window.addEventListener('jio_shorts_updated', handleSavedUpdated);
    return () => {
      window.removeEventListener('jio_shorts_saved_updated', handleSavedUpdated);
      window.removeEventListener('jio_shorts_collections_updated', handleSavedUpdated);
      window.removeEventListener('jio_shorts_updated', handleSavedUpdated);
    };
  }, []);

  useEffect(() => {
    if (collectionId) {
      setSelectedCollectionId(collectionId);
      setActiveTab('saved');
    }
  }, [collectionId]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ProfileTab | null;
    if (tabParam && ['shorts', 'saved', 'drafts', 'analytics', 'about'].includes(tabParam)) {
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

  const handlePlaySavedShort = (shortId: string) => {
    try {
      const savedIds = savedShorts.map(s => s.id);
      sessionStorage.setItem('jio_shorts_saved_order', JSON.stringify(savedIds));
    } catch (e) {
      console.error(e);
    }
    navigate(`/shorts?short=${shortId}&from=saved`);
  };

  const handleRemoveSaved = (e: React.MouseEvent, shortId: string) => {
    e.stopPropagation();
    shortsService.toggleSaveShort(shortId);
    setSavedShorts(shortsService.getSavedShorts());
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !creatorId) return;

    const url = URL.createObjectURL(file);
    setEditAvatar(url);
    shortsService.updateCreatorProfile(creatorId, {
      avatar: url
    });
    setCreator(prev => prev ? {
      ...prev,
      avatar: url
    } : null);
    showToast('📸 Profile photo updated');
  };

  const handleSaveFullProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorId || !creator) return;

    const updatedName = editName.trim() || creator.name;
    const updatedBio = editBio.trim();
    const updatedAvatar = editAvatar.trim() || creator.avatar;

    shortsService.updateCreatorProfile(creatorId, {
      name: updatedName,
      bio: updatedBio,
      avatar: updatedAvatar
    });

    setCreator(prev => prev ? {
      ...prev,
      name: updatedName,
      bio: updatedBio,
      avatar: updatedAvatar
    } : null);

    setIsEditingProfileView(false);
    showToast('✅ Profile updated successfully!');
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

  const isCurrentLearner =
    creatorId === 'u_current' ||
    creator.id === 'u_current' ||
    creator.name.includes('Learner') ||
    creator.name.includes('You') ||
    creator.id === INITIAL_CREATORS['u_current']?.id;

  // Dedicated Edit Profile Page View with Back Button
  if (isEditingProfileView) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-1 sm:pt-3">
        <div className="max-w-xl mx-auto px-2 sm:px-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-5">
            {/* Top Navigation Bar with Back Button */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <button
                type="button"
                onClick={() => setIsEditingProfileView(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs group"
                title="Back to Profile"
                aria-label="Back to Profile"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Edit Profile</h2>
              <div className="w-12" />
            </div>

            {/* Hidden File Input for Avatar */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <form onSubmit={handleSaveFullProfile} className="space-y-5">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="relative group">
                  <img
                    src={editAvatar || creator.avatar}
                    alt={editName || creator.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#002B7F]/15 ring-2 ring-white shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-full shadow-md transition-transform active:scale-90 cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs font-bold text-[#002B7F] hover:underline cursor-pointer"
                >
                  Change profile photo
                </button>
                <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                  <span className="text-[11px] text-gray-400 font-medium">Presets:</span>
                  <div className="flex items-center gap-1.5">
                    {PRESET_AVATARS.map((avUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditAvatar(avUrl)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          editAvatar === avUrl ? 'border-[#002B7F] scale-110 shadow-xs' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={avUrl} alt={`Preset ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-gray-700">Username</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your username..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white border border-gray-300 focus:border-[#002B7F] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Profile Description / Bio Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">Profile Description</label>
                  <span className="text-[10px] text-gray-400 font-medium">{editBio.length}/300</span>
                </div>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Add your description or technical expertise..."
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white border border-gray-300 focus:border-[#002B7F] rounded-xl text-xs text-gray-900 focus:outline-none resize-none leading-relaxed transition-all shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfileView(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all border border-gray-300 active:scale-98 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs relative">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg border border-gray-700 animate-fade-in pointer-events-none">
              {toastMessage}
            </div>
          )}

          {/* Hidden Avatar File Input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          {/* Back button on left & Notification button on top right */}
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => navigate('/shorts')}
              className="p-1.5 -ml-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all active:scale-95 flex items-center justify-center shadow-2xs group cursor-pointer"
              title="Back to Shorts"
              aria-label="Back to Shorts"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Notification Button at Top Right Corner of Profile Page */}
            <button
              onClick={() => navigate('/shorts/notifications')}
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Profile Section: Avatar on Left, Name & Actions on Right */}
          <div className="flex items-start gap-3.5">
            {/* Left: Compact Profile Picture */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isCurrentLearner) {
                    avatarInputRef.current?.click();
                  }
                }}
                className={`relative block rounded-full focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition-transform ${
                  isCurrentLearner ? 'cursor-pointer active:scale-95' : 'cursor-default'
                }`}
                title={isCurrentLearner ? 'Click to change profile photo' : creator.name}
                aria-label={isCurrentLearner ? 'Change profile photo' : creator.name}
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#002B7F]/20 ring-2 ring-white shadow-sm"
                />
                {!isCurrentLearner && (
                  <span className="absolute -bottom-0.5 -right-0.5 p-1 bg-[#002B7F] text-white rounded-full shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            </div>

            {/* Right: Info, Name, Counters & Actions */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Name & Domain */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight">
                      {creator.name}
                    </h1>
                  </div>
                  <div className="text-xs font-mono font-semibold text-gray-500 mt-0.5">
                    {creator.id === 'u_current' || creator.name.includes('Ajinkya') ? 'ajinkya4.patil' : `${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.patil`}
                  </div>
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

              {/* Actions row: Single text button "Edit Profile" for own profile, Follow for other creators */}
              <div className="pt-1">
                {isCurrentLearner ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(creator.name);
                      setEditBio(creator.bio);
                      setEditAvatar(creator.avatar);
                      setIsEditingProfileView(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
                    title="Edit Profile"
                  >
                    <span>Edit Profile</span>
                  </button>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Bio / Description Box - Clean text without inline edit forms */}
          <div className="mt-2.5 bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-200 text-left transition-all">
            <p className="text-xs text-gray-700 leading-relaxed">
              {creator.bio || 'Creator has not added a description yet.'}
            </p>
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
          {/* TAB 2: SAVED COLLECTIONS HUB */}
          {/* ========================================================================= */}
          {activeTab === 'saved' && (
            <div className="mt-2 space-y-4">
              {/* VIEW 1: SINGLE COLLECTION DETAILS PAGE (When a collection is clicked) */}
              {activeCollection ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Collection Header with Less Than Symbol Back Button (<) */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollectionId(null);
                          navigate('/shorts/creator/u_current?tab=saved');
                        }}
                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer flex items-center justify-center"
                        title="Back to All Collections"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-800 stroke-[2.5]" />
                      </button>

                      <div className="flex items-center gap-2">
                        {/* If not default, allow editing name and deleting with confirmation (ICONS ONLY, NO TEXT) */}
                        {!activeCollection.isDefault && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCol(activeCollection);
                                setColFormName(activeCollection.name);
                                setColFormDesc(activeCollection.description || '');
                                setColFormIsPrivate(activeCollection.isPrivate);
                                setIsEditColModalOpen(true);
                              }}
                              className="p-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                              title="Edit Collection"
                              aria-label="Edit Collection"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmCol(activeCollection)}
                              className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                              title="Delete Collection"
                              aria-label="Delete Collection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* If public collection, show share icon button ONLY */}
                        {!activeCollection.isPrivate && (
                          <button
                            type="button"
                            onClick={() => setIsShareCollectionModalOpen(true)}
                            className="p-2 text-[#002B7F] hover:bg-blue-100 bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                            title="Share Public Collection"
                            aria-label="Share Public Collection"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span>{activeCollection.name}</span>
                        </h2>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          activeCollection.isDefault
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : activeCollection.isPrivate
                            ? 'bg-gray-100 text-gray-700 border border-gray-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {activeCollection.isDefault ? (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              <span>Saved (Private)</span>
                            </>
                          ) : activeCollection.isPrivate ? (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              <span>Private</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              <span>Public</span>
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-1">
                        {activeCollectionShorts.length} reel{activeCollectionShorts.length !== 1 ? 's' : ''} in this collection
                      </p>
                    </div>
                  </div>

                  {/* Reels Grid inside Collection */}
                  {activeCollectionShorts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-xs space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <Film className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">No reels in "{activeCollection.name}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                      {activeCollectionShorts.map(short => (
                        <div
                          key={short.id}
                          className="group relative aspect-[3/4] bg-gray-950 overflow-hidden transition-transform"
                        >
                          {/* Thumbnail Media */}
                          <div
                            onClick={() => handlePlaySavedShort(short.id)}
                            className="w-full h-full cursor-pointer"
                          >
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
                          </div>

                          {/* Format Badge */}
                          <div className="absolute top-1 left-1 z-10 drop-shadow-md pointer-events-none">
                            {short.mediaType === 'video' ? (
                              <Film className="w-3.5 h-3.5 text-white drop-shadow" />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-white drop-shadow" />
                            )}
                          </div>

                          {/* Top-Right Remove from Collection Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              shortsService.removeShortFromCollection(activeCollection.id, short.id);
                              setCollections(shortsService.getCollections());
                              setSavedShorts(shortsService.getSavedShorts());
                              showToast(`Removed from "${activeCollection.name}"`);
                            }}
                            className="absolute top-1 right-1 z-20 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-md"
                            title="Remove reel from collection"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Dark Overlay with Title */}
                          <div
                            onClick={() => handlePlaySavedShort(short.id)}
                            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-1.5 text-white cursor-pointer pointer-events-auto"
                          >
                            <h4 className="text-[10px] font-bold leading-tight line-clamp-2 drop-shadow mb-0.5">
                              {short.caption || short.title}
                            </h4>
                            <div className="flex items-center justify-between text-[9px] text-gray-300 drop-shadow">
                              <span className="font-mono text-gray-200 truncate max-w-[55px]">{short.tags[0]}</span>
                              <span className="text-gray-200 font-semibold">{short.likesCount} ❤️</span>
                            </div>
                          </div>

                          {/* Center Play Icon on Hover */}
                          <div
                            onClick={() => handlePlaySavedShort(short.id)}
                            className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity pointer-events-none"
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-[#002B7F] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-3.5 h-3.5 fill-[#002B7F] ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: LIST OF ALL COLLECTIONS (Only a + button on header, 3x3 grid, collection name & number of reels right of thumbnail, no outer box) */
                <div className="space-y-4">
                  {/* Top Bar Header with ONLY a Plus Button on the right */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Collections</span>

                    <button
                      type="button"
                      onClick={() => {
                        setColFormName('');
                        setColFormDesc('');
                        setColFormIsPrivate(true);
                        setIsCreateColModalOpen(true);
                      }}
                      className="p-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-full transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Create New Collection"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* 3x3 Responsive Grid for Collections (Thumbnail on left, Title & Reels count on right, no outer box) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {collections.map((col) => {
                      const colShorts = col.shortIds
                        .map(id => shortsService.getAllShorts().find(s => s.id === id))
                        .filter((s): s is ShortItem => !!s);
                      const latestShort = colShorts[0];
                      const thumb = latestShort?.thumbnailUrl || latestShort?.mediaUrls[0] || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';

                      return (
                        <div
                          key={col.id}
                          onClick={() => {
                            setSelectedCollectionId(col.id);
                            navigate(`/shorts/collection/${col.id}`);
                          }}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100/80 transition-all cursor-pointer group select-none text-left"
                        >
                          {/* Thumbnail Image on the Left */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-900 overflow-hidden flex-shrink-0 shadow-2xs border border-gray-200 group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={thumb}
                              alt={col.name}
                              className="w-full h-full object-cover"
                            />
                            {col.isPrivate && (
                              <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60 text-white">
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          {/* Collection Name & Number of Reels on the Right */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#002B7F] transition-colors truncate">
                              {col.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 font-medium">
                              {col.shortIds.length} reel{col.shortIds.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 1: CREATE NEW COLLECTION */}
          {/* ========================================================================= */}
          {isCreateColModalOpen && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setIsCreateColModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-gray-900 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-50 text-[#002B7F]">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Create New Collection</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateColModalOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!colFormName.trim()) return;
                    const created = shortsService.createCollection(
                      colFormName.trim(),
                      colFormDesc.trim() || undefined,
                      colFormIsPrivate
                    );
                    setCollections(shortsService.getCollections());
                    setIsCreateColModalOpen(false);
                    showToast(`✨ Created collection "${created.name}"`);
                  }}
                  className="space-y-3.5 text-left"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={colFormName}
                      onChange={(e) => setColFormName(e.target.value)}
                      placeholder="e.g. System Design, AI Tools"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F] focus:bg-white"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Privacy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setColFormIsPrivate(true)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          colFormIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setColFormIsPrivate(false)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          !colFormIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Public</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsCreateColModalOpen(false)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!colFormName.trim()}
                      className="px-4 py-2 bg-[#002B7F] hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Create Collection</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 2: EDIT COLLECTION NAME & DESCRIPTION */}
          {/* ========================================================================= */}
          {isEditColModalOpen && editingCol && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setIsEditColModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-gray-900 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-50 text-[#002B7F]">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Edit Collection</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditColModalOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!colFormName.trim()) return;
                    shortsService.updateCollection(editingCol.id, {
                      name: colFormName.trim(),
                      description: colFormDesc.trim(),
                      isPrivate: colFormIsPrivate
                    });
                    setCollections(shortsService.getCollections());
                    setIsEditColModalOpen(false);
                    showToast('✅ Collection updated successfully');
                  }}
                  className="space-y-3.5 text-left"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Collection Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={colFormName}
                      onChange={(e) => setColFormName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F] focus:bg-white"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Description <span className="text-[10px] text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={colFormDesc}
                      onChange={(e) => setColFormDesc(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F] focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Privacy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setColFormIsPrivate(true)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          colFormIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setColFormIsPrivate(false)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          !colFormIsPrivate
                            ? 'bg-[#002B7F] text-white border-blue-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Public</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditColModalOpen(false)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!colFormName.trim()}
                      className="px-4 py-2 bg-[#002B7F] hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 3: DELETE COLLECTION CONFIRMATION POPUP */}
          {/* ========================================================================= */}
          {deleteConfirmCol && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setDeleteConfirmCol(null)}
            >
              <div
                className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-gray-900 text-center animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">Delete "{deleteConfirmCol.name}"?</h3>
                  <p className="text-xs text-gray-500">
                    Are you sure you want to delete this collection? The reels inside will remain in your saved library.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmCol(null)}
                    className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      shortsService.deleteCollection(deleteConfirmCol.id);
                      setCollections(shortsService.getCollections());
                      if (selectedCollectionId === deleteConfirmCol.id) {
                        setSelectedCollectionId(null);
                      }
                      setDeleteConfirmCol(null);
                      showToast('🗑️ Collection deleted');
                    }}
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 4: ADD REELS TO COLLECTION */}
          {/* ========================================================================= */}
          {isAddReelsToColModalOpen && activeCollection && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setIsAddReelsToColModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl p-5 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl text-gray-900 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Add Reels to "{activeCollection.name}"</h3>
                    <p className="text-[10px] text-gray-500">Select reels to add to this collection</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddReelsToColModalOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-2 divide-y divide-gray-100">
                  {availableShortsToAdd.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs">
                      All available shorts are already added to this collection!
                    </div>
                  ) : (
                    availableShortsToAdd.map(short => (
                      <div
                        key={short.id}
                        className="pt-2 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-14 bg-black rounded-lg overflow-hidden flex-shrink-0">
                            {short.mediaType === 'video' ? (
                              <video src={short.mediaUrls[0]} className="w-full h-full object-cover" />
                            ) : (
                              <img src={short.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {short.caption || short.title}
                            </h4>
                            <p className="text-[10px] text-gray-500">{short.author.name}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            shortsService.addShortToCollection(activeCollection.id, short.id);
                            setCollections(shortsService.getCollections());
                            setSavedShorts(shortsService.getSavedShorts());
                            showToast(`Added to "${activeCollection.name}"`);
                          }}
                          className="px-3 py-1.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex-shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddReelsToColModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
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

      {/* --- Reel Analytics Modal (Three Dots Menu -> View Analytics) --- */}
      {isAnalyticsMenuOpen && selectedShortForAnalytics && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAnalyticsMenuOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#002B7F]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Reel Analytics</h3>
                  <p className="text-[11px] text-gray-500 truncate max-w-[200px]">{selectedShortForAnalytics.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAnalyticsMenuOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Views</span>
                <p className="text-base font-extrabold text-gray-900 mt-0.5">{selectedShortForAnalytics.viewsCount}</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Likes</span>
                <p className="text-base font-extrabold text-rose-600 mt-0.5">{selectedShortForAnalytics.likesCount}</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Shares</span>
                <p className="text-base font-extrabold text-blue-600 mt-0.5">{selectedShortForAnalytics.sharesCount}</p>
              </div>
            </div>

            {/* Engagement & Completion */}
            <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Completion Rate</span>
                <span className="font-bold text-emerald-600">84%</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600 font-medium">Avg Watch Time</span>
                <span className="font-bold text-gray-900">14.8s / {selectedShortForAnalytics.durationSeconds || 15}s</span>
              </div>
            </div>

            {/* Audience Demographics */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Viewer Demographics</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Engineering & Architecture</span>
                  <span className="font-bold">52%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Product Management</span>
                  <span className="font-bold">26%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Operations</span>
                  <span className="font-bold">22%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAnalyticsMenuOpen(false)}
              className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-800 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SHARE PUBLIC COLLECTION MODAL / BOTTOM SHEET */}
      {isShareCollectionModalOpen && activeCollection && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsShareCollectionModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-gray-900 animate-slide-up sm:animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto sm:hidden mb-1" />

            {/* Tiny URL & Copy Button ONLY - NO TEXT */}
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-100 border border-gray-200 rounded-2xl">
              <span className="text-xs font-mono font-bold text-gray-800 truncate select-all">
                {`https://jio.learn/c/${activeCollection.id}`}
              </span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://jio.learn/c/${activeCollection.id}`);
                  setIsCopiedCollectionUrl(true);
                  setTimeout(() => setIsCopiedCollectionUrl(false), 2000);
                }}
                className="p-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                title="Copy Link"
                aria-label="Copy Link"
              >
                {isCopiedCollectionUrl ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfilePage;
