import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

export const ShortsModerationPage: React.FC = () => {
  const navigate = useNavigate();

  const [allShorts, setAllShorts] = useState<ShortItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [revokingShortId, setRevokingShortId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadShorts = () => {
    setAllShorts(shortsService.getAllShorts());
  };

  useEffect(() => {
    loadShorts();
    const handleUpdate = () => loadShorts();
    window.addEventListener('jio_shorts_updated', handleUpdate);
    return () => window.removeEventListener('jio_shorts_updated', handleUpdate);
  }, []);

  const counts = useMemo(() => {
    return {
      pending: allShorts.filter(s => s.status === 'pending').length,
      approved: allShorts.filter(s => s.status === 'approved').length,
      rejected: allShorts.filter(s => s.status === 'rejected').length
    };
  }, [allShorts]);

  const filteredShorts = useMemo(() => {
    return allShorts.filter(short => {
      if (short.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = short.title.toLowerCase().includes(q);
        const authorMatch = short.author.name.toLowerCase().includes(q) || short.author.role.toLowerCase().includes(q);
        const tagMatch = short.tags.some(t => t.toLowerCase().includes(q));
        return titleMatch || authorMatch || tagMatch;
      }
      return true;
    });
  }, [allShorts, activeTab, searchQuery]);

  const handleOpenRevoke = (shortId: string) => {
    setRevokingShortId(shortId);
    setRevokeReason('Approval revoked for content review.');
  };

  const handleConfirmRevoke = () => {
    if (!revokingShortId) return;
    shortsService.rejectShort(revokingShortId, revokeReason);
    showToast('⚠️ Approval revoked. Short moved to Rejected queue.');
    setRevokingShortId(null);
    loadShorts();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shorts')}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Back to Shorts"
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
                Audit employee-submitted micro-learning videos, photo decks, and moderate custom learning tags
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shorts/tags')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-[#002B7F]" />
              <span>Enterprise Tags</span>
            </button>
            <button
              onClick={() => navigate('/shorts/settings')}
              className="px-4 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs: Only Pending, Approved, and Rejected */}
          <div className="flex items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Review</span>
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold ml-0.5">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved</span>
              <span className="text-[11px] text-gray-500 font-normal">({counts.approved})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-white text-red-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Rejected</span>
              <span className="text-[11px] text-gray-500 font-normal">({counts.rejected})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, employee, or tag..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B7F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Submissions List */}
        {filteredShorts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3">
            <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">
              No {activeTab} submissions found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'All employee submissions have been audited. Great job!'
                : `There are currently no shorts in the ${activeTab} queue.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredShorts.map(short => {
              const predefinedList = shortsService.getPredefinedTags();
              const hasCustomTags = short.tags.some(t => !predefinedList.includes(t));

              return (
                <div
                  key={short.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Short Overview */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                      className="relative w-20 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 cursor-pointer shadow-xs group"
                    >
                      {short.mediaType === 'video' ? (
                        <video src={short.mediaUrls[0]} className="w-full h-full object-cover" />
                      ) : (
                        <img src={short.mediaUrls[0]} alt={short.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 rounded font-bold uppercase">
                        {short.mediaType}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className="text-sm font-bold text-gray-900 hover:text-[#002B7F] cursor-pointer"
                          onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                        >
                          {short.title}
                        </h3>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            short.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : short.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {short.status}
                        </span>

                        {hasCustomTags && short.status === 'pending' && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                            Custom Tag Review Needed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {short.description || 'No description provided.'}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                        <img
                          src={short.author.avatar}
                          alt={short.author.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-gray-800">{short.author.name}</span>
                        <span>•</span>
                        <span>{short.author.role}</span>
                        <span>•</span>
                        <span>{new Date(short.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        {short.tags.map(tag => {
                          const isPredefined = predefinedList.includes(tag);
                          return (
                            <span
                              key={tag}
                              className={`text-xs px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1.5 ${
                                isPredefined
                                  ? 'bg-blue-50 text-[#002B7F] border border-blue-200'
                                  : 'bg-purple-50 text-purple-800 border border-purple-300 font-bold'
                              }`}
                            >
                              <span>{tag}</span>
                              {!isPredefined && (
                                <span className="text-[9px] text-purple-600 uppercase font-sans font-extrabold">
                                  (new)
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      {short.rejectionReason && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mt-2">
                          <strong>Rejection Reason:</strong> {short.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions Column
                      - Pending: ONLY Audit & Preview button (Approve/Reject happen on subsequent page)
                      - Approved: Audit & Preview + Revoke Approval
                      - Rejected: Audit & Preview
                  */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit & Preview</span>
                    </button>

                    {short.status === 'approved' && (
                      <button
                        onClick={() => handleOpenRevoke(short.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-xs font-bold border border-gray-200 transition-colors"
                      >
                        Revoke Approval
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Revoke Reason Dialog */}
      {revokingShortId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRevokingShortId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Revoke Approval</span>
            </h3>
            <p className="text-xs text-gray-600">
              State the reason for revoking approval. The Short will be unpublished and returned to Rejected state.
            </p>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokingShortId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Revoke Approval
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
