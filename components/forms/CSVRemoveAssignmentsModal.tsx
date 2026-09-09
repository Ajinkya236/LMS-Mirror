// components/forms/CSVRemoveAssignmentsModal.tsx
import React, { useState, useRef } from 'react';
import { FeedbackAssignment, CSVRemovalValidationSummary } from '../../types/forms';
import {
  validateRemovalAssignmentCSV,
  generateSampleRemovalCSV,
  downloadBlobFile,
  deleteAssignmentsByIds
} from '../../utils/formsStorage';
import {
  X,
  Trash2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  FileText
} from 'lucide-react';

interface CSVRemoveAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: FeedbackAssignment[];
  onAssignmentsRemoved: (count: number) => void;
}

export const CSVRemoveAssignmentsModal: React.FC<CSVRemoveAssignmentsModalProps> = ({
  isOpen,
  onClose,
  assignments,
  onAssignmentsRemoved,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [, setCsvContent] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CSVRemovalValidationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [onlyPending, setOnlyPending] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sample = generateSampleRemovalCSV(assignments);
    downloadBlobFile(sample, 'remove_assignments_sample.csv', 'text/csv;charset=utf-8;');
  };

  const processFileContent = (content: string) => {
    setCsvContent(content);
    setIsProcessing(true);

    setTimeout(() => {
      const summary = validateRemovalAssignmentCSV(content, assignments);
      setValidationResult(summary);
      setIsProcessing(false);
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processFileContent(text);
    };
    reader.readAsText(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text);
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvContent('');
    setValidationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadUnmatchedReport = () => {
    if (!validationResult) return;
    const unmatchedRows = validationResult.results.filter(r => !r.isValid || !r.matchedAssignment);
    const header = ['Row Number', 'FeedbackID', 'Username', 'Reason'];
    const rows = unmatchedRows.map(r => [
      `"${r.rowNumber}"`,
      `"${r.feedbackId}"`,
      `"${r.username}"`,
      `"${r.errors.join('; ').replace(/"/g, '""')}"`
    ]);
    const content = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlobFile(content, 'unmatched_removal_assignments.csv', 'text/csv;charset=utf-8;');
  };

  // Compute items eligible for deletion based on status settings
  const eligibleItems = (validationResult?.results || []).filter(r => {
    if (!r.isValid || !r.matchedAssignment) return false;
    if (onlyPending && r.matchedAssignment.status !== 'Pending') return false;
    return true;
  });

  const handleConfirmRemoval = () => {
    if (eligibleItems.length === 0) return;

    const idsToRemove = eligibleItems.map(r => r.matchedAssignment!.id);
    const removedCount = deleteAssignmentsByIds(idsToRemove);
    onAssignmentsRemoved(removedCount);
    onClose();
  };

  const filteredResults = (validationResult?.results || []).filter(r => {
    if (filterMode === 'matched') return r.isValid && r.matchedAssignment;
    if (filterMode === 'unmatched') return !r.isValid || !r.matchedAssignment;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-1">
              <Trash2 className="w-4 h-4" />
              <span>Bulk Assignment Removal</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              Upload CSV to Remove Assignments
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Upload a CSV list with columns <code className="bg-white/10 px-1.5 py-0.5 rounded text-rose-300 font-mono">FeedbackID, username</code> to unassign learners.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Step 1: Upload & Sample Bar */}
          {!validationResult && (
            <div className="space-y-4">
              {/* Sample Template Callout */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Need a Removal CSV Template?</h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Download a pre-populated CSV template matching existing assigned learners in your roster.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-3xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Removal Template</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-rose-500 bg-rose-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-3xs">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Click to select or drag and drop your removal CSV here
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports .csv or text files. Maximum 2,000 rows per batch.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-mono font-medium">
                  <span>Supported format:</span>
                  <strong className="text-slate-800">FeedbackID, username</strong>
                  <span className="text-slate-400">or</span>
                  <strong className="text-slate-800">AssignmentID</strong>
                </div>
              </div>

              {/* Active Assignments Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    Currently Assigned Learners in Roster ({assignments.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {assignments.filter(a => a.status === 'Pending').length} Pending
                  </span>
                </div>
                {assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No active assignments found to remove.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {assignments.slice(0, 6).map(asg => (
                      <div
                        key={asg.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-mono text-xs font-bold text-slate-800 block truncate">
                            {asg.username}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {asg.feedbackId} &bull; {asg.formTitle}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            asg.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : asg.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Validation & Review Dashboard */}
          {validationResult && (
            <div className="space-y-5 animate-fade-in">
              {/* File details bar */}
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{file?.name || 'removal_roster.csv'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {validationResult.totalRows} rows parsed
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Rows</span>
                  <div className="text-xl font-black text-slate-900 font-heading">{validationResult.totalRows}</div>
                  <span className="text-[10px] text-slate-400">Rows in CSV</span>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Matched
                  </span>
                  <div className="text-xl font-black text-rose-900 font-heading">{validationResult.matchedRows}</div>
                  <span className="text-[10px] text-rose-700">Found in roster</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Unmatched
                  </span>
                  <div className="text-xl font-black text-amber-900 font-heading">{validationResult.unmatchedRows}</div>
                  <span className="text-[10px] text-amber-700">Not in roster</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                    Duplicates
                  </span>
                  <div className="text-xl font-black text-slate-800 font-heading">{validationResult.duplicateRows}</div>
                  <span className="text-[10px] text-slate-500">De-duplicated</span>
                </div>
              </div>

              {/* Status Option & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'all', label: `All (${validationResult.results.length})` },
                      { id: 'matched', label: `Matched (${validationResult.matchedRows})` },
                      { id: 'unmatched', label: `Unmatched (${validationResult.unmatchedRows})` },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterMode(f.id as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          filterMode === f.id
                            ? 'bg-white text-slate-900 shadow-3xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Pending vs All toggle */}
                  <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={onlyPending}
                      onChange={(e) => setOnlyPending(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>Remove Pending Only (Skip Completed)</span>
                  </label>
                </div>

                {validationResult.unmatchedRows > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadUnmatchedReport}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Unmatched CSV</span>
                  </button>
                )}
              </div>

              {/* Rows Detail Table */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Row #</th>
                      <th className="py-2.5 px-3">FeedbackID (FID)</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Matched Assignment</th>
                      <th className="py-2.5 px-3">Removal Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No rows match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, i) => {
                        const isMatch = r.isValid && Boolean(r.matchedAssignment);
                        const isEligible = isMatch && (!onlyPending || r.matchedAssignment?.status === 'Pending');

                        return (
                          <tr
                            key={i}
                            className={`hover:bg-slate-50 transition-colors ${
                              !isMatch ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">
                              {r.rowNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              {r.feedbackId || <span className="text-slate-300 italic">N/A</span>}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {r.username || <span className="text-slate-300 italic">N/A</span>}
                            </td>
                            <td className="py-2.5 px-3">
                              {r.matchedAssignment ? (
                                <div>
                                  <span className="text-slate-800 font-medium block truncate max-w-xs">
                                    {r.matchedAssignment.formTitle}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {r.matchedAssignment.id}
                                    </span>
                                    <span
                                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                        r.matchedAssignment.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : r.matchedAssignment.status === 'Completed'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {r.matchedAssignment.status}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-amber-700 italic font-medium">
                                  No assignment found
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {isEligible ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  Will Remove
                                </span>
                              ) : isMatch ? (
                                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                                  Skipped ({r.matchedAssignment?.status})
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  {r.errors.map((err, errIdx) => (
                                    <span
                                      key={errIdx}
                                      className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mr-1"
                                    >
                                      {err}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            {validationResult ? (
              <span>
                <strong>{eligibleItems.length}</strong> assignments will be removed.
              </span>
            ) : (
              <span>Expected columns: <code className="font-mono text-slate-700">FeedbackID, username</code></span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            {validationResult && (
              <button
                type="button"
                onClick={handleConfirmRemoval}
                disabled={eligibleItems.length === 0}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove {eligibleItems.length} Assignments</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVRemoveAssignmentsModal;
