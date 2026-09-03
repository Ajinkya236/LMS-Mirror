// components/forms/CSVUploadModal.tsx
import React, { useState, useRef } from 'react';
import { LMSForm, FeedbackAssignment, CSVValidationSummary, CSVValidationRowResult } from '../../types/forms';
import { validateAssignmentCSV, generateSampleCSV, downloadBlobFile, createAssignments } from '../../utils/formsStorage';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  HelpCircle,
  Check,
  ChevronRight,
  RefreshCw,
  Users
} from 'lucide-react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  forms: LMSForm[];
  existingAssignments: FeedbackAssignment[];
  onAssignmentsCreated: (count: number) => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  forms,
  existingAssignments,
  onAssignmentsCreated,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CSVValidationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorFilter, setErrorFilter] = useState<'all' | 'errors' | 'valid'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sample = generateSampleCSV(forms);
    downloadBlobFile(sample, 'feedback_assignments_sample.csv', 'text/csv;charset=utf-8;');
  };

  const processFileContent = (content: string, fileName: string) => {
    setCsvContent(content);
    setIsProcessing(true);

    setTimeout(() => {
      const summary = validateAssignmentCSV(content, forms, existingAssignments);
      setValidationResult(summary);
      setIsProcessing(false);
    }, 250);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processFileContent(text, selected.name);
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
        processFileContent(text, droppedFile.name);
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

  const handleDownloadErrorReport = () => {
    if (!validationResult) return;
    const errorRows = validationResult.results.filter(r => !r.isValid);
    const header = ['Row Number', 'FeedbackID', 'Username', 'Errors'];
    const rows = errorRows.map(r => [
      `"${r.rowNumber}"`,
      `"${r.feedbackId}"`,
      `"${r.username}"`,
      `"${r.errors.join('; ').replace(/"/g, '""')}"`
    ]);
    const content = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlobFile(content, 'feedback_assignment_errors.csv', 'text/csv;charset=utf-8;');
  };

  const handleConfirmAssignments = () => {
    if (!validationResult || validationResult.validRows === 0) return;

    const validItems = validationResult.results
      .filter(r => r.isValid && r.matchedForm)
      .map(r => ({
        feedbackId: r.matchedForm!.fid,
        username: r.username,
        formId: r.matchedForm!.id,
        formTitle: r.matchedForm!.title,
        formType: r.matchedForm!.type,
        token: r.matchedForm!.token,
        dueDate: r.matchedForm!.endDate || undefined
      }));

    createAssignments(validItems);
    onAssignmentsCreated(validItems.length);
    onClose();
  };

  const filteredResults = validationResult?.results.filter(r => {
    if (errorFilter === 'errors') return !r.isValid;
    if (errorFilter === 'valid') return r.isValid;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Feedback Distribution</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              Bulk Feedback Assignment CSV Upload
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Upload recipient roster with columns <code className="bg-white/10 px-1.5 py-0.5 rounded text-sky-300 font-mono">FeedbackID, username</code> (up to 2,000 rows per batch).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
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
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-r-blue flex items-center justify-center font-bold flex-shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-900">Need the Standard Template?</h4>
                    <p className="text-xs text-sky-700 mt-0.5">
                      Download a pre-formatted sample CSV populated with your published forms (FID) and mock learners.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-3xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
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
                    ? 'border-r-blue bg-blue-50/50 scale-[1.01]'
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
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-r-blue flex items-center justify-center mx-auto mb-4 shadow-3xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Click to browse or drag and drop your CSV file here
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports .csv, .txt (comma or tab delimited). Maximum limit is 2,000 rows.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-mono font-medium">
                  <span>Required Format:</span>
                  <strong className="text-slate-800">FeedbackID, username</strong>
                </div>
              </div>

              {/* Active Forms Reference Table for Fast Copy */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-r-blue" />
                    Available Form IDs for Reference ({forms.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Click any FID to copy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {forms.slice(0, 6).map(f => (
                    <div
                      key={f.id}
                      onClick={() => {
                        navigator.clipboard.writeText(f.fid);
                      }}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-r-blue transition-colors cursor-pointer flex items-center justify-between"
                      title="Click to copy FID"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-xs font-bold text-r-blue block">{f.fid}</span>
                        <span className="text-[11px] text-slate-600 truncate block font-medium">{f.title}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        f.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Validation Results Dashboard */}
          {validationResult && (
            <div className="space-y-5 animate-fade-in">
              {/* File details bar */}
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{file?.name || 'uploaded_assignments.csv'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {validationResult.totalRows} total rows parsed
                    </div>
                  </div>
                </div>
                <button
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
                  <span className="text-[10px] text-slate-400">Max limit: 2,000</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Valid
                  </span>
                  <div className="text-xl font-black text-emerald-900 font-heading">{validationResult.validRows}</div>
                  <span className="text-[10px] text-emerald-700">Ready to assign</span>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Errors
                  </span>
                  <div className="text-xl font-black text-rose-900 font-heading">{validationResult.errorRows}</div>
                  <span className="text-[10px] text-rose-700">Will be excluded</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Duplicates
                  </span>
                  <div className="text-xl font-black text-amber-900 font-heading">{validationResult.duplicateRows}</div>
                  <span className="text-[10px] text-amber-700">Prevented double assign</span>
                </div>
              </div>

              {/* Error Filtering & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
                  {[
                    { id: 'all', label: `All (${validationResult.results.length})` },
                    { id: 'valid', label: `Valid Only (${validationResult.validRows})` },
                    { id: 'errors', label: `Errors Only (${validationResult.errorRows})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setErrorFilter(f.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        errorFilter === f.id
                          ? 'bg-white text-slate-900 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {validationResult.errorRows > 0 && (
                  <button
                    onClick={handleDownloadErrorReport}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Error Log CSV</span>
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
                      <th className="py-2.5 px-3">Matched Form</th>
                      <th className="py-2.5 px-3">Status & Notes</th>
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
                      filteredResults.map((r, i) => (
                        <tr
                          key={i}
                          className={`hover:bg-slate-50 transition-colors ${
                            !r.isValid ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">
                            {r.rowNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {r.feedbackId || <span className="text-slate-300 italic">Empty</span>}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {r.username || <span className="text-slate-300 italic">Empty</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.matchedForm ? (
                              <span className="text-slate-700 font-medium line-clamp-1">
                                {r.matchedForm.title} ({r.matchedForm.type})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No match</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Valid
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                {r.errors.map((err, errIdx) => (
                                  <span
                                    key={errIdx}
                                    className="inline-block text-[11px] font-semibold text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded mr-1"
                                  >
                                    {err}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            {validationResult ? (
              <span>
                <strong>{validationResult.validRows}</strong> valid assignments ready to create.
              </span>
            ) : (
              <span>Template headers: <code className="font-mono text-slate-700">FeedbackID, username</code></span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            {validationResult && (
              <button
                type="button"
                onClick={handleConfirmAssignments}
                disabled={validationResult.validRows === 0}
                className="px-5 py-2 bg-r-blue hover:bg-r-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Create {validationResult.validRows} Assignments</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CSVUploadModal;
