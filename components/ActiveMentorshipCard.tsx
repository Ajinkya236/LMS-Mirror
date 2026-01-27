
import React from 'react';
import { Link } from 'react-router-dom';
import type { ActiveMentorship } from '../types';

interface ActiveMentorshipCardProps {
  mentorship: ActiveMentorship;
  userType: 'mentee' | 'mentor';
  onViewGoals?: (mentorship: ActiveMentorship) => void;
}

const ActiveMentorshipCard: React.FC<ActiveMentorshipCardProps> = ({ mentorship, userType, onViewGoals }) => {
    // Check if it's a program by checking for program specific properties or type
    const isProgram = mentorship.participant.title?.toLowerCase().includes('mentoring program') || !!mentorship.mentoringType;
    
    const engagementLink = isProgram 
        ? `/program-engagement/${mentorship.id}` 
        : `/mentor/engagement/${mentorship.id}`;

    // Get Business and Vertical from dossier if available
    const business = mentorship.participant.dossier?.business;
    const vertical = mentorship.participant.dossier?.function; // Using function as vertical
    const hasBusinessInfo = business || vertical;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-start gap-4 transition-all hover:shadow-md">
            <div className="flex items-center space-x-5 flex-grow">
                <img className="h-16 w-16 rounded-full object-cover border border-gray-100" src={mentorship.participant.imageUrl} alt={mentorship.participant.name} />
                
                {/* Content Area */}
                {isProgram ? (
                    // Program Layout
                    <div className="flex-grow">
                        <div className="flex flex-col gap-1">
                            <Link to={engagementLink} state={{ userRole: userType }} className="hover:underline hover:text-r-blue-dark">
                                <h3 className="font-heading font-semibold text-r-gray-800 text-lg leading-tight">
                                    {mentorship.participant.name}
                                </h3>
                            </Link>
                            
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-purple-100 text-purple-800">
                                    Mentoring Program
                                </span>
                                {mentorship.mentoringType && (
                                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {mentorship.mentoringType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Open Mentoring Layout with Vertical Divider
                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
                        <div className="flex-grow sm:pr-6 sm:border-r sm:border-gray-200">
                             <div className="mb-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-800">
                                    OPEN MENTORING
                                </span>
                            </div>
                            <Link to={engagementLink} state={{ userRole: userType }} className="hover:underline hover:text-r-blue-dark">
                                <h3 className="font-heading font-bold text-r-gray-900 text-xl leading-tight mb-1">
                                    {mentorship.participant.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-r-gray-500">{mentorship.participant.title || mentorship.participant.grade}</p>
                             {hasBusinessInfo && (
                                <p className="text-xs text-r-gray-500 mt-1">
                                    {business} {business && vertical ? '|' : ''} {vertical}
                                </p>
                            )}
                        </div>
                        
                        <div className="mt-3 sm:mt-0 sm:pl-6 min-w-[150px]">
                             {mentorship.topic && (
                                <div>
                                    <p className="text-xs text-r-gray-400 font-bold uppercase tracking-widest mb-1">TOPIC COVERED</p>
                                    <p className="text-lg font-heading font-bold text-r-gray-800 leading-tight">{mentorship.topic}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Actions */}
            <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-3 self-center">
                <div className="flex items-center gap-2">
                    {userType === 'mentor' && mentorship.goals && mentorship.goals.length > 0 && (
                        <button
                            onClick={() => onViewGoals?.(mentorship)}
                            className="px-4 py-2 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50 transition-colors"
                        >
                            View Goals
                        </button>
                    )}
                    <Link 
                        to={engagementLink}
                        state={{ userRole: userType }}
                        className="px-5 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark transition-colors shadow-sm"
                    >
                        View Engagement
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActiveMentorshipCard;
