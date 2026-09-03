// components/forms/ResponseDetailModal.tsx
import React, { useState } from 'react';
import { FormSubmissionRecord, LMSForm } from '../../types/forms';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Mail,
  Briefcase,
  FileText,
  Star,
  Printer,
  Trash2,
  Download,
  ThumbsUp,
  Heart,
  HelpCircle,
  Check,
  AlertCircle
} from 'lucide-react';

interface ResponseDetailModalProps {
  response: FormSubmissionRecord | null;
  form?: LMSForm;
  isOpen: boolean;
  onClose: () => void;
  onDeleteResponse: (responseId: string) => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  response,
  form,
  isOpen,
  onClose,
  onDeleteResponse,
}) => {
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  if (!isOpen || !response) return null;

  const isQuiz = response.formType === 'Quiz' || form?.type === 'Quiz' || response.score !== undefined;
  const isPassed = response.passed ?? (isQuiz && (response.score || 0) >= (form?.settings?.passPercentage || 75));

  const handleDelete = () => {
    onDeleteResponse(response.id);
    setIsConfirmDelete(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative flex-shrink-0 print:bg-slate-900">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-r-blue/30 text-sky-300 border border-sky-400/30">
              {response.formFid || form?.fid || 'FID-RESP'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white/10 text-slate-200">
              {response.formType || form?.type || 'Assessment'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
              ID: {response.id}
            </span>
          </div>

          <h2 className="text-xl font-bold font-heading text-white line-clamp-1">
            {response.formTitle || form?.title || 'Form Assessment Submission'}
          </h2>

          {/* Respondent Metadata bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center flex-shrink-0">
                {(response.respondentName || 'A').charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{response.respondentName || 'Anonymous Learner'}</div>
                <div className="text-slate-400 text-[11px] truncate">{response.respondentEmail || 'N/A'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Submitted At</div>
                <div className="font-semibold text-white">
                  {new Date(response.submittedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Organizational Role</div>
                <div className="font-semibold text-white truncate">
                  {response.respondentRole || 'Learner Cohort Member'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quiz Performance Banner (if Quiz) */}
          {isQuiz && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                  isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {isPassed ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <span>Performance Assessment Result</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isPassed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Passing threshold benchmark was <strong>{form?.settings?.passPercentage || 75}%</strong>. Attempt #{response.attemptNumber || 1}.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Score</div>
                  <div className="text-2xl font-black font-heading text-slate-900">
                    {response.score ?? 0}%
                  </div>
                </div>
                {response.totalPoints && (
                  <div className="text-right pl-4 border-l border-slate-300">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Points</div>
                    <div className="text-lg font-black text-slate-800">
                      {Math.round(((response.score ?? 0) / 100) * response.totalPoints)} / {response.totalPoints}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Question-by-Question breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-r-blue" />
              Detailed Responses & Answers Log ({response.answers?.length || 0} Questions)
            </h3>

            {(!response.answers || response.answers.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                No recorded response items available for this submission record.
              </div>
            ) : (
              response.answers.map((ans, idx) => {
                const isItemQuiz = ans.isCorrect !== undefined;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-3 transition-colors ${
                      isItemQuiz
                        ? ans.isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    {/* Question Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {ans.questionTitle}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Type: {ans.questionType.replace('_', ' ')}
                            {ans.pointsAwarded !== undefined ? ` • ${ans.pointsAwarded} pts awarded` : ''}
                          </span>
                        </div>
                      </div>

                      {isItemQuiz && (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 flex-shrink-0 ${
                          ans.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {ans.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {ans.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    {/* Answer Value Rendering by Question Type */}
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs">
                      {/* Rating Type */}
                      {ans.questionType === 'rating' && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                className={`w-4 h-4 ${
                                  sIdx < Number(ans.value)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-extrabold text-slate-800 text-sm">
                            {ans.value} / 5 Stars
                          </span>
                        </div>
                      )}

                      {/* NPS Type */}
                      {ans.questionType === 'nps' && (
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                            {ans.value}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            Number(ans.value) >= 9
                              ? 'bg-emerald-100 text-emerald-800'
                              : Number(ans.value) >= 7
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {Number(ans.value) >= 9 ? 'Promoter (9-10)' : Number(ans.value) >= 7 ? 'Passive (7-8)' : 'Detractor (0-6)'}
                          </span>
                        </div>
                      )}

                      {/* Likert Matrix Type */}
                      {ans.questionType === 'likert' && typeof ans.value === 'object' && ans.value !== null && (
                        <div className="space-y-2 divide-y divide-slate-100">
                          {Object.entries(ans.value).map(([stmt, opt], sIdx) => (
                            <div key={sIdx} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-slate-700 font-medium">{stmt}</span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-r-blue font-bold text-xs border border-blue-200 self-start sm:self-auto">
                                {String(opt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Choice / Single / Multiple / Dropdown / YesNo */}
                      {(ans.questionType === 'choice' || ans.questionType === 'single_choice' || ans.questionType === 'multiple_choice' || ans.questionType === 'yes_no') && (
                        <div className="space-y-1">
                          <div className="text-slate-500 text-[11px] font-semibold">Selected Answer:</div>
                          {Array.isArray(ans.value) ? (
                            <div className="flex flex-wrap gap-1.5">
                              {ans.value.map((v, vIdx) => (
                                <span key={vIdx} className="px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-200">
                                  {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="font-bold text-slate-900 text-sm">
                              {String(ans.value || 'No answer')}
                            </div>
                          )}
                          {ans.otherValue && (
                            <div className="text-slate-500 italic text-[11px] mt-1">
                              Other text specified: "{ans.otherValue}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Number Type */}
                      {ans.questionType === 'number' && (
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                          <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                            {ans.value}
                          </span>
                        </div>
                      )}

                      {/* Text Type (Short / Long) */}
                      {(ans.questionType === 'long_text' || ans.questionType === 'short_text' || ans.questionType === 'text') && (
                        <div className="space-y-1">
                          <div className="text-slate-500 text-[11px] font-semibold">Qualitative Feedback:</div>
                          <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                            {ans.value ? `"${ans.value}"` : <span className="text-slate-400 italic">No feedback provided.</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 print:hidden">
          {/* Delete prompt confirmation */}
          {isConfirmDelete ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs font-bold text-rose-700">Confirm delete submission record?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setIsConfirmDelete(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmDelete(true)}
              className="px-3 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Response</span>
            </button>
          )}

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Submission</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResponseDetailModal;
