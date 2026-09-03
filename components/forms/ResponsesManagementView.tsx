// components/forms/ResponsesManagementView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { LMSForm, FormSubmissionRecord } from '../../types/forms';
import {
  deleteResponse,
  bulkDeleteResponses,
  simulateIncomingResponse,
  exportResponsesToCSV,
  downloadBlobFile
} from '../../utils/formsStorage';
import { ResponseDetailModal } from './ResponseDetailModal';
import {
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  User,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Zap,
  Radio,
  Clock,
  Star,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Bell
} from 'lucide-react';

interface ResponsesManagementViewProps {
  forms: LMSForm[];
  responses: FormSubmissionRecord[];
  onRefresh: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ResponsesManagementView: React.FC<ResponsesManagementViewProps> = ({
  forms,
  responses,
  onRefresh,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('All');
  const [formIdFilter, setFormIdFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score' | 'respondent'>('newest');

  // Selected response for Detail Modal
  const [selectedResponse, setSelectedResponse] = useState<FormSubmissionRecord | null>(null);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Real-time live incoming notification banner
  const [recentLiveSubmission, setRecentLiveSubmission] = useState<FormSubmissionRecord | null>(null);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'single' | 'selected';
    responseId?: string;
    title?: string;
  }>({
    isOpen: false,
    type: 'single'
  });

  // Auto-stream simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isAutoStreaming) {
      interval = setInterval(() => {
        const newSub = simulateIncomingResponse();
        setRecentLiveSubmission(newSub);
        onRefresh();
        onShowToast(`New live submission received from ${newSub.respondentName} (${newSub.formFid})!`, 'info');
      }, 12000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoStreaming]);

  // Overall Statistics
  const totalResponsesCount = responses.length;
  const quizResponses = responses.filter(r => r.score !== undefined);
  const passedQuizResponses = quizResponses.filter(r => r.passed);
  const avgQuizPassRate = quizResponses.length > 0 ? Math.round((passedQuizResponses.length / quizResponses.length) * 100) : 85;

  // Filter & Sort
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      // Type Filter
      if (formTypeFilter !== 'All' && r.formType !== formTypeFilter) return false;

      // Form Filter
      if (formIdFilter !== 'All' && r.formId !== formIdFilter && r.formFid !== formIdFilter) return false;

      // Status (Pass/Fail)
      if (statusFilter === 'Passed' && !r.passed) return false;
      if (statusFilter === 'Failed' && r.passed !== false) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (r.respondentName || '').toLowerCase().includes(q);
        const matchEmail = (r.respondentEmail || '').toLowerCase().includes(q);
        const matchId = (r.id || '').toLowerCase().includes(q);
        const matchFid = (r.formFid || '').toLowerCase().includes(q);
        const matchTitle = (r.formTitle || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId && !matchFid && !matchTitle) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'respondent') {
        return (a.respondentName || '').localeCompare(b.respondentName || '');
      }
      return 0;
    });
  }, [responses, formTypeFilter, formIdFilter, statusFilter, searchQuery, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage) || 1;
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResponses.slice(start, start + itemsPerPage);
  }, [filteredResponses, currentPage, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedResponses.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTriggerSimulate = () => {
    const newSub = simulateIncomingResponse();
    setRecentLiveSubmission(newSub);
    onRefresh();
    onShowToast(`Simulated live response logged for "${newSub.formTitle}"!`, 'success');
  };

  const handleExportAllCSV = () => {
    const csvData = exportResponsesToCSV(filteredResponses, forms);
    downloadBlobFile(csvData, `lms_form_responses_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    onShowToast(`Exported ${filteredResponses.length} response records to CSV.`, 'success');
  };

  const handleExportSelectedCSV = () => {
    const targetResponses = responses.filter(r => selectedIds.includes(r.id));
    const csvData = exportResponsesToCSV(targetResponses, forms);
    downloadBlobFile(csvData, `lms_selected_responses_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    onShowToast(`Exported ${targetResponses.length} selected responses to CSV.`, 'success');
  };

  const handleExecuteDelete = () => {
    const { type, responseId } = deleteConfirmState;
    if (type === 'single' && responseId) {
      deleteResponse(responseId);
      onShowToast(`Response ${responseId} deleted permanently.`, 'info');
    } else if (type === 'selected') {
      const count = bulkDeleteResponses(selectedIds);
      setSelectedIds([]);
      onShowToast(`Deleted ${count} responses permanently.`, 'info');
    }
    setDeleteConfirmState({ isOpen: false, type: 'single' });
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Real-time Notification Banner */}
      {recentLiveSubmission && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold flex-shrink-0 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  New Live Submission
                </span>
                <span className="text-[11px] font-mono text-sky-300">
                  {recentLiveSubmission.formFid}
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-0.5">
                <strong>{recentLiveSubmission.respondentName}</strong> just submitted "{recentLiveSubmission.formTitle}".
                {recentLiveSubmission.score !== undefined && (
                  <span className="ml-1.5 text-sky-300 font-bold">
                    Score: {recentLiveSubmission.score}% ({recentLiveSubmission.passed ? 'PASSED' : 'FAILED'})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSelectedResponse(recentLiveSubmission)}
              className="px-3.5 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Submission</span>
            </button>
            <button
              onClick={() => setRecentLiveSubmission(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-r-blue flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Submissions</div>
            <div className="text-xl font-black text-slate-900 font-heading">{totalResponsesCount}</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Quiz Pass Rate</div>
            <div className="text-xl font-black text-emerald-900 font-heading">{avgQuizPassRate}%</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Avg Satisfaction</div>
            <div className="text-xl font-black text-purple-900 font-heading">4.7 / 5.0</div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Active Surveys</div>
            <div className="text-xl font-black text-indigo-900 font-heading">{forms.filter(f => f.status === 'Published').length}</div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-3xs space-y-4">
        {/* Top actions line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportAllCSV}
              className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export All to CSV / Excel</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleExportSelectedCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected ({selectedIds.length})</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={() => setDeleteConfirmState({
                  isOpen: true,
                  type: 'selected',
                  title: `${selectedIds.length} selected responses`
                })}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          {/* Live Simulator Trigger Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerSimulate}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title="Inject a realistic respondent submission"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Live Response</span>
            </button>

            <button
              onClick={() => {
                setIsAutoStreaming(!isAutoStreaming);
                onShowToast(isAutoStreaming ? 'Auto response streaming paused.' : 'Live response stream simulation activated!', 'info');
              }}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                isAutoStreaming
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Automatically receive incoming responses"
            >
              <Radio className={`w-3.5 h-3.5 ${isAutoStreaming ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isAutoStreaming ? 'Streaming Live' : 'Live Stream'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by respondent, email, FID, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-r-blue"
            />
          </div>

          {/* Form Type Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Type:</span>
            <select
              value={formTypeFilter}
              onChange={(e) => setFormTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="All">All Form Types</option>
              <option value="Survey">Surveys</option>
              <option value="Feedback">Feedback</option>
              <option value="Quiz">Quizzes</option>
            </select>
          </div>

          {/* Form Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Form:</span>
            <select
              value={formIdFilter}
              onChange={(e) => setFormIdFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="All">All Form Assessments</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.fid} - {f.title.substring(0, 26)}...</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score">Highest Score</option>
              <option value="respondent">Respondent Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedResponses.length > 0 &&
                      paginatedResponses.every(r => selectedIds.includes(r.id))
                    }
                    className="w-4 h-4 rounded text-r-blue focus:ring-r-blue cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Response ID</th>
                <th className="py-3.5 px-4">FeedbackID & Form</th>
                <th className="py-3.5 px-4">Respondent</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4">Score & Outcome</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedResponses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No Responses Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click "Simulate Live Response" to log a realistic submission or share your published `/nfb/{'{token}'}` links.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedResponses.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  const isQuiz = r.formType === 'Quiz' || r.score !== undefined;
                  const matchedForm = forms.find(f => f.id === r.formId);

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedResponse(r)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(r.id)}
                          className="w-4 h-4 rounded text-r-blue focus:ring-r-blue cursor-pointer"
                        />
                      </td>

                      {/* Response ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {r.id}
                      </td>

                      {/* FeedbackID & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            {r.formFid || matchedForm?.fid || 'FID-1092'}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {r.formType || matchedForm?.type || 'Survey'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 truncate" title={r.formTitle || matchedForm?.title}>
                          {r.formTitle || matchedForm?.title || 'Form Assessment'}
                        </div>
                      </td>

                      {/* Respondent */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                            {(r.respondentName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{r.respondentName || 'Anonymous'}</div>
                            <div className="text-slate-400 text-[11px] truncate max-w-[150px]">
                              {r.respondentEmail || 'anonymous@learner.org'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <div>{new Date(r.submittedAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Score / Performance */}
                      <td className="py-3 px-4">
                        {isQuiz ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-heading text-slate-900">
                              {r.score ?? 0}%
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              r.passed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {r.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {r.answers?.length || 4} Answers Logged
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedResponse(r)}
                            className="p-1.5 text-slate-500 hover:text-r-blue hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Complete Submission"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmState({
                              isOpen: true,
                              type: 'single',
                              responseId: r.id,
                              title: `response ${r.id} from ${r.respondentName}`
                            })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Response Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredResponses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredResponses.length)}</strong> of{' '}
            <strong className="text-slate-800">{filteredResponses.length}</strong> submissions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          form={forms.find(f => f.id === selectedResponse.formId)}
          isOpen={!!selectedResponse}
          onClose={() => setSelectedResponse(null)}
          onDeleteResponse={(respId) => {
            deleteResponse(respId);
            onShowToast(`Response ${respId} deleted.`, 'info');
            onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete {deleteConfirmState.title}? The associated form's response counter will adjust accordingly.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmState({ isOpen: false, type: 'single' })}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResponsesManagementView;
