import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons';
import { getParticipantFeedback } from '../utils/instructorData';
import { 
  CheckCircle2, 
  Lock, 
  User, 
  FileText, 
  Star, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ShieldCheck,
  Award,
  Clock
} from 'lucide-react';

export const InstructorParticipantFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId, participantId } = useParams<{ sessionId: string; participantId: string }>();

  const record = getParticipantFeedback(sessionId || '', participantId || '');

  if (!record || !record.participant.feedbackSubmitted || !record.participant.feedbackResponses) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-gray-200 space-y-4">
          <Lock className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Feedback Unavailable</h2>
          <p className="text-gray-500 text-sm">
            This participant has not submitted feedback yet or the session record was not found.
          </p>
          <button 
            onClick={() => navigate(`/instructor/session/${sessionId || 'session-comp-101'}`)}
            className="px-6 py-2.5 bg-r-blue text-white font-bold rounded-xl text-sm shadow hover:bg-r-blue-dark transition-all inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Return to Session Details
          </button>
        </div>
      </div>
    );
  }

  const { session, participant } = record;
  const resp = participant.feedbackResponses;

  const questions = [
    { label: "1. The learnings from this course can be applied to my job role", val: resp.q1 },
    { label: "2. The course content was relevant, practical, and comprehensive", val: resp.q2 },
    { label: "3. The objectives of the course were satisfactorily met and aligned to my learning needs", val: resp.q3 },
    { label: "4. The instructor effectively explained complex concepts and addressed questions", val: resp.q4 },
    { label: "5. The course environment was interactive, engaging, and facilitated learning", val: resp.q5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(`/instructor/session/${session.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
          >
            <ArrowLeftIcon className="w-4 h-4 text-r-blue" />
            <span>Back to Session Details</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Read-Only Mode (Submitted)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Summary Box */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-r-blue/10 text-r-blue rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">Submitted Participant Feedback</h1>
                <p className="text-xs text-gray-500">Official ILT Post-Session Assessment & Evaluation Form</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Submitted on {participant.submittedAt}
            </span>
          </div>

          {/* Key Metadata Fields required by prompt: Employee Name, Employee Code, ILT Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-r-blue" /> Employee Name
              </p>
              <p className="text-sm font-bold text-gray-900">{participant.name}</p>
              <p className="text-[11px] text-gray-500">{participant.department}</p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Employee Code
              </p>
              <p className="text-sm font-mono font-bold text-r-blue">{participant.empCode}</p>
              <p className="text-[11px] text-gray-500">Verified Employee ID</p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-500" /> ILT Name
              </p>
              <p className="text-sm font-bold text-gray-900 truncate">{session.title}</p>
              <p className="text-[11px] text-gray-500">Instructor: {session.facilitator}</p>
            </div>
          </div>
        </div>

        {/* Filled Feedback Form Questions (READ ONLY) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Rating Scale Responses (1 = Strongly Disagree, 5 = Strongly Agree)
            </h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Overall Rating: {resp.overallRating} / 5 Stars
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-3">
                <p className="font-bold text-sm text-gray-800">{q.label}</p>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = q.val === num;
                    return (
                      <div
                        key={num}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                          isSelected 
                            ? 'bg-r-blue text-white border-r-blue shadow-sm ring-2 ring-r-blue/30 scale-105' 
                            : 'bg-white text-gray-400 border-gray-200 opacity-60'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                  <span className="ml-3 text-xs font-bold text-gray-600">
                    {q.val === 5 ? 'Strongly Agree' : q.val === 4 ? 'Agree' : q.val === 3 ? 'Neutral' : q.val === 2 ? 'Disagree' : 'Strongly Disagree'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Qualitative Responses */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <h3 className="text-md font-heading font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-r-blue" />
              Detailed Feedback & Comments
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Key Learnings & Job Application Takeaways
                </p>
                <p className="text-sm font-medium text-gray-800 italic">
                  "{resp.keyTakeaways}"
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Feedback for Trainer / Facilitator ({session.facilitator})
                </p>
                <p className="text-sm font-medium text-gray-800 italic">
                  "{resp.trainerFeedback}"
                </p>
              </div>

              {resp.additionalComments && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Additional Comments or Recommendations
                  </p>
                  <p className="text-sm font-medium text-gray-800 italic">
                    "{resp.additionalComments}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Read Only Enforcement Notice Footer */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-start gap-3 text-amber-900">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Feedback Submission Locked</p>
              <p className="text-amber-800/80">
                Instructors are granted read-only viewing permissions for employee feedback forms. Inputs cannot be altered or overwritten.
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => navigate(`/instructor/session/${session.id}`)}
              className="px-8 py-3 bg-nav-blue text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:bg-r-blue-dark transition-all flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Return to Session Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorParticipantFeedbackPage;
