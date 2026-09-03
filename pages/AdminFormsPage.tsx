// pages/AdminFormsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LMSForm,
  FormType,
  FormStatus,
  FeedbackAssignment,
  FormSubmissionRecord
} from '../types/forms';
import {
  getStoredForms,
  duplicateForm,
  archiveForm,
  restoreForm,
  deleteForm,
  publishForm,
  unpublishForm,
  getStoredAssignments,
  getStoredResponses,
  exportResponsesToCSV,
  downloadBlobFile
} from '../utils/formsStorage';
import { FormBuilderModal } from '../components/forms/FormBuilderModal';
import { ShareFormModal } from '../components/forms/ShareFormModal';
import { FormAnalyticsModal } from '../components/forms/FormAnalyticsModal';
import { DeleteConfirmModal, ConfirmationType } from '../components/forms/DeleteConfirmModal';
import { CSVUploadModal } from '../components/forms/CSVUploadModal';
import { AssignmentHistoryView } from '../components/forms/AssignmentHistoryView';
import { ResponsesManagementView } from '../components/forms/ResponsesManagementView';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  MoreVertical,
  Share2,
  Edit3,
  BarChart2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Award,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  Calendar,
  Grid,
  List,
  ShieldCheck,
  Send,
  X,
  FileSpreadsheet,
  UploadCloud,
  MessageSquareCheck
} from 'lucide-react';

export const AdminFormsPage: React.FC = () => {
  const navigate = useNavigate();

  // Top-Level Module Navigation Tab ('forms' | 'assignments' | 'responses')
  const [activeModuleTab, setActiveModuleTab] = useState<'forms' | 'assignments' | 'responses'>('forms');

  // Primary Data State
  const [forms, setForms] = useState<LMSForm[]>([]);
  const [assignments, setAssignments] = useState<FeedbackAssignment[]>([]);
  const [responses, setResponses] = useState<FormSubmissionRecord[]>([]);

  // Role Awareness State
  const [activeRole, setActiveRole] = useState<'admin' | 'employee'>(() => {
    return (localStorage.getItem('lms_user_role') as 'admin' | 'employee') || 'admin';
  });

  useEffect(() => {
    const handleRoleChanged = (e: any) => {
      if (e.detail?.role) {
        setActiveRole(e.detail.role);
      }
    };
    window.addEventListener('lms_role_changed', handleRoleChanged);
    return () => window.removeEventListener('lms_role_changed', handleRoleChanged);
  }, []);

  const handleRoleToggle = (newRole: 'admin' | 'employee') => {
    setActiveRole(newRole);
    localStorage.setItem('lms_user_role', newRole);
    window.dispatchEvent(new CustomEvent('lms_role_changed', { detail: { role: newRole } }));
    showToast(`Switched active view to ${newRole === 'admin' ? 'Administrator' : 'Learner'} mode`, 'info');
  };

  // Forms Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [formToEdit, setFormToEdit] = useState<LMSForm | null>(null);

  const [shareModalForm, setShareModalForm] = useState<LMSForm | null>(null);
  const [analyticsModalForm, setAnalyticsModalForm] = useState<LMSForm | null>(null);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: ConfirmationType;
    form: LMSForm | null;
  }>({
    isOpen: false,
    type: 'delete',
    form: null
  });

  // Action Menu Dropdown tracking
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load All Data from Storage
  const loadAllData = () => {
    const loadedForms = getStoredForms();
    const loadedAssignments = getStoredAssignments();
    const loadedResponses = getStoredResponses();
    setForms(loadedForms);
    setAssignments(loadedAssignments);
    setResponses(loadedResponses);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenActionDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and Sort Logic for Forms Tab
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      // Type Filter
      if (typeFilter !== 'All' && form.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'All' && form.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesFid = form.fid.toLowerCase().includes(query);
        const matchesTitle = form.title.toLowerCase().includes(query);
        const matchesCategory = form.category?.toLowerCase().includes(query);
        const matchesAudience = form.targetAudience?.toLowerCase().includes(query);
        if (!matchesFid && !matchesTitle && !matchesCategory && !matchesAudience) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }
      if (sortBy === 'responses-high') {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'end-date') {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return 0;
    });
  }, [forms, typeFilter, statusFilter, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage) || 1;
  const paginatedForms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredForms.slice(start, start + itemsPerPage);
  }, [filteredForms, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, searchQuery, itemsPerPage]);

  // KPI Calculations
  const totalCount = forms.length;
  const publishedCount = forms.filter(f => f.status === 'Published').length;
  const draftCount = forms.filter(f => f.status === 'Draft').length;
  const totalResponses = responses.length > 0 ? responses.length : forms.reduce((sum, f) => sum + (f.responseCount || 0), 0);
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'Pending').length;

  // Form Operations Handlers
  const handleOpenCreate = () => {
    setFormToEdit(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (form: LMSForm, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormToEdit(form);
    setIsBuilderOpen(true);
  };

  const handleFormSaved = (savedForm: LMSForm, isPublish: boolean) => {
    loadAllData();
    if (isPublish) {
      showToast(`Form "${savedForm.title}" published! Shareable link generated.`, 'success');
      setShareModalForm(savedForm);
    } else {
      showToast(`Form "${savedForm.title}" saved successfully as Draft.`, 'info');
    }
  };

  const handleDuplicate = (formId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cloned = duplicateForm(formId);
    if (cloned) {
      loadAllData();
      showToast(`Duplicated as new draft "${cloned.title}" (${cloned.fid})`, 'success');
    }
  };

  const handleTogglePublish = (form: LMSForm, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (form.status === 'Published') {
      unpublishForm(form.id);
      loadAllData();
      showToast(`Form "${form.fid}" unpublished (moved to Draft).`, 'info');
    } else {
      const pub = publishForm(form.id);
      loadAllData();
      if (pub) {
        showToast(`Form "${pub.fid}" published!`, 'success');
        setShareModalForm(pub);
      }
    }
  };

  const handleOpenConfirm = (type: ConfirmationType, form: LMSForm, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModalState({
      isOpen: true,
      type,
      form
    });
  };

  const handleConfirmAction = () => {
    const { type, form } = confirmModalState;
    if (!form) return;

    if (type === 'delete') {
      deleteForm(form.id);
      loadAllData();
      showToast(`Form ${form.fid} deleted permanently.`, 'info');
    } else if (type === 'archive') {
      archiveForm(form.id);
      loadAllData();
      showToast(`Form ${form.fid} archived.`, 'info');
    } else if (type === 'restore') {
      restoreForm(form.id);
      loadAllData();
      showToast(`Form ${form.fid} restored to Draft.`, 'success');
    }

    setConfirmModalState({ isOpen: false, type: 'delete', form: null });
  };

  const copyFid = (fid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fid);
    showToast(`Copied ${fid} to clipboard.`, 'info');
  };

  return (
    <div className="min-h-screen bg-r-gray-50 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-up">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-bold ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-blue-900 text-white border-blue-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb & Main Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <span>Enterprise Admin</span>
                <span>/</span>
                <span className="text-r-blue">Forms & Feedback Module</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 tracking-tight flex items-center gap-2.5">
                <FileText className="w-7 h-7 text-r-blue" />
                <span>LMS Forms & Response Center</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Design multi-section surveys & quizzes, upload CSV recipient rosters, monitor live response streams, and inspect question-level scoring analytics.
              </p>
            </div>

              {/* Role Context & Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Role Switcher Pill for UAT */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeRole === 'admin'
                        ? 'bg-r-blue text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admin Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('employee')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeRole === 'employee'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Learner Mode
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCSVUploadOpen(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-300"
                >
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>Upload CSV Roster</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Form</span>
                </button>
              </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-0">
            <button
              onClick={() => setActiveModuleTab('forms')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeModuleTab === 'forms'
                  ? 'text-r-blue border-b-2 border-r-blue'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Forms & Assessments Directory</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                {forms.length}
              </span>
            </button>

            <button
              onClick={() => setActiveModuleTab('assignments')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeModuleTab === 'assignments'
                  ? 'text-r-blue border-b-2 border-r-blue'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Feedback Assignments</span>
              {pendingAssignmentsCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800">
                  {pendingAssignmentsCount} pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModuleTab('responses')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeModuleTab === 'responses'
                  ? 'text-r-blue border-b-2 border-r-blue'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquareCheck className="w-4 h-4" />
              <span>Responses & Analytics</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                {totalResponses}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Role Notice Banner for Learner Mode */}
        {activeRole === 'employee' && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                    Learner Portal View
                  </span>
                  <span className="text-xs text-slate-300">Logged in as Employee</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">Learner Experience & Assigned Forms Mode</h2>
                <p className="text-xs text-slate-300">
                  Preview forms directly as a learner, complete assigned surveys or quizzes, and verify grading & completion status.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/form/native-feedback-assignment"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Open My Feedback Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleRoleToggle('admin')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                Switch to Admin Mode
              </button>
            </div>
          </div>
        )}
        {/* TAB 1: FORMS DIRECTORY */}
        {activeModuleTab === 'forms' && (
          <div className="space-y-4 animate-fade-in">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-r-blue flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Forms</div>
                  <div className="text-xl font-black text-slate-900 font-heading">{totalCount}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published & Active</div>
                  <div className="text-xl font-black text-slate-900 font-heading">{publishedCount}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft Forms</div>
                  <div className="text-xl font-black text-slate-900 font-heading">{draftCount}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responses Logged</div>
                  <div className="text-xl font-black text-slate-900 font-heading">{totalResponses}</div>
                </div>
              </div>
            </div>

            {/* Controls, Search, Filter & Tabs Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-3xs space-y-4">
              {/* Top Line: Type Tabs & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                {/* Type Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'All', label: 'All Forms', count: forms.length },
                    { id: 'Survey', label: 'Surveys', count: forms.filter(f => f.type === 'Survey').length },
                    { id: 'Feedback', label: 'Feedback', count: forms.filter(f => f.type === 'Feedback').length },
                    { id: 'Quiz', label: 'Quizzes', count: forms.filter(f => f.type === 'Quiz').length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setTypeFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        typeFilter === tab.id
                          ? 'bg-slate-900 text-white shadow-3xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        typeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Grid / Card View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Line: Search Bar, Status Filter, Sort Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by FID (e.g. FID-1092), title, category, audience..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-r-blue"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="md:col-span-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
                    Status:
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Published">Published (Active)</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-r-blue"
                  >
                    <option value="newest">Newest Created</option>
                    <option value="oldest">Oldest Created</option>
                    <option value="responses-high">Most Responses</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="end-date">Ending Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DATA DISPLAY: TABLE VIEW */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-3xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">FID</th>
                        <th className="py-3.5 px-4 min-w-[240px]">Form Title & Category</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Responses</th>
                        <th className="py-3.5 px-4">Created Date</th>
                        <th className="py-3.5 px-4">End Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {paginatedForms.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <div className="max-w-xs mx-auto space-y-3">
                              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                              <div className="font-bold text-slate-700 text-sm">No Forms Found</div>
                              <p className="text-xs text-slate-400">
                                Try adjusting your filters or search keywords, or create a brand new form.
                              </p>
                              <button
                                onClick={handleOpenCreate}
                                className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                              >
                                + Create New Form
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedForms.map((form) => {
                          const isDropdownOpen = openActionDropdownId === form.id;

                          return (
                            <tr
                              key={form.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              {/* 1. FID */}
                              <td className="py-4 px-4 font-mono font-bold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                                    {form.fid}
                                  </span>
                                  <button
                                    onClick={(e) => copyFid(form.fid, e)}
                                    className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                    title="Copy FID"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              {/* 2. Title & Category */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <div
                                    className="font-bold text-slate-900 line-clamp-1 hover:text-r-blue transition-colors cursor-pointer"
                                    onClick={() => handleOpenEdit(form)}
                                  >
                                    {form.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <span>{form.category}</span>
                                    <span>•</span>
                                    <span className="text-slate-500 font-medium truncate max-w-[180px]">
                                      {form.targetAudience}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Type */}
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border inline-flex items-center gap-1 ${
                                    form.type === 'Survey'
                                      ? 'bg-blue-50 text-r-blue border-blue-200'
                                      : form.type === 'Feedback'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {form.type === 'Survey' && <Sparkles className="w-3 h-3" />}
                                  {form.type === 'Feedback' && <FileText className="w-3 h-3" />}
                                  {form.type === 'Quiz' && <Award className="w-3 h-3" />}
                                  <span>{form.type}</span>
                                </span>
                              </td>

                              {/* 4. Status */}
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                    form.status === 'Published'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : form.status === 'Draft'
                                      ? 'bg-amber-100 text-amber-900'
                                      : form.status === 'Closed'
                                      ? 'bg-slate-100 text-slate-700'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {form.status === 'Published' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  )}
                                  <span>{form.status}</span>
                                </span>
                              </td>

                              {/* 5. Response Count */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => setAnalyticsModalForm(form)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-r-blue font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="View Responses & Analytics"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{form.responseCount || 0}</span>
                                </button>
                              </td>

                              {/* 6. Created Date */}
                              <td className="py-4 px-4 text-slate-600 font-medium text-[11px] whitespace-nowrap">
                                {form.createdDate}
                              </td>

                              {/* 7. End Date */}
                              <td className="py-4 px-4 text-slate-600 font-medium text-[11px] whitespace-nowrap">
                                {form.endDate ? (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {form.endDate}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">No Expiry</span>
                                )}
                              </td>

                              {/* 8. Actions */}
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1 relative">
                                  {/* Share Link Button */}
                                  <button
                                    onClick={() => setShareModalForm(form)}
                                    className="p-1.5 text-slate-500 hover:text-r-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Shareable Link (/nfb/{token})"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>

                                  {/* Analytics Button */}
                                  <button
                                    onClick={() => setAnalyticsModalForm(form)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                    title="View Analytics"
                                  >
                                    <BarChart2 className="w-4 h-4" />
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    onClick={(e) => handleOpenEdit(form, e)}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Form"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {/* More Menu Dropdown */}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenActionDropdownId(isDropdownOpen ? null : form.id);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {isDropdownOpen && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-left animate-fade-in"
                                      >
                                        <a
                                          href={`/#/nfb/${form.token}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Preview Form</span>
                                        </a>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            setOpenActionDropdownId(null);
                                            handleTogglePublish(form, e);
                                          }}
                                          className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          {form.status === 'Published' ? (
                                            <>
                                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                                              <span>Unpublish (to Draft)</span>
                                            </>
                                          ) : (
                                            <>
                                              <Send className="w-3.5 h-3.5 text-emerald-600" />
                                              <span>Publish Form</span>
                                            </>
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            setOpenActionDropdownId(null);
                                            handleDuplicate(form.id, e);
                                          }}
                                          className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Duplicate Form</span>
                                        </button>

                                        <div className="border-t border-slate-100 my-1" />

                                        {form.status === 'Archived' ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              setOpenActionDropdownId(null);
                                              handleOpenConfirm('restore', form, e);
                                            }}
                                            className="w-full px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Restore Form</span>
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              setOpenActionDropdownId(null);
                                              handleOpenConfirm('archive', form, e);
                                            }}
                                            className="w-full px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                          >
                                            <Archive className="w-3.5 h-3.5" />
                                            <span>Archive Form</span>
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            setOpenActionDropdownId(null);
                                            handleOpenConfirm('delete', form, e);
                                          }}
                                          className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Delete Form</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* DATA DISPLAY: GRID / CARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedForms.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-500 border border-gray-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <div className="font-bold text-slate-700 text-sm">No Forms Found</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust filters or create a new form.
                    </p>
                  </div>
                ) : (
                  paginatedForms.map((form) => (
                    <div
                      key={form.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-3xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-slate-200">
                            {form.fid}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                form.type === 'Survey'
                                  ? 'bg-blue-50 text-r-blue border-blue-200'
                                  : form.type === 'Feedback'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {form.type}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                form.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : form.status === 'Draft'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {form.status}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3
                            onClick={() => handleOpenEdit(form)}
                            className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-r-blue transition-colors cursor-pointer"
                          >
                            {form.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {form.description || 'No description provided.'}
                          </p>
                        </div>

                        {/* Metadata chips */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Audience:</span>
                            <span className="font-semibold truncate max-w-[140px]">{form.targetAudience}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Responses:</span>
                            <button
                              onClick={() => setAnalyticsModalForm(form)}
                              className="font-bold text-r-blue hover:underline cursor-pointer"
                            >
                              {form.responseCount || 0} Submissions
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setShareModalForm(form)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-r-blue text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Link</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEdit(form, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Edit Form"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(form.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleOpenConfirm('delete', form, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination Bar */}
            {filteredForms.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredForms.length)} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredForms.length)} of {filteredForms.length} forms
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-slate-900 text-white shadow-3xs'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEEDBACK ASSIGNMENTS (CSV Upload, History, Bulk Actions) */}
        {activeModuleTab === 'assignments' && (
          <div className="animate-fade-in">
            <AssignmentHistoryView
              forms={forms}
              assignments={assignments}
              onRefresh={loadAllData}
              onOpenUploadCSV={() => setIsCSVUploadOpen(true)}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* TAB 3: RESPONSES MANAGEMENT (Detail modal, Pass/fail analytics, Export CSV) */}
        {activeModuleTab === 'responses' && (
          <div className="animate-fade-in">
            <ResponsesManagementView
              forms={forms}
              responses={responses}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          </div>
        )}
      </div>

      {/* ALL MODALS */}
      {/* 1. Form Builder (Create & Edit) */}
      <FormBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setFormToEdit(null);
        }}
        formToEdit={formToEdit}
        onFormSaved={handleFormSaved}
      />

      {/* 2. Share Form Modal */}
      {shareModalForm && (
        <ShareFormModal
          isOpen={Boolean(shareModalForm)}
          form={shareModalForm}
          onClose={() => setShareModalForm(null)}
          onTokenRegenerated={(updated) => {
            loadAllData();
            setShareModalForm(updated);
            showToast(`Generated new link for ${updated.fid}.`, 'success');
          }}
        />
      )}

      {/* 3. Analytics & Responses Modal */}
      {analyticsModalForm && (
        <FormAnalyticsModal
          isOpen={Boolean(analyticsModalForm)}
          form={analyticsModalForm}
          onClose={() => setAnalyticsModalForm(null)}
        />
      )}

      {/* 4. Delete / Archive / Restore Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={confirmModalState.isOpen}
        type={confirmModalState.type}
        form={confirmModalState.form}
        onClose={() => setConfirmModalState({ isOpen: false, type: 'delete', form: null })}
        onConfirm={handleConfirmAction}
      />

      {/* 5. CSV Feedback Assignment Upload Modal */}
      <CSVUploadModal
        isOpen={isCSVUploadOpen}
        onClose={() => setIsCSVUploadOpen(false)}
        forms={forms}
        existingAssignments={assignments}
        onAssignmentsCreated={(count) => {
          loadAllData();
          showToast(`Successfully created ${count} feedback assignments!`, 'success');
        }}
      />
    </div>
  );
};

export default AdminFormsPage;
