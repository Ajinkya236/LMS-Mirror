import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  Check,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { shortsService } from '../services/shortsService';

export const ShortsTagManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Bulk upload state
  const [isUploading, setIsUploading] = useState(false);
  const [bulkReport, setBulkReport] = useState<{
    successCount: number;
    failureCount: number;
    report: { tag: string; status: 'success' | 'failed'; reason?: string }[];
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTags = () => {
    setTags(shortsService.getPredefinedTags());
  };

  useEffect(() => {
    loadTags();
  }, []);

  const filteredTags = tags.filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Add single tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const res = shortsService.addPredefinedTag(newTagInput);
    if (res.success) {
      setNewTagInput('');
      loadTags();
      showToast('✅ Enterprise tag added successfully!');
    } else {
      setAddError(res.error || 'Failed to add tag');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (window.confirm(`Are you sure you want to remove the tag "${tagToRemove}" from predefined enterprise tags?`)) {
      shortsService.removePredefinedTag(tagToRemove);
      loadTags();
      showToast(`🗑️ Removed "${tagToRemove}"`);
    }
  };

  // Download sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "tag_name,category\n" +
      "#GraphQL,Engineering\n" +
      "#CyberSecurity,Security\n" +
      "#ProductLedGrowth,Product\n" +
      "#TeamBuilding,Leadership\n" +
      "#DataPipelines,Cloud & Data\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_learning_tags.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Sample CSV downloaded!');
  };

  // Handle CSV file upload
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setBulkReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        const parsedTags: string[] = [];

        lines.forEach((line, idx) => {
          if (!line.trim()) return;
          // Skip header row if it contains 'tag'
          if (idx === 0 && line.toLowerCase().includes('tag')) return;

          const cols = line.split(',');
          const raw = cols[0].trim().replace(/^"/, '').replace(/"$/, '');
          if (raw) {
            parsedTags.push(raw);
          }
        });

        const report = shortsService.bulkAddPredefinedTags(parsedTags);
        setBulkReport(report);
        loadTags();
        showToast(`🎉 Bulk upload complete: ${report.successCount} added, ${report.failureCount} failed.`);
      } catch (err) {
        console.error(err);
        showToast('❌ Error parsing CSV file. Please ensure valid CSV format.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shorts/moderation')}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Back to Moderation"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-[#002B7F]" />
                <h1 className="text-xl font-bold text-gray-900">
                  Enterprise Tags & Topics Management
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maintain standard predefined learning tags and bulk upload taxonomy via CSV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSampleCsv}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#002B7F]" />
              <span>Sample CSV</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvFileChange}
            />
          </div>
        </div>

        {/* Bulk Upload Report (Success & Failure Breakdown) */}
        {bulkReport && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#002B7F]" />
                <span>Bulk Upload Results Summary</span>
              </h3>
              <button
                onClick={() => setBulkReport(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xl font-extrabold text-emerald-900">{bulkReport.successCount}</div>
                  <div className="text-xs text-emerald-700 font-medium">Successfully Added</div>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <div className="text-xl font-extrabold text-red-900">{bulkReport.failureCount}</div>
                  <div className="text-xs text-red-700 font-medium">Failed / Duplicates</div>
                </div>
              </div>
            </div>

            {/* Detailed Row Breakdown */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
              {bulkReport.report.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-800">{item.tag}</span>
                  {item.status === 'success' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Failed: {item.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Single Tag Section */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Add Single Enterprise Tag</h2>
          <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. #SystemDesign or #DeepLearning"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-[#002B7F] rounded-xl text-xs text-gray-900 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          </form>

          {addError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{addError}</span>
            </p>
          )}
        </div>

        {/* Current Active Tags List */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">
                Active Enterprise Tags ({tags.length})
              </h2>
            </div>

            {/* Filter tags search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {filteredTags.map(tag => (
              <div
                key={tag}
                className="p-3 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-200 flex items-center justify-between transition-colors group"
              >
                <span className="font-mono font-bold text-xs text-gray-800 group-hover:text-[#002B7F]">
                  {tag}
                </span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove tag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-500">
              No tags matching "{searchQuery}".
            </div>
          )}
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

export default ShortsTagManagementPage;
