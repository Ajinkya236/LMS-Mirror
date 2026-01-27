import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UserIcon, ArmchairIcon, ClockIcon, FileTextIcon, CheckCircleIcon } from '../components/Icons';

// --- Session Tile Display ---
const SessionDisplay: React.FC<{ 
  session: any; 
  onJoin: () => void; 
  onStartAssessment: () => void; 
  onFeedback: () => void;
  hasPassedAssessment: boolean;
}> = ({ session, onJoin, onStartAssessment, onFeedback, hasPassedAssessment }) => {
  
  // Logic: Digital Marketing Foundations (s-9901) should NOT show 'join' button
  const isDigitalMarketing = session.id === 's-9901';
  
  const showJoin = !hasPassedAssessment && session.actions?.includes('join') && !isDigitalMarketing;
  const showAssessment = !hasPassedAssessment && session.actions?.includes('assessment');
  const showFeedback = hasPassedAssessment || session.actions?.includes('feedback');

  return (
    <div className="mb-4 last:mb-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-nav-blue to-r-blue px-5 py-2.5 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-bold text-white truncate pr-4">
            {session.title}
          </h3>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded border border-white/20 backdrop-blur-sm">
             <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">ID:</span>
             <span className="text-xs font-mono font-bold text-white">{session.sessionId}</span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-2.5 mb-4 pb-4 border-b border-gray-100">
            {showJoin && (
              <button 
                onClick={onJoin} 
                className="px-5 py-1.5 bg-nav-blue text-white font-bold rounded-lg text-[11px] uppercase tracking-wider shadow-sm hover:bg-r-blue-dark transition-all transform active:scale-95"
              >
                Join Meeting
              </button>
            )}
            {showAssessment && (
              <button 
                onClick={onStartAssessment} 
                className="px-5 py-1.5 border-2 border-nav-blue text-nav-blue font-bold rounded-lg text-[11px] uppercase tracking-wider hover:bg-r-blue-50 transition-all transform active:scale-95"
              >
                Start Assessment
              </button>
            )}
            {showFeedback && (
              <button 
                onClick={onFeedback} 
                className="px-5 py-1.5 border-2 border-green-600 text-green-700 font-bold rounded-lg text-[11px] uppercase tracking-wider hover:bg-green-50 transition-all transform active:scale-95"
              >
                Submit Feedback
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-4 gap-x-4">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> Start
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.start.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500">{session.start.split(' ').slice(1).join(' ')}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" /> End
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.end.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500">{session.end.split(' ').slice(1).join(' ')}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> Instructor
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.instructor}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" /> Location
              </p>
              <p className="text-xs font-bold text-gray-800 truncate">{session.location}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <ArmchairIcon className="w-3 h-3" /> Seat
              </p>
              <p className="text-xs font-bold text-r-blue">{session.seat}</p>
            </div>
            <div className="col-span-2 min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <FileTextIcon className="w-3 h-3" /> Venue
              </p>
              <p className="text-xs text-gray-600 line-clamp-1 italic font-medium" title={session.venue}>
                {session.venue}
              </p>
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
  const [toast, setToast] = useState<string | null>(null);
  
  // Session State Management
  const [sessions, setSessions] = useState([
    {
      id: 's-example',
      title: 'Advanced Web Architecture',
      start: '12-01-2026 01:21:00 PM',
      end: '12-01-2026 01:25:00 PM',
      instructor: 'Ajinkya Patil',
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

  const [attendedSessionIds, setAttendedSessionIds] = useState<string[]>([]);
  const [passedAssessmentIds, setPassedAssessmentIds] = useState<string[]>([]);

  // Check query parameters for state changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
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
            showToast("session has been completed");
        }
    }
  }, [location]);

  const attendedSessionsList = useMemo(() => {
      return sessions.filter(s => attendedSessionIds.includes(s.id));
  }, [attendedSessionIds, sessions]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleMark = () => {
    const trimmedCode = sessionCode.trim();
    if (trimmedCode) {
      // Find session with this joinCode
      const matchedSession = sessions.find(s => s.joinCode === trimmedCode);
      
      if (matchedSession) {
          // Replaces the list so only the newly joined session appears in the results
          setAttendedSessionIds([matchedSession.id]); 
          showToast(`Session Found: ${matchedSession.title}`);
          setSessionCode('');
      } else {
          alert("Invalid session code. Please check and try again.");
      }
    } else {
      alert("Please enter a session code.");
    }
  };

  return (
    <div className="bg-r-gray-50 min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-white bg-white shadow-sm border border-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-r-blue" />
          </button>
          <h1 className="text-2xl font-heading font-bold text-r-gray-900">Live Sessions</h1>
        </div>

        {/* Tab System */}
        <div className="flex border-b border-gray-200 mb-8 sticky top-16 bg-r-gray-50 z-10 shadow-sm md:shadow-none">
          <button 
            onClick={() => setActiveTab('join')}
            className={`whitespace-nowrap px-8 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'join' ? 'border-r-blue text-r-blue' : 'border-transparent text-r-gray-400'}`}
          >
            Join session
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`whitespace-nowrap px-8 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === 'sessions' ? 'border-r-blue text-r-blue' : 'border-transparent text-r-gray-400'}`}
          >
            My Sessions
          </button>
        </div>

        <div className="animate-fade-in-up">
          {activeTab === 'join' ? (
            <section id="join-session" className="space-y-12">
              <div className="max-w-4xl bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <label className="block text-xs font-black text-r-blue uppercase tracking-[0.2em] mb-4">
                  Mark Session Attendance
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="Enter 6-digit session code (e.g. 111111)" 
                    className="flex-grow px-6 py-4 border-2 border-gray-100 rounded-xl text-sm bg-r-gray-50 focus:outline-none focus:ring-4 focus:ring-r-blue/10 focus:border-r-blue transition-all font-bold"
                  />
                  <button onClick={handleMark} className="px-10 py-4 bg-nav-blue text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-r-blue-dark transition-all text-xs">
                    Submit Code
                  </button>
                </div>
                <div className="mt-4 px-2 text-[10px] text-gray-400 flex flex-wrap gap-x-4">
                   <span>Advanced: 111111</span>
                   <span>Marketing: 222222</span>
                   <span>Leadership: 333333</span>
                </div>
              </div>

              {attendedSessionsList.length > 0 ? (
                <div className="animate-fade-in">
                   <h3 className="text-xl font-bold text-r-gray-900 mb-6 border-l-4 border-nav-blue pl-4">Session Found for Your Code</h3>
                   {attendedSessionsList.map(session => (
                      <SessionDisplay 
                          key={session.id}
                          session={session} 
                          onJoin={() => window.open('https://jiomeetpro.jio.com/', '_blank')}
                          onStartAssessment={() => navigate(`/assessment/${session.id}`)}
                          onFeedback={() => navigate(`/feedback/${session.id}`, { state: { title: session.title } })}
                          hasPassedAssessment={passedAssessmentIds.includes(session.id)}
                      />
                   ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No session joined yet</p>
                    <p className="text-gray-400 text-sm mt-2">Enter a code above to see it here.</p>
                </div>
              )}
            </section>
          ) : (
            <section id="my-sessions">
              <div className="mb-6">
                  <h2 className="text-xl font-bold text-r-gray-900 border-l-4 border-nav-blue pl-4">({sessions.length}) All Sessions</h2>
              </div>
              {sessions.length > 0 ? (
                sessions.map((s) => (
                  <SessionDisplay 
                      key={s.id} 
                      session={s} 
                      onJoin={() => window.open('https://jiomeetpro.jio.com/', '_blank')}
                      onStartAssessment={() => navigate(`/assessment/${s.id}`)}
                      // Fix: Changed undefined 'session.id' to correct loop variable 's.id'
                      onFeedback={() => navigate(`/feedback/${s.id}`, { state: { title: s.title } })}
                      hasPassedAssessment={passedAssessmentIds.includes(s.id)}
                  />
                ))
              ) : (
                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No sessions available</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up z-[200] font-bold">
          <CheckCircleIcon className="w-6 h-6" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;