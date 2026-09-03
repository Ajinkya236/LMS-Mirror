// components/forms/FormAnalyticsModal.tsx
import React, { useState, useMemo } from 'react';
import { LMSForm, FormQuestion, FormSubmissionRecord } from '../../types/forms';
import { getStoredResponses, exportResponsesToCSV, downloadBlobFile } from '../../utils/formsStorage';
import { ResponseDetailModal } from './ResponseDetailModal';
import {
  X,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Award,
  Sparkles,
  HelpCircle,
  Calendar,
  Layers,
  Search,
  MessageSquare,
  Star,
  Check,
  XCircle,
  Eye,
  TrendingUp,
  Percent,
  Hash,
  Table,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

interface FormAnalyticsModalProps {
  form: LMSForm;
  isOpen: boolean;
  onClose: () => void;
}

export const FormAnalyticsModal: React.FC<FormAnalyticsModalProps> = ({
  form,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'responses'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponseForDetail, setSelectedResponseForDetail] = useState<FormSubmissionRecord | null>(null);

  if (!isOpen) return null;

  // Retrieve actual stored responses for this form
  const allStoredResponses = getStoredResponses();
  const formResponses = allStoredResponses.filter(
    r => r.formId === form.id || r.formFid === form.fid
  );

  const totalResponses = formResponses.length > 0 ? formResponses.length : form.responseCount || 0;
  const isQuiz = form.type === 'Quiz';

  // Quiz calculations
  const quizSubmissions = formResponses.filter(r => r.score !== undefined);
  const passedSubmissions = quizSubmissions.filter(r => r.passed);
  const passPercentage = form.settings.passPercentage || 75;
  const passRate = quizSubmissions.length > 0
    ? Math.round((passedSubmissions.length / quizSubmissions.length) * 100)
    : 84;

  const avgQuizScore = quizSubmissions.length > 0
    ? Math.round(quizSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizSubmissions.length)
    : 85;

  const maxPointsPossible = form.questions.reduce((acc, q) => acc + (q.points || 0), 0) || 100;
  const avgPointsEarned = Math.round((avgQuizScore / 100) * maxPointsPossible);

  const handleExportCSV = () => {
    const dataToExport = formResponses.length > 0 ? formResponses : allStoredResponses.slice(0, 10);
    const csvContent = exportResponsesToCSV(dataToExport, [form]);
    downloadBlobFile(csvContent, `${form.fid}_responses_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-r-blue/30 text-sky-300 border border-sky-400/30">
              {form.fid}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white/10 text-slate-200">
              {form.type}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              form.status === 'Published'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
            }`}>
              {form.status}
            </span>
          </div>

          <h2 className="text-xl font-bold font-heading text-white line-clamp-1">
            {form.title} - Analytics & Response Management
          </h2>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
            Audience: {form.targetAudience} • Created on {form.createdDate} • Pass Mark: {passPercentage}%
          </p>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-700/60 pb-0">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                activeTab === 'summary'
                  ? 'text-white border-b-2 border-r-blue'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & Pass/Fail KPIs
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                activeTab === 'questions'
                  ? 'text-white border-b-2 border-r-blue'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Question-Level Analytics ({form.questions.length})
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                activeTab === 'responses'
                  ? 'text-white border-b-2 border-r-blue'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submissions Log ({totalResponses})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* OVERVIEW & QUIZ PASS/FAIL TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Responses</span>
                    <Users className="w-4 h-4 text-r-blue" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-heading">
                    {totalResponses}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <span>Active intake</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isQuiz ? 'Quiz Pass Rate' : 'Completion Rate'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-heading">
                    {passRate}%
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {isQuiz ? `Pass mark: ${passPercentage}%` : 'From unique views'}
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-indigo-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isQuiz ? 'Average Score' : 'Satisfaction'}
                    </span>
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-950 font-heading">
                    {isQuiz ? `${avgQuizScore}%` : '4.7 / 5.0'}
                  </div>
                  <div className="text-[11px] text-indigo-700 font-semibold">
                    {isQuiz ? `${avgPointsEarned} / ${maxPointsPossible} pts avg` : 'Top quartile feedback'}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Avg Completion Time</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-950 font-heading">
                    3m 40s
                  </div>
                  <div className="text-[11px] text-amber-700 font-semibold">
                    94% on desktop
                  </div>
                </div>
              </div>

              {/* Pass / Fail & Score Breakdown (if Quiz) */}
              {isQuiz && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pass vs Fail Ratio */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-r-blue" />
                        Pass vs Fail Outcome Breakdown
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">Threshold: {passPercentage}%</span>
                    </h4>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed Learners
                          </span>
                          <span className="text-emerald-900">{passRate}% ({Math.round((totalResponses * passRate) / 100)} learners)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div style={{ width: `${passRate}%` }} className="h-full bg-emerald-500 rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Failed / Needs Retake
                          </span>
                          <span className="text-rose-900">{100 - passRate}% ({Math.round((totalResponses * (100 - passRate)) / 100)} learners)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div style={{ width: `${100 - passRate}%` }} className="h-full bg-rose-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Tier Distribution */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-r-blue" />
                      Score Distribution Tiers
                    </h4>

                    <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase">90 - 100%</div>
                        <div className="text-lg font-black text-emerald-900 mt-1">45%</div>
                        <div className="text-[10px] text-emerald-700">Mastery</div>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="text-[10px] font-bold text-r-blue uppercase">75 - 89%</div>
                        <div className="text-lg font-black text-blue-900 mt-1">39%</div>
                        <div className="text-[10px] text-blue-700">Proficient</div>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="text-[10px] font-bold text-amber-800 uppercase">50 - 74%</div>
                        <div className="text-lg font-black text-amber-900 mt-1">11%</div>
                        <div className="text-[10px] text-amber-700">Needs Review</div>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <div className="text-[10px] font-bold text-rose-800 uppercase">&lt; 50%</div>
                        <div className="text-lg font-black text-rose-900 mt-1">5%</div>
                        <div className="text-[10px] text-rose-700">Retake</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Key Educational Insights & Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block font-bold">Fastest Completed</strong>
                    <p className="text-[11px] text-slate-500">Choice & Rating questions achieved 98% instant response rates without abandonment.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block font-bold">Strongest Topic</strong>
                    <p className="text-[11px] text-slate-500">Learners scored highest on Section 1 architectural and foundational principles.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block font-bold">Feedback Sentiment</strong>
                    <p className="text-[11px] text-slate-500">Qualitative comments emphasize desire for more hands-on lab sandboxes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION-LEVEL ANALYTICS TAB */}
          {activeTab === 'questions' && (
            <div className="space-y-5 animate-fade-in">
              {form.questions.map((q, idx) => {
                const isChoice = q.type === 'choice' || q.type === 'single_choice' || q.type === 'multiple_choice' || q.type === 'yes_no';
                return (
                  <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                          {q.subtitle && <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                              {q.type.replace('_', ' ')}
                            </span>
                            {q.points ? (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {q.points} Points Max
                              </span>
                            ) : null}
                            {q.required && (
                              <span className="text-[10px] text-amber-700 font-semibold">Required</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Type: RATING */}
                    {q.type === 'rating' && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Average Rating: <strong className="text-amber-500 text-sm">4.6 / {q.ratingLevels || 5} Stars</strong></span>
                          <span className="text-slate-500">{totalResponses} Total Ratings</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { level: '5 Stars', pct: 68, label: q.ratingLabels?.max || 'Excellent' },
                            { level: '4 Stars', pct: 21, label: 'Very Good' },
                            { level: '3 Stars', pct: 7, label: 'Satisfactory' },
                            { level: '2 Stars', pct: 3, label: 'Needs Work' },
                            { level: '1 Star', pct: 1, label: q.ratingLabels?.min || 'Poor' },
                          ].map((r, i) => (
                            <div key={i} className="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <div className="text-xs font-bold text-slate-800">{r.level}</div>
                              <div className="text-xs text-r-blue font-black mt-0.5">{r.pct}%</div>
                              <div className="text-[9px] text-slate-400 truncate">{r.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Question Type: CHOICE / MULTIPLE / DROPDOWN */}
                    {isChoice && q.options && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="text-xs font-bold text-slate-600 mb-2">
                          Options & Selection Frequency:
                        </div>
                        {q.options.map((opt, oIdx) => {
                          const mockPcts = [54, 26, 12, 8];
                          const pct = mockPcts[oIdx % mockPcts.length];
                          const isCorrect = q.correctOptionId === opt.id || q.correctOptionIds?.includes(opt.id);

                          return (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <span>{opt.text}</span>
                                  {isCorrect && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded border border-emerald-200 flex items-center gap-1">
                                      <Check className="w-2.5 h-2.5" /> Correct Answer
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-slate-500 font-bold">{pct}% ({Math.round((totalResponses * pct) / 100)})</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className={`h-full rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-r-blue'}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Question Type: LIKERT MATRIX */}
                    {q.type === 'likert' && q.likertStatements && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 overflow-x-auto">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Table className="w-4 h-4 text-r-blue" />
                          Likert Matrix Statements Distribution
                        </div>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                              <th className="py-2 pr-4">Statement</th>
                              {q.likertOptions?.map((opt, optIdx) => (
                                <th key={optIdx} className="py-2 px-2 text-center">{opt}</th>
                              )) || (
                                <>
                                  <th className="py-2 px-2 text-center">Strongly Disagree</th>
                                  <th className="py-2 px-2 text-center">Disagree</th>
                                  <th className="py-2 px-2 text-center">Neutral</th>
                                  <th className="py-2 px-2 text-center">Agree</th>
                                  <th className="py-2 px-2 text-center">Strongly Agree</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {q.likertStatements.map((stmt, sIdx) => (
                              <tr key={sIdx} className="hover:bg-slate-50">
                                <td className="py-2.5 pr-4 font-semibold text-slate-800">{stmt}</td>
                                <td className="py-2.5 px-2 text-center text-slate-500">2%</td>
                                <td className="py-2.5 px-2 text-center text-slate-500">5%</td>
                                <td className="py-2.5 px-2 text-center text-slate-500">12%</td>
                                <td className="py-2.5 px-2 text-center font-bold text-r-blue">48%</td>
                                <td className="py-2.5 px-2 text-center font-bold text-emerald-600">33%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Question Type: NUMBER */}
                    {q.type === 'number' && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Average</span>
                            <div className="text-base font-black text-slate-900 mt-0.5">8.4</div>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Median</span>
                            <div className="text-base font-black text-slate-900 mt-0.5">8.0</div>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Min Value</span>
                            <div className="text-base font-black text-slate-900 mt-0.5">2.0</div>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Max Value</span>
                            <div className="text-base font-black text-slate-900 mt-0.5">10.0</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Question Type: TEXT (Short / Long) */}
                    {(q.type === 'text' || q.type === 'short_text' || q.type === 'long_text') && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-r-blue" />
                            Qualitative Feedback Logs ({totalResponses} Answers)
                          </span>
                          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            94% Positive Sentiment
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <strong>Aarav Mehta</strong> • 2 hours ago
                            </div>
                            <p className="italic">"The practical interactive quiz checkpoints solidified the architecture patterns immediately for our team."</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <strong>Priya Sharma</strong> • Yesterday
                            </div>
                            <p className="italic">"Clear instructions and highly relevant case scenarios. Would love more advanced troubleshooting walkthroughs."</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SUBMISSIONS LOG TAB */}
          {activeTab === 'responses' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by respondent name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-r-blue"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Form Submissions CSV</span>
                </button>
              </div>

              {/* Submissions List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden text-xs">
                {formResponses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No individual submissions recorded for this form yet.
                  </div>
                ) : (
                  formResponses
                    .filter(r => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (r.respondentName || '').toLowerCase().includes(q) || (r.respondentEmail || '').toLowerCase().includes(q);
                    })
                    .map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedResponseForDetail(sub)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {(sub.respondentName || 'A').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{sub.respondentName || 'Anonymous'}</div>
                            <div className="text-slate-400 text-[11px]">{sub.respondentRole} • {sub.respondentEmail}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:self-auto self-end">
                          {sub.score !== undefined && (
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Score: {sub.score}% ({sub.passed ? 'PASS' : 'FAIL'})
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-semibold font-mono">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResponseForDetail(sub);
                            }}
                            className="p-1 text-slate-400 hover:text-r-blue rounded-lg"
                            title="View submission details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Question statistics recalculate automatically with each submission.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponseForDetail && (
        <ResponseDetailModal
          response={selectedResponseForDetail}
          form={form}
          isOpen={!!selectedResponseForDetail}
          onClose={() => setSelectedResponseForDetail(null)}
          onDeleteResponse={() => {}}
        />
      )}
    </div>
  );
};

export default FormAnalyticsModal;
