import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Film,
  User,
  Clock,
  Trash2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { ShortItem, shortsService, ShortStatus } from '../../services/shortsService';

interface ModerationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onUpdate: () => void;
}

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  isOpen,
  onClose,
  onToast,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<ShortStatus>('pending');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedShortForPreview, setSelectedShortForPreview] = useState<ShortItem | null>(null);
  const [rejectingShortId, setRejectingShortId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const allShorts = shortsService.getAllShorts();

  const pendingCount = allShorts.filter(s => s.status === 'pending').length;
  const approvedCount = allShorts.filter(s => s.status === 'approved').length;
  const rejectedCount = allShorts.filter(s => s.status === 'rejected').length;

  const filteredShorts = useMemo(() => {
    return allShorts.filter(short => {
      if (short.status !== activeTab) return false;
      if (searchTitle.trim() && !short.title.toLowerCase().includes(searchTitle.toLowerCase())) {
        return false;
      }
      if (
        searchAuthor.trim() &&
        !short.author.name.toLowerCase().includes(searchAuthor.toLowerCase()) &&
        !short.author.department.toLowerCase().includes(searchAuthor.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allShorts, activeTab, searchTitle, searchAuthor]);

  if (!isOpen) return null;

  const handleApprove = (shortId: string, title: string) => {
    shortsService.approveShort(shortId);
    onToast(`✅ Approved "${title}" — Now visible in public Shorts feed!`);
    onUpdate();
    if (selectedShortForPreview?.id === shortId) {
      setSelectedShortForPreview(null);
    }
  };

  const handleStartReject = (short: ShortItem) => {
    setRejectingShortId(short.id);
    setRejectionReason('Does not adhere to enterprise learning quality benchmarks.');
  };

  const handleConfirmReject = () => {
    if (!rejectingShortId) return;
    shortsService.rejectShort(rejectingShortId, rejectionReason);
    onToast(`❌ Short rejected and feedback logged.`);
    setRejectingShortId(null);
    setRejectionReason('');
    onUpdate();
    if (selectedShortForPreview?.id === rejectingShortId) {
      setSelectedShortForPreview(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-5xl w-full p-5 sm:p-7 border border-gray-100 space-y-5 animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Content Manager Moderation Dashboard
              </h2>
              <p className="text-xs text-gray-500">
                Review, audit, approve or reject submitted Learning Shorts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-white text-[#002B7F] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-100 text-amber-900 font-extrabold">
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approved Feed</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-red-100 text-red-800 font-extrabold">
                {rejectedCount}
              </span>
            </button>
          </div>

          {/* Search Inputs (By Title & By Employee/Uploader) */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#002B7F]"
              />
            </div>
            <div className="relative flex-1">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by uploader..."
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#002B7F]"
              />
            </div>
          </div>
        </div>

        {/* Content List & Preview Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
          {filteredShorts.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Film className="w-9 h-9 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">No {activeTab} Short submissions found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Try clearing search filters or checking other tabs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredShorts.map(short => (
                <div
                  key={short.id}
                  className="p-3.5 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Short Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      onClick={() => setSelectedShortForPreview(short)}
                      className="relative w-16 h-24 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer group shadow-xs"
                    >
                      {short.mediaType === 'video' ? (
                        <video src={short.mediaUrls[0]} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={short.mediaUrls[0]} alt={short.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded bg-black/70 text-white uppercase">
                        {short.mediaType}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {short.title}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            short.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : short.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {short.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-1">
                        {short.description || 'No description provided'}
                      </p>

                      {/* Author & Timestamp */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 pt-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                          <img
                            src={short.author.avatar}
                            alt={short.author.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{short.author.name}</span>
                        </div>
                        <span>•</span>
                        <span>{short.author.department}</span>
                        <span>•</span>
                        <span>{new Date(short.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {short.tags.map(t => (
                          <span
                            key={t}
                            className="text-[10px] bg-blue-50 text-[#002B7F] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {short.rejectionReason && (
                        <p className="text-xs text-red-600 font-semibold pt-1">
                          Rejection Reason: {short.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedShortForPreview(short)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {short.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(short.id, short.title)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {short.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleStartReject(short)}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors border border-red-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejection Feedback Dialog */}
        {rejectingShortId && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3 animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Provide Reason for Rejection</span>
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain to the learner what needs improvement before resubmitting..."
              rows={2}
              className="w-full text-xs p-2.5 bg-white border border-red-300 rounded-xl focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingShortId(null)}
                className="px-3 py-1.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Vertical Preview Modal */}
        {selectedShortForPreview && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100000] flex items-center justify-center p-4"
            onClick={() => setSelectedShortForPreview(null)}
          >
            <div
              className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="relative z-10 flex items-center justify-between text-white">
                <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Review Preview
                </span>
                <button
                  onClick={() => setSelectedShortForPreview(null)}
                  className="p-1 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Background Media Player */}
              <div className="absolute inset-0 z-0">
                {selectedShortForPreview.mediaType === 'video' ? (
                  <video
                    src={selectedShortForPreview.mediaUrls[0]}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={selectedShortForPreview.mediaUrls[0]}
                    alt={selectedShortForPreview.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
              </div>

              {/* Bottom Overlay & Moderation Decision */}
              <div className="relative z-10 space-y-3 text-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedShortForPreview.author.avatar}
                      alt={selectedShortForPreview.author.name}
                      className="w-7 h-7 rounded-full border border-white/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold">{selectedShortForPreview.author.name}</h4>
                      <p className="text-[10px] text-gray-300">{selectedShortForPreview.author.role}</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold">{selectedShortForPreview.title}</h3>
                  <p className="text-xs text-gray-200 line-clamp-2">{selectedShortForPreview.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedShortForPreview.tags.map(t => (
                      <span key={t} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Approve/Reject in Preview */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                  <button
                    onClick={() => handleApprove(selectedShortForPreview.id, selectedShortForPreview.title)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve to Public Feed</span>
                  </button>
                  <button
                    onClick={() => {
                      const s = selectedShortForPreview;
                      setSelectedShortForPreview(null);
                      handleStartReject(s);
                    }}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationDashboard;
