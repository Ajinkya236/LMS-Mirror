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
  Flag,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  User,
  ExternalLink
} from 'lucide-react';
import {
  ShortItem,
  ShortReport,
  shortsService
} from '../services/shortsService';

interface ShortsModerationPageProps {
  defaultSection?: 'content' | 'reported' | 'tags';
}

export const ShortsModerationPage: React.FC<ShortsModerationPageProps> = ({ defaultSection }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 3 Portal Submenus: Content Management, Reported Content, Enterprise Tags
  const initialSection = defaultSection || (searchParams.get('tab') as 'content' | 'reported' | 'tags') || 'content';
  const [portalSection, setPortalSection] = useState<'content' | 'reported' | 'tags'>(initialSection);

  // Content Management Sub-state
  const [allShorts, setAllShorts] = useState<ShortItem[]>([]);
  const [reports, setReports] = useState<ShortReport[]>([]);
  const [contentTab, setContentTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Reported Content Sub-state (Pending, Approved, Rejected columns/tabs)
  const [reportedTab, setReportedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reportedSearchQuery, setReportedSearchQuery] = useState('');
  const [showRevokeModalForShort, setShowRevokeModalForShort] = useState<ShortItem | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');

  // Enterprise Tags Sub-state
  const [adminTags, setAdminTags] = useState<string[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [tagAddError, setTagAddError] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadShortsAndTags = () => {
    setAllShorts(shortsService.getAllShorts());
    setReports(shortsService.getReports());
    setAdminTags(shortsService.getAdminTags());
    setUserTags(shortsService.getUserTags());
    setAllTags(shortsService.getAllTags());
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
    const tabParam = searchParams.get('tab') as 'content' | 'reported' | 'tags' | null;
    if (tabParam && ['content', 'reported', 'tags'].includes(tabParam)) {
      setPortalSection(tabParam);
    }
  }, [searchParams]);

  const handleSwitchPortalSection = (section: 'content' | 'reported' | 'tags') => {
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

  // Counts for Content Management (Pending, Approved, Rejected)
  const counts = useMemo(() => {
    return {
      pending: allShorts.filter(s => s.status === 'pending').length,
      approved: allShorts.filter(s => s.status === 'approved').length,
      rejected: allShorts.filter(s => s.status === 'rejected').length
    };
  }, [allShorts]);

  // Counts for Reported Content (Pending, Approved, Rejected)
  const reportedCounts = useMemo(() => {
    const pendingCount = reports.filter(r => r.status === 'pending').length;
    const approvedCount = reports.filter(r => r.status === 'dismissed').length;
    const rejectedCount = reports.filter(r => r.status === 'revoked').length;
    return {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    };
  }, [reports]);

  // Filtered shorts for Content Management
  const filteredContentShorts = useMemo(() => {
    return allShorts.filter(short => {
      if (short.status !== contentTab) {
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
  }, [allShorts, contentTab, searchQuery]);

  // Filtered grouped items for Reported Content
  const filteredReportedItems = useMemo(() => {
    const targetStatus = reportedTab === 'pending' ? 'pending' : reportedTab === 'approved' ? 'dismissed' : 'revoked';
    const targetReports = reports.filter(r => r.status === targetStatus);

    const groups = new Map<string, { short: ShortItem; reports: ShortReport[] }>();
    targetReports.forEach(rep => {
      const s = allShorts.find(item => item.id === rep.shortId);
      if (s) {
        if (!groups.has(s.id)) {
          groups.set(s.id, { short: s, reports: [] });
        }
        groups.get(s.id)!.reports.push(rep);
      }
    });

    return Array.from(groups.values()).filter(item => {
      if (reportedSearchQuery.trim()) {
        const q = reportedSearchQuery.toLowerCase();
        const titleMatch = item.short.title.toLowerCase().includes(q);
        const authorMatch = item.short.author.name.toLowerCase().includes(q);
        const reasonMatch = item.reports.some(r => r.reason.toLowerCase().includes(q));
        return titleMatch || authorMatch || reasonMatch;
      }
      return true;
    });
  }, [reports, allShorts, reportedTab, reportedSearchQuery]);

  // Filtered Enterprise Tags
  const filteredEnterpriseTags = useMemo(() => {
    let sourceList: string[] = [];
    if (tagFilter === 'all') {
      sourceList = allTags;
    } else if (tagFilter === 'admin') {
      sourceList = adminTags;
    } else {
      sourceList = userTags;
    }

    if (tagSearchQuery.trim()) {
      const q = tagSearchQuery.toLowerCase().trim();
      return sourceList.filter(t => t.toLowerCase().includes(q));
    }
    return sourceList;
  }, [tagFilter, allTags, adminTags, userTags, tagSearchQuery]);

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
      loadShortsAndTags();
      showToast(`✅ Admin-created enterprise tag "${clean}" added!`);
    } else {
      setTagAddError(res.error || 'Failed to add tag');
    }
  };

  const handleConfirmDeleteTag = () => {
    if (!tagToDelete) return;
    shortsService.deleteTagFromPlatform(tagToDelete);
    showToast(`🗑️ Deleted tag "${tagToDelete}"`);
    setTagToDelete(null);
    loadShortsAndTags();
  };

  // Reported Content Actions:
  // When approved / dismissed: Creator is NOT notified
  const handleDismissReports = (shortId: string) => {
    shortsService.dismissReportsForShort(shortId);
    showToast('✅ Report dismissed. Content verified and preserved.');
    loadShortsAndTags();
  };

  // When revoked: Creator IS notified with the reason
  const handleConfirmRevoke = () => {
    if (!showRevokeModalForShort) return;
    const reason = revokeReasonInput.trim() || 'Content revoked following community violation review.';
    shortsService.revokeShortWithReason(showRevokeModalForShort.id, reason);
    showToast('⚠️ Content revoked. Uploader has been notified of the revocation reason.');
    setShowRevokeModalForShort(null);
    setRevokeReasonInput('');
    loadShortsAndTags();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHeaderBack}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              title={portalSection !== 'content' ? "Back to Content Management" : "Back to Shorts"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Shorts Approver Portal
                </h1>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Manager View
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Audit employee-submitted reels, manage community violation reports, and organize enterprise tags
              </p>
            </div>
          </div>
        </div>

        {/* 3 Sub-menus: Content Management, Reported Content, Enterprise Tags */}
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
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => handleSwitchPortalSection('reported')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              portalSection === 'reported'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-500" />
            <span>Reported Content</span>
            {reportedCounts.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold">
                {reportedCounts.pending}
              </span>
            )}
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
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-mono">
              {allTags.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUBMENU 1: CONTENT MANAGEMENT (Pending, Approved, Rejected) */}
        {/* ========================================================================= */}
        {portalSection === 'content' && (
          <div className="space-y-6">
            {/* Filter Bar with Tabs & Search */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* 3 Tabs: Pending Review, Approved, Rejected */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setContentTab('pending')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentTab === 'pending'
                      ? 'bg-white text-amber-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending ({counts.pending})</span>
                </button>

                <button
                  onClick={() => setContentTab('approved')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentTab === 'approved'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved ({counts.approved})</span>
                </button>

                <button
                  onClick={() => setContentTab('rejected')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentTab === 'rejected'
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

            {/* Submissions List */}
            {filteredContentShorts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">
                  No {contentTab} submissions found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {contentTab === 'pending'
                    ? 'All employee submissions have been audited. Great job!'
                    : `There are currently no shorts in the ${contentTab} queue.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredContentShorts.map(short => (
                  <div
                    key={short.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
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

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                          <span className="font-semibold text-gray-800 truncate">{short.author.name}</span>
                          <span>•</span>
                          <span className="text-[11px] text-gray-500 shrink-0">{new Date(short.createdAt).toLocaleDateString()}</span>
                        </div>

                        {short.status === 'rejected' && short.rejectionReason && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Reason: {short.rejectionReason}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                        className="p-2.5 sm:p-3 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Audit Short"
                        aria-label="Audit Short"
                      >
                        <Eye className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBMENU 2: REPORTED CONTENT (Pending, Approved, Rejected Columns/Tabs) */}
        {/* ========================================================================= */}
        {portalSection === 'reported' && (
          <div className="space-y-6">
            {/* Reported Submenu Navigation: Pending, Approved (Dismissed/Preserved), Rejected (Revoked) */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setReportedTab('pending')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportedTab === 'pending'
                      ? 'bg-white text-rose-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Pending ({reportedCounts.pending})</span>
                </button>

                <button
                  onClick={() => setReportedTab('approved')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportedTab === 'approved'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved / Dismissed ({reportedCounts.approved})</span>
                </button>

                <button
                  onClick={() => setReportedTab('rejected')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reportedTab === 'rejected'
                      ? 'bg-white text-red-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Rejected / Revoked ({reportedCounts.rejected})</span>
                </button>
              </div>

              {/* Search in reported items */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reportedSearchQuery}
                  onChange={(e) => setReportedSearchQuery(e.target.value)}
                  placeholder="Search report reason, title..."
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
                />
                {reportedSearchQuery && (
                  <button
                    onClick={() => setReportedSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Reported Items */}
            {filteredReportedItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
                <Flag className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">
                  No {reportedTab} reports found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {reportedTab === 'pending'
                    ? 'No open violation reports pending manager review.'
                    : reportedTab === 'approved'
                    ? 'No reports have been dismissed/approved to stay.'
                    : 'No content items have been revoked.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReportedItems.map(({ short, reports: itemReports }) => {
                  const violationType = Array.from(new Set(itemReports.map(r => r.reason))).join(', ');
                  return (
                    <div
                      key={short.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3
                          onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                          className="text-sm font-bold text-gray-900 hover:text-[#002B7F] cursor-pointer truncate"
                        >
                          {short.title}
                        </h3>
                        <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg inline-block">
                          Violation: {violationType || 'Reported Content'}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                        className="px-4 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Audit Reel</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBMENU 3: ENTERPRISE TAGS (Two Sections with 3-Way Toggle Filter) */}
        {/* ========================================================================= */}
        {portalSection === 'tags' && (
          <div className="space-y-6">
            {/* SECTION 1: CREATE & FILTER ENTERPRISE TAGS */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5 text-left">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Add Enterprise Learning Tag</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Create new standardized topics for employee reels. Tags are entered without hashtags.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value.replace(/^#/, ''))}
                    placeholder="e.g. DistributedSystems or Microservices"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-[#002B7F] rounded-2xl text-xs text-gray-900 focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Admin Tag</span>
                </button>
              </form>

              {tagAddError && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{tagAddError}</span>
                </p>
              )}

              {/* 3-Way Toggle Filter: All Tags, Admin-Created, User-Created */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTagFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tagFilter === 'all'
                        ? 'bg-white text-[#002B7F] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Tags ({allTags.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagFilter('admin')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tagFilter === 'admin'
                        ? 'bg-white text-[#002B7F] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin-Created ({adminTags.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagFilter('user')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tagFilter === 'user'
                        ? 'bg-white text-[#002B7F] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    User-Created ({userTags.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search in selected tags..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: TAG TAXONOMY (Filtered results strictly for that toggle) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {tagFilter === 'all'
                      ? `All Platform Tags (${filteredEnterpriseTags.length})`
                      : tagFilter === 'admin'
                      ? `Admin-Created Enterprise Tags (${filteredEnterpriseTags.length})`
                      : `User-Created Custom Tags (${filteredEnterpriseTags.length})`}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tagFilter === 'all'
                      ? 'Displaying all standardized enterprise and user-contributed tags'
                      : tagFilter === 'admin'
                      ? 'Standard platform tags curated directly by content administrators'
                      : 'Tags created organically by employees when publishing learning reels'}
                  </p>
                </div>

                <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">
                  Showing {filteredEnterpriseTags.length} tags
                </span>
              </div>

              {filteredEnterpriseTags.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Tag className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-gray-600">
                    No matching {tagFilter !== 'all' ? `${tagFilter}-created` : ''} tags found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredEnterpriseTags.map(tag => {
                    const isAdmin = shortsService.isTagAdminCreated(tag);
                    const usageCount = allShorts.filter(s =>
                      s.tags && s.tags.some(t => t.toLowerCase() === tag.toLowerCase())
                    ).length;

                    return (
                      <div
                        key={tag}
                        className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl flex items-center justify-between gap-2 group hover:border-gray-300 transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="text-xs font-mono font-bold text-gray-900 truncate">
                              {tag.replace(/^#/, '')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isAdmin
                                  ? 'bg-blue-100 text-[#002B7F] border border-blue-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isAdmin ? 'Admin' : 'User'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {usageCount} {usageCount === 1 ? 'reel' : 'reels'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setTagToDelete(tag)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          title={`Delete tag ${tag}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Revoke Modal Dialog */}
      {showRevokeModalForShort && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRevokeModalForShort(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4 animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Revoke Content & Notify Creator</span>
              </h3>
              <button
                onClick={() => setShowRevokeModalForShort(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Revoking will unpublish <strong className="text-gray-900">"{showRevokeModalForShort.title}"</strong>. The employee will receive a notification with the revocation reason.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Reason for Revocation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revokeReasonInput}
                onChange={(e) => setRevokeReasonInput(e.target.value)}
                placeholder="Specify the policy violation or reason why this content is being revoked..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-600 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevokeModalForShort(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={!revokeReasonInput.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Confirm Revoke & Notify
              </button>
            </div>
          </div>
        </div>
      )}

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
              <h3 className="text-base font-bold text-gray-900">Delete Tag?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete tag <strong className="text-gray-900 font-mono">"{tagToDelete}"</strong>?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTagToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTag}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Delete Tag
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

export default ShortsModerationPage;
