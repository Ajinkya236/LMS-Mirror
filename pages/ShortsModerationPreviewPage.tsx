import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Play,
  Layers,
  Film,
  Tag,
  Check,
  X,
  AlertCircle,
  User,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Flag,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ShortItem, ShortReport, shortsService } from '../services/shortsService';

export const ShortsModerationPreviewPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const [short, setShort] = useState<ShortItem | null>(null);
  const [reports, setReports] = useState<ShortReport[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    if (!shortId) return;
    const found = shortsService.getShortById(shortId);
    if (found) {
      setShort({ ...found });
    }
    setReports(shortsService.getReportsForShort(shortId));
    setPredefinedTags(shortsService.getPredefinedTags());
  };

  useEffect(() => {
    loadData();
  }, [shortId]);

  if (!short) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6 space-y-4">
        <ShieldCheck className="w-12 h-12 text-gray-400" />
        <h2 className="text-lg font-bold">Submission Not Found</h2>
        <button
          onClick={() => navigate('/shorts/moderation')}
          className="px-5 py-2 bg-[#002B7F] text-white rounded-xl text-xs font-bold"
        >
          Return to Moderation Dashboard
        </button>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending');

  // Identify custom tags submitted by creator that are not yet in enterprise tags
  const customTags = short.tags.filter(t => !predefinedTags.includes(t));

  // Approve a single custom tag: Adds to enterprise taxonomy & keeps it on this short
  const handleApproveTag = (tag: string) => {
    shortsService.approveTagForShort(short.id, tag);
    showToast(`🏷️ Tag "${tag}" approved & added to enterprise topics!`);
    loadData();
  };

  // Discard a single custom tag: Removes it from this short so only enterprise tags remain
  const handleRejectTag = (tag: string) => {
    shortsService.rejectTagForShort(short.id, tag);
    showToast(`🗑️ Tag "${tag}" discarded from this short.`);
    loadData();
  };

  // Approve the Short itself
  const handleApproveShort = () => {
    const success = shortsService.approveShort(short.id);
    if (success) {
      showToast('🎉 Short approved & published to employee feed!');
      setTimeout(() => {
        navigate('/shorts/moderation');
      }, 1200);
    }
  };

  // Reject the Short
  const handleConfirmReject = () => {
    const reason = rejectionReason.trim() || 'Content does not meet enterprise technical or compliance guidelines.';
    const success = shortsService.rejectShort(short.id, reason);
    if (success) {
      showToast('❌ Short marked as rejected with feedback.');
      setTimeout(() => {
        navigate('/shorts/moderation');
      }, 1200);
    }
  };

  // Revoke Short with mandatory audit reason
  const handleConfirmRevoke = () => {
    if (!revokeReason.trim()) {
      showToast('⚠️ Please specify an audit revoke reason');
      return;
    }
    shortsService.revokeShortWithReason(short.id, revokeReason.trim());
    showToast('⚠️ Content revoked and unpublished from employee feeds.');
    setShowRevokeDialog(false);
    setTimeout(() => {
      navigate('/shorts/moderation');
    }, 1200);
  };

  // Dismiss Reports and Keep Short Active
  const handleDismissReports = () => {
    shortsService.dismissReportsForShort(short.id);
    showToast('✅ Reports dismissed. Content verified and preserved.');
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/shorts/moderation')}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Back to Moderation List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  Submission & Violation Audit
                </h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    short.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : short.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {short.status}
                </span>

                {pendingReports.length > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 text-red-600" />
                    <span>{pendingReports.length} Open Report{pendingReports.length > 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review video content, audit custom tags, examine violation reports, and publish or revoke
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shorts/tags')}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-[#002B7F]" />
              <span>Enterprise Taxonomy</span>
            </button>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 Cols): Live 9:16 Video / Media Viewport */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  {short.mediaType === 'video' ? <Film className="w-4 h-4 text-blue-600" /> : <Layers className="w-4 h-4 text-emerald-600" />}
                  <span>{short.mediaType === 'video' ? 'Video Player' : 'Photo Carousel'}</span>
                </span>
                <span>{short.durationSeconds ? `${short.durationSeconds}s duration` : ''}</span>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-[9/16] max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200">
                {short.mediaType === 'video' && (
                  <video
                    src={short.mediaUrls[0]}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                {short.mediaType === 'carousel' && (
                  <div className="relative w-full h-full">
                    <img
                      src={short.mediaUrls[carouselIndex]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-20">
                      {short.mediaUrls.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            carouselIndex === i ? 'bg-white w-4' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {short.mediaType === 'photo' && (
                  <img
                    src={short.mediaUrls[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {short.audioTitle && (
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-center gap-2">
                  <span>🎵</span>
                  <span className="font-semibold truncate">{short.audioTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 Cols): Metadata, Reported Violations Audit & Decision */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. REPORTED VIOLATIONS AUDIT CARD (If reports exist) */}
            {pendingReports.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 shadow-xs space-y-4 text-left">
                <div className="border-b border-red-200 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Reported Violation Details ({pendingReports.length})</span>
                  </h3>
                  <span className="text-[10px] font-extrabold bg-red-200 text-red-900 px-2.5 py-0.5 rounded-full uppercase">
                    Audit Action Required
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingReports.map(rep => (
                    <div key={rep.id} className="p-3 bg-white rounded-2xl border border-red-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                          🚩 {rep.reason}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(rep.reportedAt).toLocaleString()}
                        </span>
                      </div>
                      {rep.details && (
                        <p className="text-xs text-gray-700 italic bg-gray-50 p-2 rounded-xl">
                          "{rep.details}"
                        </p>
                      )}
                      <div className="text-[11px] text-gray-500">
                        Reported by: <span className="font-semibold text-gray-800">{rep.reporterName}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audit Decision for Reported Short */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-red-200">
                  <button
                    onClick={() => setShowRevokeDialog(true)}
                    className="w-full sm:flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Revoke Content</span>
                  </button>

                  <button
                    onClick={handleDismissReports}
                    className="w-full sm:flex-1 py-2.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-300 hover:border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Let Stay (Dismiss Reports)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Metadata Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-3 text-left">
              <h2 className="text-base font-bold text-gray-900">{short.title}</h2>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-200">
                {short.description || 'No description provided.'}
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <img src={short.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                <span className="font-semibold text-gray-800">{short.author.name}</span>
                <span>•</span>
                <span>{short.author.department}</span>
              </div>
            </div>

            {/* 3. Custom Tags Audit */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 text-left">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#002B7F]" />
                    <span>Learning Tags Audit</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Decide whether to approve new custom topics into enterprise taxonomy or discard them.
                  </p>
                </div>
                {customTags.length > 0 ? (
                  <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {customTags.length} New Tag{customTags.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Standard Tags
                  </span>
                )}
              </div>

              {customTags.length > 0 && (
                <div className="space-y-2.5">
                  {customTags.map(tag => (
                    <div
                      key={tag}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-mono font-bold text-gray-800 block">
                          {tag.replace(/^#/, '')}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Custom topic suggested by creator
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveTag(tag)}
                          className="px-3 py-1.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Tag</span>
                        </button>

                        <button
                          onClick={() => handleRejectTag(tag)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors border border-gray-300 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Do Not Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags Display: Neutral Gray Styling, NO Colors, NO Hashtags */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  Active Tags on this Short:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {short.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg font-mono font-medium"
                    >
                      {tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Approval / Reject / Revoke Decision Section */}
            {short.status === 'pending' ? (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Submission Approval Decision</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Approve and publish to employee feeds, or reject with feedback.
                  </p>
                </div>

                {!showRejectBox ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleApproveShort}
                      className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Publish Short</span>
                    </button>

                    <button
                      onClick={() => setShowRejectBox(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Reject Short</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 animate-scale-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Rejection Feedback for Creator</span>
                      </span>
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="text-xs text-gray-500 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Describe what the employee needs to fix before resubmitting..."
                      className="w-full p-3 bg-white border border-red-300 rounded-xl text-xs text-gray-900 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
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
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Manage Published Status</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Status: <span className="font-bold text-gray-900 uppercase">{short.status}</span>
                    </p>
                  </div>

                  {short.status === 'approved' && (
                    <button
                      onClick={() => setShowRevokeDialog(true)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Revoke Content</span>
                    </button>
                  )}

                  {short.status === 'rejected' && (
                    <button
                      onClick={() => {
                        shortsService.revokeRejection(short.id);
                        showToast('✅ Rejection revoked. Short approved & published!');
                        loadData();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Revoke Rejection & Approve</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revoke Reason Dialog */}
      {showRevokeDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRevokeDialog(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Revoke Content & Unpublish</span>
            </h3>
            <p className="text-xs text-gray-600">
              Please specify the audit reason for revoking this short. It will be immediately unpublished from employee feeds.
            </p>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-gray-700">
                Audit Revoke Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Reason for revoking (e.g. policy violation, inaccurate technical claim)..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevokeDialog(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Revoke
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

export default ShortsModerationPreviewPage;
