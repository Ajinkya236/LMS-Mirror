import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  CheckCircleIcon
} from '../components/Icons';
import { 
  getILTSessionById, 
  SessionParticipant 
} from '../utils/instructorData';
import { 
  Eye, 
  Clock, 
  Award, 
  FileText, 
  Search, 
  Filter, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  Building2,
  BookOpen
} from 'lucide-react';

export const InstructorSessionDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = getILTSessionById(sessionId || 'session-comp-101');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Pending'>('All');

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Session Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The requested session details could not be retrieved.</p>
          <button 
            onClick={() => navigate('/events?view=instructor')}
            className="px-6 py-2.5 bg-r-blue text-white font-bold rounded-xl text-sm shadow hover:bg-r-blue-dark transition-all"
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  // Filter participants
  const filteredParticipants = session.participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'Submitted') return matchesSearch && p.feedbackSubmitted;
    if (statusFilter === 'Pending') return matchesSearch && !p.feedbackSubmitted;
    return matchesSearch;
  });

  const submittedCount = session.participants.filter(p => p.feedbackSubmitted).length;
  const pendingCount = session.participants.length - submittedCount;
  const presentCount = session.participants.filter(p => p.attendanceStatus === 'Present').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Banner / Breadcrumb Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/events?view=instructor')}
              className="p-2 rounded-xl text-gray-600 hover:text-r-blue hover:bg-gray-100 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Calendar</span>
            </button>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="text-xs font-semibold text-gray-500">
              Instructor View / <span className="text-r-blue font-bold">Session Details</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Session Completed
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Session Info Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-nav-blue via-r-blue to-indigo-800 p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full mb-3 inline-block border border-white/30">
                  {session.academy} • {session.mode}
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white leading-tight">
                  {session.title}
                </h1>
                <p className="text-blue-100 text-sm mt-1 font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-300" /> Course: {session.courseName}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right min-w-[180px]">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Feedback Rate</span>
                <div className="text-2xl font-black text-white">
                  {Math.round((submittedCount / session.participants.length) * 100)}%
                </div>
                <span className="text-[11px] text-blue-200">{submittedCount} of {session.participants.length} submitted</span>
              </div>
            </div>

            {/* Metrics Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-cyan-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200">Date & Time</p>
                  <p className="text-xs font-bold text-white">{session.date}</p>
                  <p className="text-[11px] text-blue-200">{session.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-cyan-300">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200">Facilitator</p>
                  <p className="text-xs font-bold text-white">{session.facilitator}</p>
                  <p className="text-[11px] text-blue-200">Lead Instructor</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-cyan-300">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200">Venue / Location</p>
                  <p className="text-xs font-bold text-white truncate max-w-[160px]">{session.location}</p>
                  <p className="text-[11px] text-blue-200 truncate max-w-[160px]">{session.venue}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-cyan-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200">Attendance</p>
                  <p className="text-xs font-bold text-white">{presentCount} Present</p>
                  <p className="text-[11px] text-blue-200">{session.participants.length - presentCount} Absent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Feedback Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-r-blue" />
                Participant Attendance & Feedback Roster
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                View employee attendance status, assessment scores, and submitted feedback forms.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                {submittedCount} Feedback Submitted
              </span>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100">
                {pendingCount} Feedback Pending
              </span>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search participant name, code, dept..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-r-blue/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter:</span>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('All')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statusFilter === 'All' ? 'bg-white text-r-blue shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All ({session.participants.length})
                </button>
                <button
                  onClick={() => setStatusFilter('Submitted')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statusFilter === 'Submitted' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Submitted ({submittedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statusFilter === 'Pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Pending ({pendingCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table displaying participants */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-6">Employee Name</th>
                  <th className="py-3.5 px-6">Attendance Time / Status</th>
                  <th className="py-3.5 px-6">Assessment Score</th>
                  <th className="py-3.5 px-6 text-right">Participant Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">
                      No participants match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const isSubmitted = p.feedbackSubmitted;
                    return (
                      <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                        
                        {/* 1. Employee Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nav-blue to-r-blue text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {p.empCode}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  • {p.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Attendance Time / Status */}
                        <td className="py-4 px-6">
                          {p.attendanceStatus === 'Present' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                              </span>
                              <p className="text-[11px] text-gray-500 font-mono">
                                {p.attendanceTime}
                              </p>
                            </div>
                          ) : p.attendanceStatus === 'Late' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> Late Arrival
                              </span>
                              <p className="text-[11px] text-gray-500 font-mono">
                                {p.attendanceTime}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" /> Absent
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 3. Assessment Score */}
                        <td className="py-4 px-6">
                          {p.assessmentScore !== 'N/A' ? (
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-50 text-r-blue rounded-lg">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{p.assessmentScore}</p>
                                <p className="text-[10px] text-gray-400">Post-ILT Assessment</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono text-xs">N/A</span>
                          )}
                        </td>

                        {/* 4. Participant Feedback */}
                        <td className="py-4 px-6 text-right">
                          {isSubmitted ? (
                            <button
                              onClick={() => navigate(`/instructor/session/${session.id}/feedback/${p.id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white font-bold rounded-xl text-xs shadow-xs hover:shadow transition-all transform active:scale-95 group"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>View Feedback</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold cursor-not-allowed select-none opacity-80" title="Feedback form not submitted yet">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
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

          <div className="pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
            <span>Showing {filteredParticipants.length} of {session.participants.length} participants</span>
            <span className="italic">* Instructors cannot edit submitted feedback forms.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorSessionDetailsPage;
