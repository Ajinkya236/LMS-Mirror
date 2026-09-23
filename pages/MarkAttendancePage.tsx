import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  ArmchairIcon, 
  ClockIcon, 
  FileTextIcon, 
  CheckCircleIcon 
} from '../components/Icons';
import { 
  QrCode, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Video, 
  Award, 
  MessageSquare,
  HelpCircle,
  Hash,
  Copy,
  ExternalLink
} from 'lucide-react';
import { QRScannerModal } from '../components/attendance/QRScannerModal';
import { SessionConfirmationModal, SessionInfo } from '../components/attendance/SessionConfirmationModal';

// --- Session Tile Display ---
const SessionDisplay: React.FC<{ 
  session: any; 
  onJoin: () => void; 
  onStartAssessment: () => void; 
  onFeedback: () => void;
  hasPassedAssessment: boolean;
  isJustAttended?: boolean;
}> = ({ session, onJoin, onStartAssessment, onFeedback, hasPassedAssessment, isJustAttended }) => {
  
  // Logic: Digital Marketing Foundations (s-9901) should NOT show 'join' button
  const isDigitalMarketing = session.id === 's-9901';
  
  const showJoin = !hasPassedAssessment && session.actions?.includes('join') && !isDigitalMarketing;
  const showAssessment = !hasPassedAssessment && session.actions?.includes('assessment');
  const showFeedback = hasPassedAssessment || session.actions?.includes('feedback');

  return (
    <div className={`mb-6 last:mb-12 transition-all duration-300 ${isJustAttended ? 'ring-2 ring-emerald-500/30 rounded-2xl shadow-xl' : ''}`}>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-nav-blue via-r-blue to-indigo-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isJustAttended && (
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Marked
              </span>
            )}
            <h3 className="text-base md:text-lg font-bold text-white truncate">
              {session.title}
            </h3>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm">
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">ID:</span>
              <span className="text-xs font-mono font-bold text-white">{session.sessionId}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg text-white/90 text-xs font-mono">
              <span>PIN: {session.joinCode}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 py-5">
          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            {showJoin && (
              <button 
                onClick={onJoin} 
                className="px-5 py-2.5 bg-nav-blue hover:bg-r-blue-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2 group"
              >
                <Video className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                Join Live Meeting (JioMeet)
              </button>
            )}
            {showAssessment && (
              <button 
                onClick={onStartAssessment} 
                className="px-5 py-2.5 border-2 border-r-blue text-r-blue hover:bg-blue-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Start Assessment
              </button>
            )}
            {showFeedback && (
              <button 
                onClick={onFeedback} 
                className="px-5 py-2.5 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Submit Session Feedback
              </button>
            )}

            <span className="ml-auto hidden lg:inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Official ILT Training Module
            </span>
          </div>

          {/* Session Detail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-y-4 gap-x-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-r-blue" /> Start
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.start.split(' ')[0]}</p>
              <p className="text-[11px] text-gray-500 font-medium">{session.start.split(' ').slice(1).join(' ')}</p>
            </div>
            
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-indigo-500" /> End
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.end.split(' ')[0]}</p>
              <p className="text-[11px] text-gray-500 font-medium">{session.end.split(' ').slice(1).join(' ')}</p>
            </div>
            
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-purple-500" /> Instructor
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.instructor}</p>
              <p className="text-[10px] text-gray-500">Lead Trainer</p>
            </div>
            
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-red-500" /> Location
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.location}</p>
              <p className="text-[10px] text-gray-500">Regional Center</p>
            </div>
            
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ArmchairIcon className="w-3.5 h-3.5 text-r-blue" /> Seat
              </p>
              <p className="text-xs font-bold text-r-blue">{session.seat}</p>
              <p className="text-[10px] text-gray-500">Assigned Desk</p>
            </div>
            
            <div className="col-span-2 min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <FileTextIcon className="w-3.5 h-3.5 text-amber-500" /> Venue & Hall
              </p>
              <p className="text-xs text-gray-700 line-clamp-1 italic font-medium" title={session.venue}>
                {session.venue}
              </p>
              <p className="text-[10px] text-gray-500">In-person & Virtual Sync</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const MarkAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'join' | 'sessions'>('join');
  const [sessionCode, setSessionCode] = useState('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastAttendedSessionId, setLastAttendedSessionId] = useState<string | null>(null);
  const [pendingConfirmationSession, setPendingConfirmationSession] = useState<SessionInfo | null>(null);
  
  // Session State Management
  const [sessions, setSessions] = useState([
    {
      id: 's-example',
      title: 'Advanced Web Architecture',
      start: '12-01-2026 01:21:00 PM',
      end: '12-01-2026 01:25:00 PM',
      instructor: 'Sandeep Gupta',
      location: 'Haryana',
      venue: 'Ambala Ua_JC , HR-AMBL-JC-01 , Haryana',
      sessionId: 'ILT-5501',
      seat: 'A-12',
      actions: ['join', 'assessment'],
      joinCode: '111111'
    },
    {
      id: 's-9901',
      title: 'Digital Marketing Foundations',
      start: '15-01-2026 10:00:00 AM',
      end: '15-01-2026 12:00:00 PM',
      instructor: 'Priya Sharma',
      location: 'Mumbai',
      venue: 'RCP, TC-22, 2nd Floor, Mumbai',
      sessionId: 'ILT-9901',
      seat: 'A-22',
      actions: ['assessment'], // Rules from user: no join button here
      joinCode: '222222'
    },
    {
      id: 's-feedback-only',
      title: 'Leadership & Conflict Resolution',
      start: '20-01-2026 02:00:00 PM',
      end: '20-01-2026 05:00:00 PM',
      instructor: 'Dr. Sameer Khan',
      location: 'Bangalore',
      venue: 'RMZ Eco World, Floor 4, Bangalore',
      sessionId: 'ILT-7722',
      seat: 'B-12',
      actions: ['feedback'],
      joinCode: '333333'
    }
  ]);

  const [attendedSessionIds, setAttendedSessionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lms_attended_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [passedAssessmentIds, setPassedAssessmentIds] = useState<string[]>([]);

  // Check query parameters for state changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Auto-open scanner if requested in URL
    if (params.get('scan') === 'true') {
      setIsScannerOpen(true);
    }

    // Tab switching
    const tabParam = params.get('tab');
    if (tabParam === 'sessions' || tabParam === 'join') {
      setActiveTab(tabParam as 'join' | 'sessions');
    }

    // Assessment Passing
    if (params.get('assessmentStatus') === 'passed') {
      const sessionId = params.get('sessionId');
      if (sessionId && !passedAssessmentIds.includes(sessionId)) {
        setPassedAssessmentIds(prev => [...prev, sessionId]);
      }
    }

    // Feedback completion
    if (params.get('feedbackStatus') === 'completed') {
      const sessionId = params.get('sessionId');
      if (sessionId) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        showToast("Session has been completed successfully!", "success");
      }
    }
  }, [location]);

  // Persist attended session IDs
  useEffect(() => {
    try {
      localStorage.setItem('lms_attended_sessions', JSON.stringify(attendedSessionIds));
    } catch (e) {
      console.error(e);
    }
  }, [attendedSessionIds]);

  const attendedSessionsList = useMemo(() => {
    return sessions.filter(s => attendedSessionIds.includes(s.id));
  }, [attendedSessionIds, sessions]);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Validates the scanned/uploaded QR code or entered session code and prompts learner confirmation
  const validateAndPromptAttendance = (inputCode: string) => {
    const trimmed = inputCode.trim();
    if (!trimmed) {
      showToast("Please enter or scan a session code.", "error");
      return;
    }

    // Find session with this joinCode or sessionId or id
    const matchedSession = sessions.find(
      s => s.joinCode === trimmed || 
           s.sessionId.toLowerCase() === trimmed.toLowerCase() || 
           s.id.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (matchedSession) {
      setIsScannerOpen(false);
      setPendingConfirmationSession(matchedSession);
    } else {
      showToast(`Invalid session code "${trimmed}". Please verify the 6-digit code or QR code.`, "error");
    }
  };

  // For a valid code and learner confirmation, the learner's attendance is marked
  const handleConfirmAttendance = (session: SessionInfo) => {
    setAttendedSessionIds(prev => {
      if (!prev.includes(session.id)) {
        return [session.id, ...prev];
      }
      return [session.id, ...prev.filter(id => id !== session.id)];
    });
    setLastAttendedSessionId(session.id);
    setPendingConfirmationSession(null);
    setSessionCode('');
    showToast(`Attendance marked successfully for ${session.title} (${session.sessionId})!`, "success");
  };

  // Learner cancels confirmation
  const handleCancelConfirmation = () => {
    setPendingConfirmationSession(null);
    showToast("Attendance confirmation canceled.", "info");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndPromptAttendance(sessionCode);
  };

  return (
    <div className="bg-r-gray-50 min-h-screen pb-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-2xl hover:bg-white bg-white shadow-sm border border-gray-200 transition-all active:scale-95 text-r-blue"
              title="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-r-gray-900 tracking-tight flex items-center gap-2.5">
                Mark Live Attendance
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-r-blue/10 text-r-blue border border-r-blue/20">
                  Web & Mobile
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Scan QR code via camera/gallery or submit manual 6-digit session PIN
              </p>
            </div>
          </div>

          {/* Quick Header Action to Open QR Scanner */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-nav-blue to-r-blue hover:from-r-blue hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
          >
            <QrCode className="w-4 h-4 text-cyan-300" />
            <span>Launch QR Scanner</span>
          </button>
        </div>

        {/* Tab System */}
        <div className="flex border-b border-gray-200 mb-8 sticky top-16 bg-r-gray-50 z-10 shadow-sm md:shadow-none">
          <button 
            onClick={() => setActiveTab('join')}
            className={`whitespace-nowrap px-8 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 ${activeTab === 'join' ? 'border-r-blue text-r-blue bg-white/40' : 'border-transparent text-r-gray-400 hover:text-gray-700'}`}
          >
            <QrCode className="w-4 h-4" />
            Join Session & Mark Attendance
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`whitespace-nowrap px-8 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 ${activeTab === 'sessions' ? 'border-r-blue text-r-blue bg-white/40' : 'border-transparent text-r-gray-400 hover:text-gray-700'}`}
          >
            <CalendarIcon className="w-4 h-4" />
            All Live Sessions ({sessions.length})
          </button>
        </div>

        <div className="animate-fade-in-up">
          {activeTab === 'join' ? (
            <section id="join-session" className="space-y-10">
              
              {/* Hero Attendance Input Container */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none -z-0 opacity-70" />
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-6">
                    <div>
                      <span className="text-[11px] font-black text-r-blue uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Step 1: Authenticate Session
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">
                        How would you like to mark your attendance?
                      </h2>
                    </div>

                    {/* Prominent QR Scan Button (Primary Action) */}
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-6 py-4 bg-gradient-to-r from-nav-blue via-r-blue to-indigo-600 hover:from-r-blue hover:to-indigo-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 font-extrabold text-sm uppercase tracking-wider group border border-white/20"
                    >
                      <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                        <QrCode className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest leading-none">Instant Scan</div>
                        <div className="text-sm font-bold text-white leading-tight">Scan QR Code (Camera / Gallery)</div>
                      </div>
                    </button>
                  </div>

                  {/* Manual 6-Digit Code Entry Section */}
                  <div>
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2.5">
                      Or Enter 6-Digit Session Code Manually
                    </label>

                    <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3 max-w-3xl">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                          <Hash className="w-5 h-5 text-r-blue" />
                        </div>
                        <input 
                          type="text" 
                          value={sessionCode}
                          onChange={(e) => setSessionCode(e.target.value)}
                          placeholder="e.g. 111111 or ILT-5501" 
                          maxLength={12}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-r-blue/15 focus:border-r-blue transition-all font-mono font-bold tracking-widest text-gray-900 placeholder:text-gray-400 placeholder:font-sans placeholder:tracking-normal"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-8 py-3.5 bg-nav-blue hover:bg-r-blue-dark text-white font-extrabold uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2 transform active:scale-95 flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        Submit Code
                      </button>
                    </form>

                    {/* Quick Session Sample Pills */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        Try Sample Codes:
                      </span>
                      {sessions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSessionCode(s.joinCode);
                            validateAndPromptAttendance(s.joinCode);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 active:scale-95 text-r-blue font-mono font-bold text-[11px] border border-blue-100 transition-all cursor-pointer"
                          title={`Mark attendance for ${s.title}`}
                        >
                          <span className="text-gray-600 font-sans font-medium">{s.sessionId}:</span>
                          <span>{s.joinCode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Attended Session Found / Displayed Below */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 bg-r-blue rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {attendedSessionsList.length > 0 ? (
                        <>Attended Sessions ({attendedSessionsList.length})</>
                      ) : (
                        <>Session Details & Status</>
                      )}
                    </h3>
                  </div>
                  {attendedSessionsList.length > 0 && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
                      ✓ Ready to Join or Start Assessment
                    </span>
                  )}
                </div>

                {attendedSessionsList.length > 0 ? (
                  <div className="space-y-6 animate-fade-in">
                    {attendedSessionsList.map(session => (
                      <SessionDisplay 
                        key={session.id}
                        session={session} 
                        isJustAttended={session.id === lastAttendedSessionId}
                        onJoin={() => window.open('https://jiomeetpro.jio.com/', '_blank')}
                        onStartAssessment={() => navigate(`/assessment/${session.id}`)}
                        onFeedback={() => navigate(`/feedback/${session.id}`, { state: { title: session.title } })}
                        hasPassedAssessment={passedAssessmentIds.includes(session.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-r-blue">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <p className="text-gray-800 font-bold text-base">No session attendance marked yet</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1.5 max-w-md">
                      Scan the instructor's QR code using your camera or gallery image, or enter the 6-digit code above to mark attendance and access meeting controls.
                    </p>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="mt-6 px-6 py-3 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      Open Camera QR Scanner
                    </button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section id="my-sessions" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-r-gray-900 border-l-4 border-nav-blue pl-4">
                  All Scheduled Sessions ({sessions.length})
                </h2>
                <button 
                  onClick={() => setActiveTab('join')}
                  className="text-xs font-bold text-r-blue hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-4 h-4" /> Mark Attendance for a Session
                </button>
              </div>

              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <SessionDisplay 
                    key={s.id} 
                    session={s} 
                    isJustAttended={attendedSessionIds.includes(s.id)}
                    onJoin={() => window.open('https://jiomeetpro.jio.com/', '_blank')}
                    onStartAssessment={() => navigate(`/assessment/${s.id}`)}
                    onFeedback={() => navigate(`/feedback/${s.id}`, { state: { title: s.title } })}
                    hasPassedAssessment={passedAssessmentIds.includes(s.id)}
                  />
                ))
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No sessions available</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* QR Scanner Modal with Camera & Gallery Flow */}
      <QRScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          validateAndPromptAttendance(code);
        }}
        availableSessions={sessions.map(s => ({
          id: s.id,
          title: s.title,
          joinCode: s.joinCode,
          sessionId: s.sessionId
        }))}
      />

      {/* Learner Session Confirmation Dialog (Shows Session Info -> Learner Confirms or Cancels) */}
      <SessionConfirmationModal
        isOpen={!!pendingConfirmationSession}
        session={pendingConfirmationSession}
        onConfirm={handleConfirmAttendance}
        onCancel={handleCancelConfirmation}
        learnerName="Ajinkya Patil"
        learnerId="EMP-88219"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up z-[200] font-bold text-xs sm:text-sm text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? (
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black">!</span>
          ) : (
            <CheckCircleIcon className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
