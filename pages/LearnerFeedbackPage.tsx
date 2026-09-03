import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Award,
  Sparkles,
  Inbox,
  Lock,
  ChevronRight,
  User,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  HelpCircle,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  getStoredForms,
  getStoredAssignments,
  getStoredResponses,
  recordFormSubmission
} from '../utils/formsStorage';
import { LMSForm, FeedbackAssignment, FormSubmissionRecord, FormType } from '../types/forms';

export const LearnerFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state: 'assigned' or 'submitted'
  const initialTab = searchParams.get('tab') === 'submitted' ? 'submitted' : 'assigned';
  const [activeTab, setActiveTab] = useState<'assigned' | 'submitted'>(initialTab);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All'); // All, Pending, Overdue, Closed

  // Current active user simulation
  const [selectedUser, setSelectedUser] = useState<string>(() => {
    return localStorage.getItem('lms_learner_username') || 'alex.chen';
  });

  // Data State
  const [forms, setForms] = useState<LMSForm[]>([]);
  const [assignments, setAssignments] = useState<FeedbackAssignment[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormSubmissionRecord | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Sync state from storage
  const loadData = () => {
    const f = getStoredForms();
    const a = getStoredAssignments();
    const r = getStoredResponses();
    setForms(f);
    setAssignments(a);
    setSubmissions(r);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Update query params when tab changes
  const handleTabChange = (tab: 'assigned' | 'submitted') => {
    setActiveTab(tab);
    setSearchParams(tab === 'submitted' ? { tab: 'submitted' } : {});
  };

  const handleUserChange = (user: string) => {
    setSelectedUser(user);
    localStorage.setItem('lms_learner_username', user);
  };

  // List of mock learners for quick testing/switching
  const mockLearners = [
    { username: 'alex.chen', name: 'Alex Chen', role: 'Senior Frontend Engineer' },
    { username: 'priya.sharma', name: 'Priya Sharma', role: 'Staff Network Architect' },
    { username: 'dev.sharma', name: 'Dev Sharma', role: 'Backend Lead' },
    { username: 'kavita.patel', name: 'Kavita Patel', role: 'Senior UX Architect' },
    { username: 'all', name: 'Show All Team Feedbacks', role: 'Enterprise Directory' }
  ];

  // Map forms by ID for fast lookup
  const formMap = useMemo(() => {
    const map = new Map<string, LMSForm>();
    forms.forEach(f => {
      map.set(f.id, f);
      if (f.fid) map.set(f.fid, f);
    });
    return map;
  }, [forms]);

  // Combined assigned items with current live form data
  const userAssignments = useMemo(() => {
    return assignments.filter(asg => {
      if (selectedUser === 'all') return true;
      return asg.username.toLowerCase() === selectedUser.toLowerCase() ||
             asg.username.toLowerCase().includes(selectedUser.toLowerCase());
    });
  }, [assignments, selectedUser]);

  // Combined submitted items with form details
  const userSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedUser === 'all') return true;
      const email = sub.respondentEmail?.toLowerCase() || '';
      const name = sub.respondentName?.toLowerCase().replace(' ', '.') || '';
      return email.includes(selectedUser.toLowerCase()) || name.includes(selectedUser.toLowerCase());
    });
  }, [submissions, selectedUser]);

  // Filtered Assigned Items
  const filteredAssigned = useMemo(() => {
    return userAssignments.filter(asg => {
      const liveForm = formMap.get(asg.formId) || formMap.get(asg.feedbackId);
      const title = (liveForm?.title || asg.formTitle).toLowerCase();
      const fid = (liveForm?.fid || asg.feedbackId).toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Search match
      const matchesSearch = !q || title.includes(q) || fid.includes(q) || asg.username.toLowerCase().includes(q);

      // Type match
      const matchesType = typeFilter === 'All' || (liveForm?.type || asg.formType) === typeFilter;

      // Status match
      let matchesStatus = true;
      const isClosed = liveForm ? (!liveForm.settings?.acceptResponses || liveForm.status === 'Closed' || liveForm.status === 'Archived') : false;
      const isDuePast = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;

      if (statusFilter === 'Pending') {
        matchesStatus = asg.status === 'Pending' && !isClosed;
      } else if (statusFilter === 'Overdue') {
        matchesStatus = asg.status === 'Pending' && isDuePast && !isClosed;
      } else if (statusFilter === 'Closed') {
        matchesStatus = isClosed || asg.status === 'Cancelled' || asg.status === 'Expired';
      } else if (statusFilter === 'Completed') {
        matchesStatus = asg.status === 'Completed';
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [userAssignments, formMap, searchQuery, typeFilter, statusFilter]);

  // Filtered Submitted Items
  const filteredSubmitted = useMemo(() => {
    return userSubmissions.filter(sub => {
      const liveForm = formMap.get(sub.formId);
      const title = (liveForm?.title || sub.formTitle || '').toLowerCase();
      const respId = sub.id.toLowerCase();
      const fid = (sub.formFid || liveForm?.fid || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || respId.includes(q) || fid.includes(q);
      const matchesType = typeFilter === 'All' || (sub.formType || liveForm?.type) === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [userSubmissions, formMap, searchQuery, typeFilter]);

  // Helper for Type styling badge
  const getTypeBadge = (type: FormType) => {
    switch (type) {
      case 'Quiz':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Quiz Assessment</span>
          </span>
        );
      case 'Survey':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Pulse Survey</span>
          </span>
        );
      case 'Feedback':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-r-blue border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-r-blue" />
            <span>Structured Feedback</span>
          </span>
        );
    }
  };

  const handleOpenSubmissionDetails = (record: FormSubmissionRecord) => {
    setSelectedResponse(record);
    setIsResponseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Link to="/" className="hover:text-r-blue transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-400">Learner Zone</span>
                <span>/</span>
                <span className="text-r-blue font-bold">My Feedback</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>My Feedback & Surveys</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-r-blue/10 text-r-blue border border-r-blue/20">
                  Learner Portal
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                View feedback tasks, complete organizational pulse surveys, and review your graded quiz submissions.
              </p>
            </div>

            {/* Learner Switcher / Admin Context */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-600">
                <User className="w-4 h-4 text-r-blue" />
                <span className="hidden sm:inline">Active Learner:</span>
              </div>
              <select
                value={selectedUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-r-blue focus:outline-none cursor-pointer"
              >
                {mockLearners.map(m => (
                  <option key={m.username} value={m.username}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-6 border-b border-slate-200 -mb-5 pb-0 overflow-x-auto">
            <button
              onClick={() => handleTabChange('assigned')}
              className={`pb-3 px-4 text-sm font-bold flex items-center gap-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assigned'
                  ? 'border-r-blue text-r-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Feedback Assigned</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'assigned' ? 'bg-r-blue text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {userAssignments.filter(a => a.status !== 'Completed').length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('submitted')}
              className={`pb-3 px-4 text-sm font-bold flex items-center gap-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'submitted'
                  ? 'border-r-blue text-r-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Feedback Submitted</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'submitted' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {userSubmissions.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'assigned' ? "Search assigned forms by title, FID..." : "Search submitted records by ID, title..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Type:</span>
            </div>
            {['All', 'Feedback', 'Survey', 'Quiz'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}

            {activeTab === 'assigned' && (
              <div className="flex items-center gap-1.5 ml-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-r-blue focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Active / Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Closed">Closed / Unavailable</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: FEEDBACK ASSIGNED */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {filteredAssigned.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-r-blue">
                  <Inbox className="w-8 h-8 text-r-blue" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Feedback Assignments Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                  {searchQuery || typeFilter !== 'All' || statusFilter !== 'All'
                    ? "No assigned forms match your search criteria. Try adjusting your search query or filters."
                    : "You are all caught up! There are no pending feedback or pulse survey assignments for your account at this time."}
                </p>
                {(searchQuery || typeFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('All');
                      setStatusFilter('All');
                    }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAssigned.map((assignment) => {
                  const liveForm = formMap.get(assignment.formId) || formMap.get(assignment.feedbackId);
                  const isClosed = liveForm ? (!liveForm.settings?.acceptResponses || liveForm.status === 'Closed' || liveForm.status === 'Archived') : false;
                  const isCompleted = assignment.status === 'Completed';
                  const isDuePast = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;
                  const token = liveForm?.token || assignment.token;

                  return (
                    <div
                      key={assignment.id}
                      className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                        isCompleted
                          ? 'border-emerald-200/80 bg-emerald-50/10'
                          : isClosed
                          ? 'border-slate-200 bg-slate-50/50 opacity-90'
                          : isDuePast
                          ? 'border-amber-200'
                          : 'border-slate-200 hover:border-r-blue/40'
                      }`}
                    >
                      {/* Top Card Section */}
                      <div className="p-5">
                        {/* Badges Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {getTypeBadge(liveForm?.type || assignment.formType)}
                          
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            {liveForm?.fid || assignment.feedbackId}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-r-blue transition-colors line-clamp-2">
                          {liveForm?.title || assignment.formTitle}
                        </h3>
                        
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {liveForm?.description || 'Complete this assigned form to provide crucial operational feedback and learning metrics.'}
                        </p>

                        {/* Metadata Pills */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px]">
                              Due: <span className="font-bold text-slate-700">{assignment.dueDate || 'Open'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px]">
                              {liveForm?.questions ? `${liveForm.questions.length} Questions` : '5-8 Mins'}
                            </span>
                          </div>

                          {assignment.assignedBy && (
                            <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Assigned by: <strong className="text-slate-700">{assignment.assignedBy}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="p-4 bg-slate-50/80 rounded-b-3xl border-t border-slate-100 flex items-center justify-between gap-3">
                        {/* Status Label */}
                        <div>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : isClosed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Closed / Unavailable</span>
                            </span>
                          ) : isDuePast ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Overdue</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                              <Clock className="w-3.5 h-3.5 text-r-blue" />
                              <span>Pending Action</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div>
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => handleTabChange('submitted')}
                              className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          ) : isClosed ? (
                            <button
                              type="button"
                              disabled
                              className="px-3.5 py-1.5 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1"
                              title="This form is currently closed and not accepting new responses."
                            >
                              <span>Not Accepting Responses</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/nfb/${token}`)}
                              className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <span>Submit Form</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEEDBACK SUBMITTED */}
        {activeTab === 'submitted' && (
          <div className="space-y-4">
            {filteredSubmitted.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Submitted Feedbacks Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                  {searchQuery || typeFilter !== 'All'
                    ? "No submission records match your search query."
                    : "Once you submit assigned feedback forms, surveys, or quizzes, your official receipts and evaluation reports will appear here."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Submitted Feedback History</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                      {filteredSubmitted.length} Total
                    </span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Official Digital Audit Records</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredSubmitted.map((record) => {
                    const liveForm = formMap.get(record.formId);
                    const isQuiz = (record.formType || liveForm?.type) === 'Quiz';

                    return (
                      <div
                        key={record.id}
                        className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Form & Response Meta */}
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600">
                            {isQuiz ? <Award className="w-5 h-5 text-amber-600" /> : <FileText className="w-5 h-5 text-r-blue" />}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {getTypeBadge(record.formType || liveForm?.type || 'Feedback')}
                              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {record.id}
                              </span>
                              {record.formFid && (
                                <span className="text-xs font-mono text-slate-400">
                                  {record.formFid}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {record.formTitle || liveForm?.title || 'LMS Feedback Form'}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Submitted: <strong className="text-slate-700">{new Date(record.submittedAt).toLocaleDateString()} at {new Date(record.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                              </span>

                              {record.respondentName && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  Respondent: <strong className="text-slate-700">{record.respondentName}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quiz Score / Action Area */}
                        <div className="flex items-center gap-3 self-end md:self-center">
                          {isQuiz && typeof record.score === 'number' && (
                            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border bg-white shadow-xs mr-2">
                              <div className="text-right">
                                <div className="text-[10px] uppercase font-bold text-slate-400">Score Result</div>
                                <div className="text-xs font-extrabold text-slate-900">
                                  {record.score}%
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                record.passed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {record.passed ? 'Passed' : 'Needs Review'}
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenSubmissionDetails(record)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Responses</span>
                          </button>

                          {liveForm?.token && (
                            <button
                              type="button"
                              onClick={() => navigate(`/nfb/${liveForm.token}`)}
                              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                              title="Open original form"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SUBMISSION DETAILS MODAL */}
      {isResponseModalOpen && selectedResponse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-r-blue/10 text-r-blue px-2.5 py-0.5 rounded-md border border-r-blue/20">
                    {selectedResponse.id}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Submitted {new Date(selectedResponse.submittedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedResponse.formTitle}
                </h3>
              </div>

              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Summary Pill for Quizzes */}
              {selectedResponse.score !== undefined && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Assessment Score</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {selectedResponse.score}%
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    selectedResponse.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedResponse.passed ? 'PASSED CRITERIA' : 'FAILED / RETAKE ALLOWED'}
                  </span>
                </div>
              )}

              {/* Answers Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Recorded Response Answers ({selectedResponse.answers?.length || 0})
                </h4>

                {selectedResponse.answers && selectedResponse.answers.length > 0 ? (
                  selectedResponse.answers.map((ans, idx) => (
                    <div key={idx} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          Q{idx + 1}. {ans.questionTitle}
                        </span>
                        {ans.pointsAwarded !== undefined && ans.pointsAwarded > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            +{ans.pointsAwarded} pts
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                        {typeof ans.value === 'object' && ans.value !== null ? (
                          <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-700">
                            {JSON.stringify(ans.value, null, 2)}
                          </pre>
                        ) : (
                          <span>{String(ans.value || 'No response recorded')}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No detailed question responses recorded.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsResponseModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerFeedbackPage;
