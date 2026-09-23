import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  Search,
  X,
  Play,
  Layers,
  Film,
  Tag,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

export const ShortsModerationPage: React.FC = () => {
  const navigate = useNavigate();

  const [allShorts, setAllShorts] = useState<ShortItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShort, setSelectedShort] = useState<ShortItem | null>(null);
  const [rejectingShortId, setRejectingShortId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
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

  const handleApproveShort = (shortId: string) => {
    const success = shortsService.approveShort(shortId);
    if (success) {
      showToast('✅ Short approved and published to employee feed!');
      if (selectedShort?.id === shortId) {
        setSelectedShort(null);
      }
    }
  };

  const handleOpenReject = (shortId: string) => {
    setRejectingShortId(shortId);
    setRejectionReason('Content does not meet enterprise technical accuracy or presentation standards.');
  };

  const handleConfirmReject = () => {
    if (!rejectingShortId) return;
    const success = shortsService.rejectShort(rejectingShortId, rejectionReason);
    if (success) {
      showToast('❌ Short marked as Rejected with feedback.');
      setRejectingShortId(null);
      if (selectedShort?.id === rejectingShortId) {
        setSelectedShort(null);
      }
    }
  };

  const handleApproveTag = (shortId: string, tag: string) => {
    shortsService.approveTagForShort(shortId, tag);
    showToast(`🏷️ Tag "${tag}" approved & added to enterprise topics!`);
    loadShorts();
    if (selectedShort && selectedShort.id === shortId) {
      setSelectedShort(shortsService.getShortById(shortId) || null);
    }
  };

  const handleRejectTag = (shortId: string, tag: string) => {
    shortsService.rejectTagForShort(shortId, tag);
    showToast(`🗑️ Tag "${tag}" removed from submission.`);
    loadShorts();
    if (selectedShort && selectedShort.id === shortId) {
      setSelectedShort(shortsService.getShortById(shortId) || null);
    }
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
              <span>Manage Enterprise Tags</span>
            </button>
            <button
              onClick={() => navigate('/shorts/settings')}
              className="px-4 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Engine Settings
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

          {/* Single Search Bar */}
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
              const customShortTags = short.tags.filter(t => !predefinedList.includes(t));

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

                      {/* Tags & Tag Moderation Actions */}
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
                              {!isPredefined && short.status === 'pending' && (
                                <span className="flex items-center gap-1 ml-1 border-l border-purple-200 pl-1">
                                  <button
                                    onClick={() => handleApproveTag(short.id, tag)}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-0.2 rounded font-sans font-bold"
                                    title="Approve & add to enterprise tags"
                                  >
                                    Approve Tag
                                  </button>
                                  <button
                                    onClick={() => handleRejectTag(short.id, tag)}
                                    className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.2 rounded font-sans font-bold"
                                    title="Remove invalid tag"
                                  >
                                    Remove
                                  </button>
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

                  {/* Right: Actions (Approve / Reject) - No Delete Button */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => navigate(`/shorts/moderation/preview/${short.id}`)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-[#002B7F] hover:text-white text-gray-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Audit & Preview
                    </button>

                    {short.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveShort(short.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(short.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {short.status === 'rejected' && (
                      <button
                        onClick={() => handleApproveShort(short.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Re-Approve
                      </button>
                    )}

                    {short.status === 'approved' && (
                      <button
                        onClick={() => handleOpenReject(short.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-xs font-bold border border-gray-200"
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

      {/* Preview Modal */}
      {selectedShort && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedShort(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#002B7F]" />
                <span>Short Details & Audit Preview</span>
              </h3>
              <button
                onClick={() => setSelectedShort(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player */}
            <div className="relative aspect-[9/16] max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-black shadow-lg">
              {selectedShort.mediaType === 'video' ? (
                <video src={selectedShort.mediaUrls[0]} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <img src={selectedShort.mediaUrls[0]} alt={selectedShort.title} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-3 text-left">
              <div>
                <h4 className="text-base font-bold text-gray-900">{selectedShort.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{selectedShort.description}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                <img src={selectedShort.author.avatar} alt={selectedShort.author.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-gray-900">{selectedShort.author.name}</div>
                  <div className="text-[11px] text-gray-500">{selectedShort.author.role} • {selectedShort.author.department}</div>
                </div>
              </div>

              {/* Tags with Approval */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 block">Submitted Learning Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedShort.tags.map(tag => {
                    const isPredefined = shortsService.getPredefinedTags().includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 ${
                          isPredefined ? 'bg-blue-50 text-[#002B7F] border border-blue-200' : 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                        }`}
                      >
                        <span>{tag}</span>
                        {!isPredefined && (
                          <button
                            onClick={() => handleApproveTag(selectedShort.id, tag)}
                            className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold hover:bg-emerald-700"
                          >
                            Approve Tag
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedShort(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>

              {selectedShort.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenReject(selectedShort.id)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Reject Short
                  </button>
                  <button
                    onClick={() => handleApproveShort(selectedShort.id)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Approve Short
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectingShortId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRejectingShortId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Reject Submission with Reason</span>
            </h3>
            <p className="text-xs text-gray-600">
              Provide feedback for the creator so they can adjust and resubmit.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingShortId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Rejection
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
