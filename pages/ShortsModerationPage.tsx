import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Search,
  X,
  Play,
  Layers,
  Film,
  Tag,
  Eye,
  AlertCircle,
  Sliders,
  RotateCcw,
  Flag,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Video,
  Music,
  Save
} from 'lucide-react';
import {
  ShortItem,
  ShortReport,
  shortsService,
  ShortsRecommendationConfig
} from '../services/shortsService';

interface ShortsModerationPageProps {
  defaultSection?: 'content' | 'tags' | 'settings';
}

export const ShortsModerationPage: React.FC<ShortsModerationPageProps> = ({ defaultSection }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top level portal tabs: Content Management, Enterprise Tags, Settings
  const initialSection = defaultSection || (searchParams.get('tab') as 'content' | 'tags' | 'settings') || 'content';
  const [portalSection, setPortalSection] = useState<'content' | 'tags' | 'settings'>(initialSection);

  // Content Management Sub-state
  const [allShorts, setAllShorts] = useState<ShortItem[]>([]);
  const [reports, setReports] = useState<ShortReport[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'reported' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Enterprise Tags Sub-state
  const [enterpriseTags, setEnterpriseTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [tagAddError, setTagAddError] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // Settings Sub-state
  const [config, setConfig] = useState<ShortsRecommendationConfig>(() => shortsService.getConfig());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadShortsAndTags = () => {
    setAllShorts(shortsService.getAllShorts());
    setReports(shortsService.getReports());
    setEnterpriseTags(shortsService.getPredefinedTags());
  };

  useEffect(() => {
    loadShortsAndTags();
    const handleUpdate = () => loadShortsAndTags();
    window.addEventListener('jio_shorts_updated', handleUpdate);
    window.addEventListener('jio_shorts_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('jio_shorts_updated', handleUpdate);
      window.removeEventListener('jio_shorts_reports_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'content' | 'tags' | 'settings' | null;
    if (tabParam && ['content', 'tags', 'settings'].includes(tabParam)) {
      setPortalSection(tabParam);
    }
  }, [searchParams]);

  const handleSwitchPortalSection = (section: 'content' | 'tags' | 'settings') => {
    setPortalSection(section);
    setSearchParams(section === 'content' ? {} : { tab: section });
  };

  const handleHeaderBack = () => {
    if (portalSection !== 'content') {
      handleSwitchPortalSection('content');
    } else {
      navigate('/shorts');
    }
  };

  // Reported Shorts mapping
  const reportedShortsData = useMemo(() => {
    return shortsService.getReportedShorts();
  }, [allShorts, reports]);

  const counts = useMemo(() => {
    return {
      pending: allShorts.filter(s => s.status === 'pending').length,
      reported: reportedShortsData.filter(r => r.reports.some(rep => rep.status === 'pending')).length,
      approved: allShorts.filter(s => s.status === 'approved').length,
      rejected: allShorts.filter(s => s.status === 'rejected').length
    };
  }, [allShorts, reportedShortsData]);

  const filteredShorts = useMemo(() => {
    if (activeTab === 'reported') {
      return reportedShortsData
        .filter(item => item.reports.some(rep => rep.status === 'pending'))
        .map(item => item.short)
        .filter(short => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const titleMatch = short.title.toLowerCase().includes(q);
            const authorMatch = short.author.name.toLowerCase().includes(q);
            return titleMatch || authorMatch;
          }
          return true;
        });
    }

    return allShorts.filter(short => {
      if (short.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = short.title.toLowerCase().includes(q);
        const authorMatch = short.author.name.toLowerCase().includes(q);
        return titleMatch || authorMatch;
      }
      return true;
    });
  }, [allShorts, reportedShortsData, activeTab, searchQuery]);

  // Tag Management Handlers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    setTagAddError(null);

    const clean = newTagInput.replace(/^#/, '').trim();
    if (!clean) {
      setTagAddError('Please enter a tag name');
      return;
    }

    const res = shortsService.addPredefinedTag(clean);
    if (res.success) {
      setNewTagInput('');
      setEnterpriseTags(shortsService.getPredefinedTags());
      showToast(`✅ Enterprise tag "${clean}" added!`);
    } else {
      setTagAddError(res.error || 'Failed to add tag');
    }
  };

  const handleConfirmDeleteTag = () => {
    if (!tagToDelete) return;
    shortsService.removePredefinedTag(tagToDelete);
    showToast(`🗑️ Deleted tag "${tagToDelete}"`);
    setTagToDelete(null);
    setEnterpriseTags(shortsService.getPredefinedTags());
  };

  const filteredEnterpriseTags = useMemo(() => {
    return enterpriseTags.filter(t =>
      t.toLowerCase().includes(tagSearchQuery.toLowerCase().trim())
    );
  }, [enterpriseTags, tagSearchQuery]);

  // Settings Handlers
  const handleSaveSettings = () => {
    shortsService.updateConfig(config);
    showToast('🚀 Shorts settings saved successfully!');
  };

  const handleResetSettings = () => {
    const def = shortsService.resetConfigToDefaults();
    setConfig(def);
    showToast('🔄 Settings reset to enterprise defaults');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Navigation & Header Card: Strictly Preserved Across All Sub-tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHeaderBack}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title={portalSection !== 'content' ? "Back to Content Management" : "Back to Shorts"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Shorts Content Management
                </h1>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Approver Portal
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Audit employee-submitted micro-learning videos, photo decks, manage violations, and moderate custom learning tags
              </p>
            </div>
          </div>
        </div>

        {/* 3 Sub-menus: Content Management, Enterprise Tags, Settings (Rendered Once, No Duplicate) */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSwitchPortalSection('content')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalSection === 'content'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Content Management</span>
          </button>

          <button
            onClick={() => handleSwitchPortalSection('tags')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalSection === 'tags'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Enterprise Tags</span>
          </button>

          <button
            onClick={() => handleSwitchPortalSection('settings')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalSection === 'settings'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: CONTENT MANAGEMENT (Pending Review, Reported, Approved, Rejected) */}
        {/* ========================================================================= */}
        {portalSection === 'content' && (
          <div className="space-y-6">
            {/* Search & Filter Bar with Tabs */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Tabs: Pending, Reported Content, Approved, Rejected */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'pending'
                      ? 'bg-white text-amber-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending Review ({counts.pending})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reported')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'reported'
                      ? 'bg-white text-rose-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reported Content ({counts.reported})</span>
                </button>

                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'approved'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved ({counts.approved})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'rejected'
                      ? 'bg-white text-red-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Rejected ({counts.rejected})</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, creator..."
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Submissions List: Simplified Tiles across all queues (ONLY thumbnail, title, uploader, upload date, view icon) */}
            {filteredShorts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">
                  No {activeTab} submissions found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {activeTab === 'pending'
                    ? 'All employee submissions have been audited. Great job!'
                    : activeTab === 'reported'
                    ? 'No content violation reports are currently open.'
                    : `There are currently no shorts in the ${activeTab} queue.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredShorts.map(short => {
                  const shortReports = shortsService.getReportsForShort(short.id).filter(r => r.status === 'pending');

                  return (
                    <div
                      key={short.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Simplified Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Reel Thumbnail */}
                        <div
                          onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                          className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 cursor-pointer shadow-xs group"
                        >
                          {short.mediaType === 'video' ? (
                            <video src={short.mediaUrls[0]} className="w-full h-full object-cover" />
                          ) : (
                            <img src={short.mediaUrls[0]} alt={short.title} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded font-bold uppercase">
                            {short.mediaType}
                          </span>
                        </div>

                        {/* Text Information: Title, Status, Uploader, Date & Report Reason */}
                        <div className="space-y-1 min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#002B7F] cursor-pointer truncate"
                              onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                            >
                              {short.title}
                            </h3>
                            <span
                              className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                short.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : short.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {short.status}
                            </span>
                          </div>

                          {/* Uploader & Upload Date */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                            <span className="font-semibold text-gray-800 truncate">{short.author.name}</span>
                            <span>•</span>
                            <span className="text-[11px] text-gray-500 shrink-0">{new Date(short.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* In Reported Content: Show only Report Reason label, NOT the additional body text */}
                          {shortReports.length > 0 && (
                            <div className="pt-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>Report Reason: {shortReports[0].reason}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: STRICTLY ONLY THE VIEW ICON BUTTON */}
                      <div className="flex items-center flex-shrink-0">
                        <button
                          onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                          className="p-2.5 sm:p-3 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                          title="View and Review Content"
                          aria-label="View and Review Content"
                        >
                          <Eye className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ENTERPRISE TAGS (In-place below sub-menu, NO hashtags) */}
        {/* ========================================================================= */}
        {portalSection === 'tags' && (
          <div className="space-y-6">
            {/* Add Enterprise Learning Tag Card (NO hashtag prefix, NO CSV bulk) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Add Enterprise Learning Tag</h2>
              <p className="text-xs text-gray-500">
                Create new standardized topics for employee reels. Tags are entered without hashtags.
              </p>
              <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value.replace(/^#/, ''))}
                    placeholder="e.g. SystemDesign or DeepLearning"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-[#002B7F] rounded-2xl text-xs text-gray-900 focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tag</span>
                </button>
              </form>

              {tagAddError && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{tagAddError}</span>
                </p>
              )}
            </div>

            {/* Current Active Tags List */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Active Enterprise Tags ({enterpriseTags.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Standard tags selectable by creators when publishing learning shorts
                  </p>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Filter enterprise tags..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {filteredEnterpriseTags.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No matching tags found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredEnterpriseTags.map(tag => (
                    <div
                      key={tag}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-2 group hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="text-xs font-mono font-bold text-gray-800 truncate">
                          {tag.replace(/^#/, '')}
                        </span>
                      </div>

                      <button
                        onClick={() => setTagToDelete(tag)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title={`Delete tag ${tag}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SETTINGS (In-place below sub-menu) */}
        {/* ========================================================================= */}
        {portalSection === 'settings' && (
          <div className="space-y-6">
            {/* Section 1: Consumption & View Count Threshold */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#002B7F]" />
                    <span>Consumption & Analytics View Threshold</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    A Short view is counted only when watched continuously for this duration.
                  </p>
                </div>
              </div>

              <div className="max-w-xs space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  View Count Threshold (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={config.viewThresholdSeconds}
                    onChange={(e) => setConfig({ ...config, viewThresholdSeconds: Number(e.target.value) || 3 })}
                    className="w-28 px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#002B7F]"
                  />
                  <span className="text-xs text-gray-500 font-medium">seconds watched</span>
                </div>
              </div>
            </div>

            {/* Section 2: Upload Limits */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#002B7F]" />
                  <span>Media & Creation Constraints</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Maximum file constraints for video, audio, and photo decks uploaded by learners.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Max Video File Size (MB)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={config.maxVideoSizeBytes / (1024 * 1024)}
                    onChange={(e) => setConfig({
                      ...config,
                      maxVideoSizeBytes: (Number(e.target.value) || 100) * 1024 * 1024
                    })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#002B7F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Max Photos in Carousel Post
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={config.maxCarouselPhotos}
                    onChange={(e) => setConfig({ ...config, maxCarouselPhotos: Number(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#002B7F]"
                  />
                </div>
              </div>
            </div>

            {/* Save & Reset Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tag Deletion Confirmation Modal */}
      {tagToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setTagToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete Enterprise Tag?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete tag <strong className="text-gray-900 font-mono">"{tagToDelete}"</strong>?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTagToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTag}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Delete Tag
              </button>
            </div>
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
  );
};

export default ShortsModerationPage;
