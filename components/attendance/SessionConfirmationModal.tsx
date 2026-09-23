import React from 'react';
import { 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Armchair, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export interface SessionInfo {
  id: string;
  title: string;
  sessionId: string;
  start: string;
  end: string;
  instructor: string;
  location: string;
  seat: string;
  venue: string;
  joinCode?: string;
}

interface SessionConfirmationModalProps {
  isOpen: boolean;
  session: SessionInfo | null;
  onConfirm: (session: SessionInfo) => void;
  onCancel: () => void;
  learnerName?: string;
  learnerId?: string;
}

export const SessionConfirmationModal: React.FC<SessionConfirmationModalProps> = ({
  isOpen,
  session,
  onConfirm,
  onCancel,
  learnerName = 'Ajinkya Patil',
  learnerId = 'EMP-88219'
}) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-nav-blue via-r-blue to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-300/40 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 id="confirmation-modal-title" className="font-bold text-base leading-tight">
                Confirm Session Attendance
              </h3>
              <p className="text-xs text-blue-100">Please review session details before confirming</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            title="Cancel"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Session Banner */}
          <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-5 rounded-2xl border border-blue-100/80 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-r-blue bg-white/80 px-2.5 py-1 rounded-lg border border-blue-100 shadow-2xs font-mono">
                Session Code: {session.sessionId}
              </span>
              {session.joinCode && (
                <span className="text-[10px] font-mono text-gray-500 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-100">
                  PIN: {session.joinCode}
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 mt-2 leading-snug">
              {session.title}
            </h2>
          </div>

          {/* Session Details Grid (Session info: start date/time, end date/time, instructor name, location) */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-200 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Session Schedule & Instructor
            </div>

            {/* Start Date / Time */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-r-blue rounded-xl flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Start Date & Time</p>
                <p className="text-sm font-bold text-gray-800">{session.start}</p>
              </div>
            </div>

            {/* End Date / Time */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">End Date & Time</p>
                <p className="text-sm font-bold text-gray-800">{session.end}</p>
              </div>
            </div>

            {/* Instructor Name */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Instructor</p>
                <p className="text-sm font-bold text-gray-900">{session.instructor}</p>
                <p className="text-[11px] text-gray-500 font-medium">Lead Trainer & Certified Specialist</p>
              </div>
            </div>

            {/* Location & Seat */}
            {(session.location || session.seat || session.venue) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] text-gray-400 font-bold block">Location</span>
                    <span className="text-xs font-semibold text-gray-700 truncate block">{session.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Armchair className="w-3.5 h-3.5 text-r-blue flex-shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] text-gray-400 font-bold block">Assigned Seat</span>
                    <span className="text-xs font-semibold text-r-blue truncate block">{session.seat}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Learner Identity Info */}
          <div className="px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-gray-500 font-medium block">Marking Attendance for Learner:</span>
              <span className="font-bold text-gray-900">{learnerName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-medium block">Learner ID:</span>
              <span className="font-mono font-bold text-r-blue">{learnerId}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Action Buttons: Learner confirms or cancels */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all text-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => onConfirm(session)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Mark Attendance</span>
          </button>
        </div>

      </div>
    </div>
  );
};
