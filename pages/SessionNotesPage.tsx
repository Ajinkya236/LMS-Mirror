
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, Edit2Icon, Trash2Icon, ChevronUpIcon, ChevronDownIcon } from '../components/Icons';
import TaskComponent from '../components/TaskComponent';
import type { EngagementSession, MentorshipTask } from '../types';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

const SessionNotesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve state passed from the previous page
    const sessionData = location.state?.session as EngagementSession | undefined;
    const userRole = location.state?.userRole as 'mentor' | 'mentee' | undefined;
    const contextTitle = location.state?.contextTitle || 'Engagement';

    // Local state to manage edits on this page
    const [session, setSession] = useState<EngagementSession | undefined>(sessionData);
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [isNotesOpen, setIsNotesOpen] = useState(true);
    const [isTasksOpen, setIsTasksOpen] = useState(true);

    if (!session || !userRole) {
        return (
            <div className="bg-r-gray-50 min-h-screen">
                <MentorSubHeader />
                <div className="p-8 text-center text-r-gray-600">
                    <p>Session data not found.</p>
                    <button onClick={() => navigate(-1)} className="block mx-auto mt-4 text-r-blue hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: userRole === 'mentee' ? 'Mentee Journey' : 'Mentor Journey', path: userRole === 'mentee' ? '/mentor/mentee-journey' : '/mentor/mentor-journey' },
        { label: 'Session Notes', path: '#' },
    ];

    const handleNoteChange = (noteType: 'mentorNote' | 'menteeNote', value: string) => {
        setSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                notes: {
                    ...prev.notes,
                    [noteType]: value
                }
            };
        });
    };

    const handleTaskUpdate = (updatedTasks: MentorshipTask[]) => {
        setSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                tasks: updatedTasks
            };
        });
    };

    // Mock link for display
    const sessionLink = "https://jiomeetpro.jio.com/guest?meetingId=5981493084&pwd=T2Vky&hostToken=5R3atUhdB6SD";

    const DetailRow: React.FC<{ label: string; value: string; isLink?: boolean }> = ({ label, value, isLink }) => (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1">
            <span className="text-sm font-medium text-gray-500">{label}:</span>
            <span className={`text-sm col-span-3 font-semibold ${isLink ? 'text-blue-600 break-all' : 'text-gray-900'}`}>
                {isLink ? <a href="#" onClick={e => e.preventDefault()}>{value}</a> : value}
            </span>
        </div>
    );

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white bg-white shadow-sm border border-gray-200">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">{session.title} - Notes and Tasks</h1>
                </div>

                <div className="space-y-6">
                    {/* Session Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                            className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        >
                            <h2 className="text-lg font-bold text-gray-900">Session Details</h2>
                            <div className="flex items-center gap-4">
                                {(userRole === 'mentor' || userRole === 'mentee') && (
                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                        <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit Session">
                                            <Edit2Icon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100" title="Delete Session">
                                            <Trash2Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <button className="text-gray-500">
                                    {isDetailsOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        
                        {isDetailsOpen && (
                            <div className="p-6 border-t border-gray-200 space-y-4">
                                <DetailRow label="Session Title" value={session.title} />
                                <DetailRow label="Session Description" value={session.agenda} />
                                <DetailRow label="Session Category" value={session.category} />
                                <DetailRow label="Date" value={new Date(session.startTime).toLocaleDateString('en-GB')} />
                                <DetailRow label="Time" value={`${new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} />
                                <DetailRow label="Session Link" value={sessionLink} isLink />
                            </div>
                        )}
                    </div>

                    {/* Notes Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                            className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setIsNotesOpen(!isNotesOpen)}
                        >
                            <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                            <button className="text-gray-500">
                                {isNotesOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                            </button>
                        </div>

                        {isNotesOpen && (
                            <div className="p-6 border-t border-gray-200 space-y-8">
                                {/* Mentor Notes */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900">Mentor Notes</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">(Notes will be visible to the mentee.)</span>
                                    </div>
                                    
                                    {userRole === 'mentor' ? (
                                        <textarea
                                            value={session.notes?.mentorNote || ''}
                                            onChange={(e) => handleNoteChange('mentorNote', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                            rows={3}
                                            placeholder="Enter notes..."
                                        />
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{session.notes?.mentorNote || 'No notes added by mentor.'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Mentee Notes */}
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">Mentee Notes</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">(Notes will be visible to the mentor.)</span>
                                        </div>
                                        {userRole === 'mentee' && (
                                            <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                                                <Edit2Icon className="w-4 h-4"/>
                                            </button>
                                        )}
                                    </div>

                                    {userRole === 'mentee' ? (
                                        <textarea
                                            value={session.notes?.menteeNote || ''}
                                            onChange={(e) => handleNoteChange('menteeNote', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                            rows={3}
                                            placeholder="Enter notes..."
                                        />
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{session.notes?.menteeNote || 'No notes added by mentee.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tasks Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                            className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setIsTasksOpen(!isTasksOpen)}
                        >
                            <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
                            <button className="text-gray-500">
                                {isTasksOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                            </button>
                        </div>

                        {isTasksOpen && (
                            <div className="p-6 border-t border-gray-200">
                                <TaskComponent tasks={session.tasks || []} onTaskUpdate={handleTaskUpdate} userRole={userRole} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionNotesPage;
