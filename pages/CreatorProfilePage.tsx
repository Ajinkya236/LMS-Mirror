import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Film,
  Sparkles,
  Play,
  Briefcase,
  Building,
  Award,
  Layers,
  Edit3,
  Check,
  X
} from 'lucide-react';
import {
  ShortAuthor,
  ShortItem,
  shortsService,
  INITIAL_CREATORS
} from '../services/shortsService';

export const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<ShortAuthor | null>(null);
  const [creatorShorts, setCreatorShorts] = useState<ShortItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'shorts' | 'about'>('shorts');

  // Edit Profile modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');

  const loadCreatorData = () => {
    if (!creatorId) return;

    const result = shortsService.getShortsByCreator(creatorId);
    if (result) {
      setCreator(result.author);
      setCreatorShorts(result.shorts);
      setEditBio(result.author.bio);
      setEditRole(result.author.role);
      setEditDept(result.author.department);
    } else {
      const fallback = INITIAL_CREATORS[creatorId];
      if (fallback) {
        setCreator(fallback);
        setCreatorShorts(shortsService.getApprovedShorts().filter(s => s.author.id === creatorId));
        setEditBio(fallback.bio);
        setEditRole(fallback.role);
        setEditDept(fallback.department);
      }
    }

    setIsFollowing(shortsService.isFollowingCreator(creatorId));
    setFollowersCount(shortsService.getCreatorFollowersCount(creatorId));
  };

  useEffect(() => {
    loadCreatorData();
  }, [creatorId]);

  const handleToggleFollow = () => {
    if (!creatorId) return;
    const res = shortsService.toggleFollowCreator(creatorId);
    setIsFollowing(res.isFollowing);
    setFollowersCount(res.followersCount);
  };

  const handlePlayShort = (shortId: string) => {
    navigate(`/shorts?short=${shortId}`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorId || !creator) return;

    shortsService.updateCreatorProfile(creatorId, {
      bio: editBio.trim(),
      role: editRole.trim(),
      department: editDept.trim()
    });

    setCreator(prev => prev ? {
      ...prev,
      bio: editBio.trim(),
      role: editRole.trim(),
      department: editDept.trim()
    } : null);

    setIsEditingProfile(false);
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="text-xl font-bold">Creator Profile Not Found</h2>
        <button
          onClick={() => navigate('/shorts')}
          className="px-5 py-2.5 bg-[#002B7F] rounded-xl text-xs font-bold text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shorts</span>
        </button>
      </div>
    );
  }

  const isCurrentLearner = creatorId === 'u_current' || creator.name.includes('Learner') || creator.name.includes('You');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate('/shorts')}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Shorts Feed</span>
          </button>

          <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-[#002B7F]" />
            <span>Creator Profile</span>
          </span>

          {/* Follow / Unfollow (or Edit Profile if own profile) - No share button */}
          <div>
            {isCurrentLearner ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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

      {/* Main Creator Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-[#002B7F]"
              />
              <span className="absolute bottom-1 right-1 p-1.5 bg-[#002B7F] text-white rounded-full shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {creator.name}
                  </h1>
                  <span className="text-[11px] bg-blue-50 text-[#002B7F] border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    Creator
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-600 mt-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    <span>{creator.role}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    <span>{creator.department}</span>
                  </span>
                </div>
              </div>

              {/* Followers & Published Shorts Count */}
              <div className="flex items-center justify-center sm:justify-start gap-6 pt-1 text-xs">
                <div>
                  <span className="font-extrabold text-sm text-gray-900">{followersCount}</span>
                  <span className="text-gray-500 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-extrabold text-sm text-gray-900">{creatorShorts.length}</span>
                  <span className="text-gray-500 ml-1">Published Shorts</span>
                </div>
              </div>

              {/* Bio / Description */}
              <p className="text-xs text-gray-700 leading-relaxed max-w-2xl bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                {creator.bio || 'Creator has not added a description yet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Single Submenu Navigation (Published Shorts & About) */}
        <div className="mt-8">
          <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('shorts')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'shorts'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>PUBLISHED SHORTS ({creatorShorts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'about'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>ABOUT & EXPERTISE</span>
            </button>
          </div>

          {/* TAB 1: PUBLISHED SHORTS GRID (Reels & Photo Decks Combined) */}
          {activeTab === 'shorts' && (
            <div className="mt-6">
              {creatorShorts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                  <Film className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-bold text-gray-900">No published shorts yet</p>
                  <p className="text-xs text-gray-500">
                    This creator hasn't published any learning shorts yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-gray-100 p-1 sm:p-1.5 rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  {creatorShorts.map(short => (
                    <div
                      key={short.id}
                      onClick={() => handlePlayShort(short.id)}
                      className="group relative aspect-[4/5] bg-gray-950 overflow-hidden cursor-pointer rounded-lg transition-transform active:scale-[0.98]"
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

                      {/* Format Badge (Top Right) */}
                      <div className="absolute top-1.5 right-1.5 z-10 drop-shadow-md">
                        {short.mediaType === 'video' ? (
                          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
                        )}
                      </div>

                      {/* Dark Vignette Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-1.5 sm:p-2.5 text-white">
                        <h4 className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 drop-shadow mb-1">
                          {short.title}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-300 drop-shadow">
                          <span className="font-mono text-blue-300 truncate max-w-[70px]">{short.tags[0]}</span>
                          <span className="text-rose-300 font-semibold">{short.likesCount} ❤️</span>
                        </div>
                      </div>

                      {/* Center Play Icon on Hover */}
                      <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#002B7F] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#002B7F] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT & EXPERTISE */}
          {activeTab === 'about' && (
            <div className="mt-6 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Professional Summary</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {creator.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Department</span>
                  <span className="text-xs font-bold text-gray-900 mt-1 block">{creator.department}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Designation</span>
                  <span className="text-xs font-bold text-gray-900 mt-1 block">{creator.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsEditingProfile(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#002B7F]" />
                <span>Edit Creator Profile</span>
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700 block">Job Role / Designation</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700 block">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-700 block">Profile Description / Bio</label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell colleagues about your technical expertise, focus areas, and topics you share shorts about..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfilePage;
