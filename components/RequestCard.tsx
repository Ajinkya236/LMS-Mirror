
import React, { useState } from 'react';
import type { MentorshipRequest } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface RequestCardProps {
  request: MentorshipRequest;
  userType: 'mentee' | 'mentor';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const StatusBadge: React.FC<{ status: MentorshipRequest['status']; isProgram?: boolean }> = ({ status, isProgram }) => {
  const statusInfo = {
    pending_mentor: { text: 'Pending Approval', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
    pending_program: { text: 'Pending Program', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
    rejected_mentor: { text: 'Rejected', bg: 'bg-red-100', text_color: 'text-red-800' },
    rejected_program: { text: 'Rejected', bg: 'bg-red-100', text_color: 'text-red-800' },
    accepted: { text: 'Accepted', bg: 'bg-green-100', text_color: 'text-green-800' },
    completed: { text: 'Completed', bg: 'bg-gray-100', text_color: 'text-gray-800' },
    mentor_pending_program: { text: 'Pending Program', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
    mentor_accepted_program: { text: 'Accepted', bg: 'bg-green-100', text_color: 'text-green-800' },
    mentor_rejected_program: { text: 'Rejected', bg: 'bg-red-100', text_color: 'text-red-800' },
  }[status];

  // Logic override for Program Rejections
  if (isProgram && (status === 'rejected_program' || status === 'mentor_rejected_program')) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Failed to Match
        </span>
      );
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text_color}`}>
      {statusInfo.text}
    </span>
  );
};

const RequestCard: React.FC<RequestCardProps> = ({ request, userType, onAccept, onReject }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const isMentorProgramRequest = userType === 'mentor' && request.status.startsWith('mentor_');
    const otherParty = isMentorProgramRequest 
        ? request.mentor 
        : (userType === 'mentee' ? request.mentor : request.mentee);

    // Robust check for Program vs Open Mentoring
    const isProgram = 
        request.status.includes('program') || 
        otherParty.title?.toLowerCase().includes('group mentoring') || 
        otherParty.title?.toLowerCase().includes('mentoring program');

    // Default dossier if not provided in data
    const dossier = otherParty.dossier || {
        employeeCode: 'N/A',
        email: 'N/A',
        grade: otherParty.grade || otherParty.title || 'N/A',
        location: 'Mumbai, India',
        experience: 'N/A',
        business: 'Jio Platforms',
        segment: 'Engineering',
        function: 'Technology'
    };

    const InfoGridItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="flex flex-col">
            <span className="text-xs text-r-gray-500 font-medium uppercase tracking-wide">{label}</span>
            <span className="text-sm font-semibold text-r-gray-900">{value}</span>
        </div>
    );

    // Date Label Logic
    const isAccepted = request.status === 'accepted' || request.status === 'mentor_accepted_program';
    const isRejected = request.status.includes('rejected');

    let dateLabel = '';
    if (isProgram) {
        dateLabel = isAccepted ? 'Enrolled on' : 'Applied on';
    } else {
        if (isAccepted) {
            dateLabel = 'Approved on';
        } else if (isRejected) {
            dateLabel = 'Rejected on';
        } else {
            dateLabel = 'Request sent on';
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-r-gray-200 overflow-hidden transition-all duration-300">
            {/* Summary Row (Always Visible) */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-r-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center space-x-4 flex-grow w-full sm:w-auto">
                    <img className="h-14 w-14 rounded-full border border-r-gray-300" src={otherParty.imageUrl} alt={otherParty.name} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 flex-grow">
                        <div className="min-w-[150px]">
                            <div className="flex flex-wrap gap-2 mb-1">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${isProgram ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {isProgram ? 'Program Mentoring' : 'Open Mentoring'}
                                </span>
                                {isProgram && otherParty.mentoringType && (
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-indigo-100 text-indigo-800 border border-indigo-200">
                                        {otherParty.mentoringType}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-heading font-bold text-lg text-r-gray-900">{otherParty.name}</h3>
                            <p className="text-sm text-r-gray-500">{otherParty.title || otherParty.grade}</p>
                        </div>
                        
                        {!isProgram && (
                            <div className="hidden sm:block h-10 w-px bg-r-gray-200"></div>
                        )}

                        <div className="flex-grow">
                            {!isProgram && (
                                <>
                                    <p className="text-xs text-r-gray-400 font-medium uppercase">Topic Covered</p>
                                    <p className="text-sm font-semibold text-r-gray-800 line-clamp-1">{request.topic}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                        <p className="text-xs text-r-gray-400 mb-1">{dateLabel}</p>
                        <p className="text-sm font-medium text-r-gray-900">{request.submittedDate}</p>
                    </div>
                    
                    <StatusBadge status={request.status} isProgram={isProgram} />

                    <button 
                        className={`p-2 rounded-full border border-r-gray-200 text-r-gray-500 hover:bg-r-blue-50 hover:text-r-blue transition-all ${isExpanded ? 'rotate-180 bg-r-gray-100' : ''}`}
                    >
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Expanded Details Section */}
            {isExpanded && (
                <div className="border-t border-r-gray-200 bg-r-gray-50/50 p-6 animate-fade-in-down">
                    
                    {isProgram ? (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-r-gray-900 mb-2">Program Description</h4>
                            <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                {otherParty.description || "No description available for this program."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-8">
                            <InfoGridItem label="Grade" value={dossier.grade} />
                            <InfoGridItem label="Experience" value={dossier.experience} />
                            <InfoGridItem label="Segment" value={dossier.segment} />
                            <InfoGridItem label="Function" value={dossier.function} />
                            <InfoGridItem label="Location" value={dossier.location} />
                            <InfoGridItem label="Business" value={dossier.business} />
                            <InfoGridItem label="Employee Code" value={dossier.employeeCode} />
                            <InfoGridItem label="Email" value={dossier.email} />
                        </div>
                    )}

                    {/* Context/Preferences Text */}
                    <div className="space-y-6 mb-6">
                        {/* Mentor viewing Mentee Request (Open Mentoring) */}
                        {!isProgram && userType === 'mentor' && (
                            <>
                                <div>
                                    <h4 className="text-sm font-bold text-r-gray-900 mb-2">My Ideal Mentor Is</h4>
                                    <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                        An ideal mentor is someone who inspires, guides, and nurtures personal and professional growth with empathy and wisdom. They possess a deep understanding of their field, yet remain approachable.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-r-gray-900 mb-2">My Mentoring Needs</h4>
                                    <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                        I am looking for guidance on how to navigate challenges, make informed decisions, and refine my skills, particularly in areas where I may lack experience.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Mentee viewing Mentor's Open Mentoring Profile in Pending */}
                        {!isProgram && userType === 'mentee' && request.status === 'pending_mentor' && (
                            <>
                                <div>
                                    <h4 className="text-sm font-bold text-r-gray-900 mb-2">My Ideal Mentee Is</h4>
                                    <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                        {otherParty.idealMentee || "Someone eager to learn and take initiative."}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-r-gray-900 mb-2">What Mentoring Means to Me</h4>
                                    <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                        {otherParty.mentoringMeaning || "Guiding others to unlock their potential."}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Request Note - Hidden for Programs as per requirement, shown for Open Mentoring */}
                        {!isProgram && request.noteToMentor && (
                            <div>
                                <h4 className="text-sm font-bold text-r-gray-900 mb-2">Note by {userType === 'mentor' ? 'Mentee' : 'Me'}</h4>
                                <p className="text-sm text-r-gray-700 leading-relaxed bg-white p-3 rounded border border-r-gray-200">
                                    {request.noteToMentor}
                                </p>
                            </div>
                        )}
                        
                        {/* Topics Pill - Hidden for Programs as per requirement */}
                        {!isProgram && (
                            <div>
                                <h4 className="text-sm font-bold text-r-gray-900 mb-2">Topics requested for mentoring</h4>
                                <span className="inline-block px-3 py-1 bg-white border border-r-gray-300 rounded-full text-sm text-r-gray-800 shadow-sm">
                                    {request.topic}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (Mentor View Only, Open Mentoring) */}
                    {userType === 'mentor' && request.status === 'pending_mentor' && onAccept && onReject && (
                        <div className="flex justify-end gap-4 pt-4 border-t border-r-gray-200">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onAccept(request.id); }} 
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-100 text-green-700 font-bold rounded-full hover:bg-green-200 transition-colors"
                            >
                                Accept <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onReject(request.id); }} 
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-100 text-red-700 font-bold rounded-full hover:bg-red-200 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                    
                    {/* Rejection Reason (Visible if rejected) */}
                    {(request.status.includes('rejected')) && request.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestCard;
