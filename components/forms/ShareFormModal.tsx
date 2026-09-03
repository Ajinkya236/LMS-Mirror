// components/forms/ShareFormModal.tsx
import React, { useState } from 'react';
import { LMSForm } from '../../types/forms';
import { regenerateFormToken } from '../../utils/formsStorage';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Share2,
  Globe,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Calendar,
  Lock
} from 'lucide-react';

interface ShareFormModalProps {
  form: LMSForm;
  isOpen: boolean;
  onClose: () => void;
  onTokenRegenerated: (updatedForm: LMSForm) => void;
}

export const ShareFormModal: React.FC<ShareFormModalProps> = ({
  form,
  isOpen,
  onClose,
  onTokenRegenerated
}) => {
  const [copied, setCopied] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  // Build the full shareable URL
  const origin = window.location.origin;
  const shareableUrl = `${origin}/#/nfb/${form.token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const result = regenerateFormToken(form.id);
      if (result.form) {
        onTokenRegenerated(result.form);
      }
      setIsRegenerating(false);
      setShowRegenConfirm(false);
      setCopied(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-nav-blue to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/20">
                  {form.fid}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {form.type} Form
                </span>
              </div>
              <h3 className="text-lg font-bold font-heading text-white mt-0.5 line-clamp-1">
                {form.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Alert */}
          {form.status !== 'Published' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold">Form is currently marked as <span className="uppercase">{form.status}</span></p>
                <p className="mt-0.5 text-amber-800">
                  Learners will not be able to submit responses until this form is published. You can test preview responses below.
                </p>
              </div>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-r-blue" />
                Shareable Respondent Link (`/nfb/{'{token}'}`)
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Token: {form.token}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 break-all select-all flex items-center justify-between">
                <span className="text-slate-700 truncate">{shareableUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-r-blue hover:bg-r-blue-dark text-white active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Access:</strong> {form.settings.allowAnonymous ? 'Anonymous Allowed' : 'Enterprise Auth Required'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-r-blue" />
              <span>
                <strong>Expiry:</strong> {form.endDate ? form.endDate : 'Open Ended'}
              </span>
            </div>
          </div>

          {/* Actions: Open & Regenerate */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-3">
              <a
                href={`/#/nfb/${form.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Respondent View in New Tab</span>
              </a>

              {!showRegenConfirm && (
                <button
                  type="button"
                  onClick={() => setShowRegenConfirm(true)}
                  className="px-3.5 py-2.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Regenerate Link Token"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Link</span>
                </button>
              )}
            </div>

            {/* Regenerate Warning Confirmation */}
            {showRegenConfirm && (
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">Are you sure you want to regenerate this link?</p>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      This will generate a brand new token. Any previously distributed links will immediately become invalid.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegenConfirm(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isRegenerating}
                    onClick={handleRegenerate}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    {isRegenerating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm & Generate New Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
