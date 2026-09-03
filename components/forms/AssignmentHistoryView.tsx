// components/forms/AssignmentHistoryView.tsx
import React, { useState, useMemo } from 'react';
import { LMSForm, FeedbackAssignment, AssignmentStatus } from '../../types/forms';
import {
  deleteAssignment,
  deletePendingAssignments,
  updateAssignmentStatus,
  generateSampleCSV,
  downloadBlobFile
} from '../../utils/formsStorage';
import {
  Search,
  Filter,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  ExternalLink,
  Users,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  MoreVertical,
  Layers,
  ArrowUpDown,
  Send
} from 'lucide-react';

interface AssignmentHistoryViewProps {
  forms: LMSForm[];
  assignments: FeedbackAssignment[];
  onRefresh: () => void;
  onOpenUploadCSV: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AssignmentHistoryView: React.FC<AssignmentHistoryViewProps> = ({
  forms,
  assignments,
  onRefresh,
  onOpenUploadCSV,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formFilter, setFormFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'username' | 'fid'>('newest');

  // Multi-select for bulk pending deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Delete modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'single' | 'selected' | 'all-pending';
    assignmentId?: string;
    targetTitle?: string;
  }>({
    isOpen: false,
    type: 'single'
  });

  // Calculate Metrics
  const totalCount = assignments.length;
  const pendingCount = assignments.filter(a => a.status === 'Pending').length;
  const completedCount = assignments.filter(a => a.status === 'Completed').length;
  const cancelledCount = assignments.filter(a => a.status === 'Cancelled').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(asg => {
      if (statusFilter !== 'All' && asg.status !== statusFilter) return false;
      if (formFilter !== 'All' && asg.formId !== formFilter && asg.feedbackId !== formFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = asg.username.toLowerCase().includes(q);
        const matchFid = asg.feedbackId.toLowerCase().includes(q);
        const matchId = asg.id.toLowerCase().includes(q);
        const matchTitle = asg.formTitle.toLowerCase().includes(q);
        if (!matchUser && !matchFid && !matchId && !matchTitle) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.assignedDate).getTime() - new Date(b.assignedDate).getTime();
      }
      if (sortBy === 'username') {
        return a.username.localeCompare(b.username);
      }
      if (sortBy === 'fid') {
        return a.feedbackId.localeCompare(b.feedbackId);
      }
      return 0;
    });
  }, [assignments, statusFilter, formFilter, searchQuery, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(start, start + itemsPerPage);
  }, [filteredAssignments, currentPage, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all pending visible assignments
      const pendingIds = paginatedAssignments.filter(a => a.status === 'Pending').map(a => a.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV(forms);
    downloadBlobFile(sample, 'feedback_assignments_sample.csv', 'text/csv;charset=utf-8;');
    onShowToast('Downloaded sample assignment CSV template.', 'info');
  };

  const handleExecuteDelete = () => {
    const { type, assignmentId } = deleteConfirmState;
    if (type === 'single' && assignmentId) {
      deleteAssignment(assignmentId);
      onShowToast(`Deleted assignment ${assignmentId}.`, 'info');
    } else if (type === 'selected') {
      const count = deletePendingAssignments(selectedIds);
      setSelectedIds([]);
      onShowToast(`Deleted ${count} pending assignments.`, 'info');
    } else if (type === 'all-pending') {
      const count = deletePendingAssignments();
      setSelectedIds([]);
      onShowToast(`Deleted all ${count} pending assignments.`, 'info');
    }

    setDeleteConfirmState({ isOpen: false, type: 'single' });
    onRefresh();
  };

  const handleCopyLink = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/nfb/${token}`;
    navigator.clipboard.writeText(url);
    onShowToast('Copied direct form link to clipboard!', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-r-blue flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Assignments</div>
            <div className="text-xl font-black text-slate-900 font-heading">{totalCount}</div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Roster</div>
            <div className="text-xl font-black text-amber-900 font-heading">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed Responses</div>
            <div className="text-xl font-black text-emerald-900 font-heading">{completedCount}</div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Completion Rate</div>
            <div className="text-xl font-black text-indigo-900 font-heading">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Action and Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-3xs space-y-4">
        {/* Top line buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenUploadCSV}
              className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV Assignments</span>
            </button>

            <button
              onClick={handleDownloadSample}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample CSV Template</span>
            </button>
          </div>

          {/* Bulk Delete pending buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setDeleteConfirmState({
                  isOpen: true,
                  type: 'selected',
                  targetTitle: `${selectedIds.length} selected pending assignments`
                })}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer animate-fade-in"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            {pendingCount > 0 && selectedIds.length === 0 && (
              <button
                onClick={() => setDeleteConfirmState({
                  isOpen: true,
                  type: 'all-pending',
                  targetTitle: `all ${pendingCount} pending assignments`
                })}
                className="px-3 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Remove all pending assignments"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Pending</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by username, FID, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-r-blue"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="All">All Statuses ({assignments.length})</option>
              <option value="Pending">Pending ({pendingCount})</option>
              <option value="Completed">Completed ({completedCount})</option>
              <option value="Cancelled">Cancelled ({cancelledCount})</option>
            </select>
          </div>

          {/* Form Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Form:</span>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="All">All Associated Forms</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.fid} - {f.title.substring(0, 28)}...</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="username">Username A-Z</option>
              <option value="fid">FeedbackID A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment History Table */}
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
                      paginatedAssignments.filter(a => a.status === 'Pending').length > 0 &&
                      paginatedAssignments.filter(a => a.status === 'Pending').every(a => selectedIds.includes(a.id))
                    }
                    className="w-4 h-4 rounded text-r-blue focus:ring-r-blue cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Assignment ID</th>
                <th className="py-3.5 px-4">FeedbackID</th>
                <th className="py-3.5 px-4">Form & Target Survey</th>
                <th className="py-3.5 px-4">Learner Username</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No Feedback Assignments Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Use the "Upload CSV Assignments" button above to batch assign surveys and knowledge checks to learners.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((asg) => {
                  const isSelected = selectedIds.includes(asg.id);
                  return (
                    <tr
                      key={asg.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        {asg.status === 'Pending' ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(asg.id)}
                            className="w-4 h-4 rounded text-r-blue focus:ring-r-blue cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">•</span>
                        )}
                      </td>

                      {/* Assignment ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {asg.id}
                      </td>

                      {/* FeedbackID */}
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(asg.feedbackId);
                            onShowToast(`Copied ${asg.feedbackId} to clipboard.`, 'info');
                          }}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-mono font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Click to copy FID"
                        >
                          <span>{asg.feedbackId}</span>
                          <Copy className="w-3 h-3 opacity-60" />
                        </button>
                      </td>

                      {/* Form Title & Type */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={asg.formTitle}>
                          {asg.formTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {asg.formType}
                          </span>
                          {asg.dueDate && (
                            <span className="text-[10px] text-slate-400">
                              Due: {asg.dueDate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                            {asg.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{asg.username}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {asg.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        )}
                        {asg.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                        {asg.status === 'Cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Cancelled
                          </span>
                        )}
                        {asg.status === 'Expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Assigned Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <div>{asg.assignedDate}</div>
                        {asg.completedDate && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            Done: {asg.completedDate}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleCopyLink(asg.token, e)}
                            className="p-1.5 text-slate-500 hover:text-r-blue hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Copy Form Link (/nfb/...)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {asg.status === 'Pending' && (
                            <button
                              onClick={() => {
                                updateAssignmentStatus(asg.id, 'Completed');
                                onShowToast(`Marked ${asg.id} as Completed.`, 'success');
                                onRefresh();
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Mark as Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {asg.status === 'Pending' && (
                            <button
                              onClick={() => setDeleteConfirmState({
                                isOpen: true,
                                type: 'single',
                                assignmentId: asg.id,
                                targetTitle: `assignment ${asg.id} for ${asg.username}`
                              })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Pending Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
            Showing <strong className="text-slate-800">{filteredAssignments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredAssignments.length)}</strong> of{' '}
            <strong className="text-slate-800">{filteredAssignments.length}</strong> assignments
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
                Are you sure you want to permanently delete {deleteConfirmState.targetTitle}? This action cannot be undone.
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
export default AssignmentHistoryView;
