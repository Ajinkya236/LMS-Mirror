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
  Calendar
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

export const ShortsModerationPreviewPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const [short, setShort] = useState<ShortItem | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
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

  // Identify custom tags submitted by creator that are not yet in enterprise tags
  const customTags = short.tags.filter(t => !predefinedTags.includes(t));
  const standardEnterpriseTags = short.tags.filter(t => predefinedTags.includes(t));

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
                  Submission Audit & Tag Review
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
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review video content, audit custom tags, and publish or reject
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
                      src={short.mediaUrls[carouselIndex] || short.mediaUrls[0]}
                      alt={short.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 inset-x-0 flex justify-center gap-1 px-4">
                      {short.mediaUrls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCarouselIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            carouselIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {short.mediaType === 'photo' && (
                  <img
                    src={short.mediaUrls[0]}
                    alt={short.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {short.audioTitle && (
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                  <span>🎵</span>
                  <span className="font-semibold truncate">{short.audioTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 Cols): Step-by-Step Moderation & Custom Tag Review Workflow */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Submission Details Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="text-left space-y-2">
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                  {short.title}
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  {short.description || 'No description provided.'}
                </p>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                <img
                  src={short.author.avatar}
                  alt={short.author.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900">{short.author.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {short.author.role} • {short.author.department}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Step 1: Custom Tags Moderation Workflow */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 text-left">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#002B7F]" />
                    <span>Step 1: Custom Tags Audit</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Decide whether to approve new custom topics into enterprise taxonomy or discard them.
                  </p>
                </div>
                {customTags.length > 0 ? (
                  <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {customTags.length} New Tag{customTags.length > 1 ? 's' : ''} Submitted
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> All Tags Standard
                  </span>
                )}
              </div>

              {/* Scenario A: Creator submitted custom tags not yet in enterprise list */}
              {customTags.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-700">
                    The creator suggested the following custom tag(s). You can choose to:
                  </p>
                  <div className="space-y-2.5">
                    {customTags.map(tag => (
                      <div
                        key={tag}
                        className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-mono font-bold text-purple-900 block">
                            {tag}
                          </span>
                          <span className="text-[10px] text-purple-700">
                            Custom tag not currently in enterprise tags
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveTag(tag)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                            title="Add tag to global enterprise taxonomy and keep on this short"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Tag</span>
                          </button>

                          <button
                            onClick={() => handleRejectTag(tag)}
                            className="px-3 py-1.5 bg-gray-200 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl text-xs font-bold transition-colors border border-gray-300"
                            title="Discard custom tag so only existing enterprise tags will be used"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Do Not Approve</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    All tags on this submission match verified enterprise learning topics.
                  </span>
                </div>
              )}

              {/* Display Current Active Tags on this short */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  Tags that will be published with this Short:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {short.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-blue-50 text-[#002B7F] border border-blue-200 rounded-lg font-mono font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Step 2: Final Short Approval & Publishing Decision */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4 text-left">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Video Content Approval Decision</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Once you have reviewed the video and finalized the tags, approve or reject the submission.
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
          </div>
        </div>
      </div>

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
