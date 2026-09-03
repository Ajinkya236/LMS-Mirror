
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import type { ActiveMentorship, EngagementSession, AssignedCourse, MenteeJournalEntry, EngagementFeedback, MentorshipTask } from '../types';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, PlusIcon, Edit2Icon, BookOpenIcon, CheckCircleIcon, CalendarIcon, XIcon, MoreHorizontalIcon, Trash2Icon, QuestionMarkCircleIcon, EyeIcon } from '../components/Icons';
import AddSessionModal from '../components/AddSessionModal';
import MentoringJournalModal from '../components/MentoringJournalModal';
import CourseCard from '../components/CourseCard';
import GoalSettingModal from '../components/GoalSettingModal';
import EngagementFeedbackModal from '../components/EngagementFeedbackModal';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import MarkAsCompleteModal from '../components/MarkAsCompleteModal';
import ProfileDossierModal from '../components/ProfileDossierModal';

const mockEngagements: { [id: string]: ActiveMentorship } = {
    'active1': {
        id: 'active1',
        participant: { 
            name: 'Priya Sharma', 
            title: 'Director of Engineering', 
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'E50012',
                email: 'priya.sharma@ril.com',
                grade: 'L8',
                location: 'Navi Mumbai',
                experience: '12 Years',
                business: 'Jio Platforms',
                segment: 'Engineering',
                function: 'Technology'
            }
        },
        topic: 'Leadership',
        startDate: '2024-07-20',
        status: 'active',
        sessions: [
            { id: 's1', title: 'Introductory Call', category: 'General Catch-up', startTime: '2024-07-22T14:00:00Z', endTime: '2024-07-22T14:30:00Z', status: 'completed', agenda: 'Get to know each other, discuss initial goals.', notes: { mentorNote: "Great first call. Sandeep is very motivated.", menteeNote: "Priya seems like a great mentor. Excited to start." }, tasks: [{id: 't1', text: 'Draft 3-month goals', status: 'completed', submission: {file: new File([], 'goals.pdf'), note: 'Here are my draft goals.'}, feedback: {rating: 5, text: 'Well-defined goals!'}, dueDate: '2024-07-25'}]},
            { id: 's2', title: 'Goal Refinement', category: 'Goal Setting', startTime: '2024-07-29T14:00:00Z', endTime: '2024-07-29T14:45:00Z', status: 'completed', agenda: 'Review and finalize mentorship goals.', tasks: [{id: 't2', text: 'Prepare a list of questions about team leadership', status: 'pending', dueDate: '2024-08-01'}]},
            { id: 's3', title: 'Stakeholder Communication', category: 'Skill Development', startTime: '2024-08-05T11:00:00Z', endTime: '2024-08-05T12:00:00Z', status: 'upcoming', agenda: 'Discuss strategies for effective stakeholder communication.'},
            { id: 's4', title: 'Team Leadership Plan Review', category: 'Goal Setting', startTime: '2024-08-12T11:00:00Z', endTime: '2024-08-12T12:00:00Z', status: 'upcoming', agenda: 'Review the draft of the team leadership plan.'},
        ],
        journal: [{ date: '2024-07-23', note: 'Reflecting on the first call, I need to focus on stakeholder communication.' }],
        assignedCourses: [{ id: 101, title: 'Leadership Principles', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1497032205566-5089c1a73938?w=400&h=225&fit=crop&q=80', tags: ['Leadership'], status: 'In Progress' }],
        goals: ['Improve stakeholder communication', 'Develop a team leadership plan', 'Prepare for senior role interviews']
    },
    'active2': {
        id: 'active2',
        participant: { 
            name: 'Rahul Verma', 
            grade: 'Associate Product Manager', 
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'E20045',
                email: 'rahul.verma@ril.com',
                grade: 'L4',
                location: 'Bangalore',
                experience: '3 Years',
                business: 'Reliance Retail',
                segment: 'Product',
                function: 'Product Management'
            }
        },
        topic: 'Product Management',
        startDate: '2024-06-15',
        status: 'active',
        sessions: [
             { id: 's3', title: 'PRD Review', category: 'Skill Development', startTime: '2024-07-25T10:00:00Z', endTime: '2024-07-25T11:00:00Z', status: 'completed', agenda: 'Review Rahul\'s latest PRD for the new feature.', notes: {mentorNote: 'PRD is well-structured, but needs more detail on success metrics.', menteeNote: 'Good feedback on the PRD.'}},
             { id: 's4', title: 'Prioritization Techniques', category: 'Skill Development', startTime: '2024-08-01T10:00:00Z', endTime: '2024-08-01T11:00:00Z', status: 'upcoming', agenda: 'Discuss RICE and MoSCoW frameworks.'},
        ],
        journal: [],
        assignedCourses: [
            { id: 201, title: 'Product Management Fundamentals', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=225&fit=crop&q=80', tags: ['Product'], status: 'Completed' },
            { id: 202, title: 'Agile for Product Managers', provider: 'LinkedIn Learning', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', tags: ['Agile'], status: 'In Progress' },
        ],
        goals: ['Improve PRD writing skills', 'Learn prioritization techniques']
    },
    'completed1': {
        id: 'completed1',
        participant: { name: 'Rohan Mehta', title: 'Senior Product Manager', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80' },
        topic: 'Product Strategy',
        startDate: '2024-01-10',
        status: 'completed'
    },
    'completed2': {
        id: 'completed2',
        participant: { name: 'Anika Singh', grade: 'Junior Developer', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80' },
        topic: 'Onboarding',
        startDate: '2024-02-01',
        status: 'completed'
    }
};

const MentorshipEngagementPage: React.FC = () => {
    const { engagementId } = useParams<{ engagementId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const userRole = location.state?.userRole || 'mentee';
    
    const [engagement, setEngagement] = useState<ActiveMentorship | null>(null);
    const [activeTab, setActiveTab] = useState('Sessions');
    
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<EngagementSession | null>(null);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    
    const [sessionToComplete, setSessionToComplete] = useState<EngagementSession | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    
    useEffect(() => {
        if (engagementId) {
            const engagementData = mockEngagements[engagementId];
            if (!engagementData) {
                setEngagement(null);
                return;
            }
            const data = JSON.parse(JSON.stringify(engagementData));
            if (location.state?.newlyAssignedCourse && data) {
                data.assignedCourses = [...(data.assignedCourses || []), location.state.newlyAssignedCourse];
            }
            setEngagement(data);
        }
    }, [engagementId, location.state]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openActionMenu) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openActionMenu]);

    const journey = userRole === 'mentee' ? 'Mentee Journey' : 'Mentor Journey';
    const journeyPath = userRole === 'mentee' ? '/mentor/mentee-journey' : '/mentor/mentor-journey';

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: journey, path: journeyPath },
        { label: 'Engagement', path: `/mentor/engagement/${engagementId}` },
    ];

    if (!engagement) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-r-gray-50">
                <p className="text-xl text-r-gray-700">Mentorship engagement not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 flex items-center text-sm font-medium text-r-blue hover:underline">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Go Back
                </button>
            </div>
        );
    }
    
    const TABS = ['Sessions', 'Courses'];

    const otherPartyDetails = userRole === 'mentee' 
        ? engagement.participant 
        : { 
            name: 'Sandeep Gupta', 
            title: 'Senior Engineer', 
            imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'EMP12345',
                email: 'sandeep.gupta@ril.com',
                grade: 'L5',
                location: 'Mumbai',
                experience: '5 Years',
                business: 'Jio Platforms',
                segment: 'Engineering',
                function: 'Technology'
            }
        };

    const handleSessionSubmit = (sessionData: Omit<EngagementSession, 'id' | 'status'>) => {
        console.log("Session submitted:", sessionData);
        setIsSessionModalOpen(false);
        setEditingSession(null);
    };
    
    const handleJournalSubmit = (newNote: string) => {
        console.log("Journal entry:", newNote);
        setIsJournalModalOpen(false);
    }
    
    const handleGoalSubmit = (goals: string[]) => {
        setEngagement(e => e ? {...e, goals} : null);
        setIsGoalModalOpen(false);
    };
    
    const handleFeedbackSubmit = (feedback: EngagementFeedback) => {
        setEngagement(e => e ? {...e, status: 'completed', feedback} : null);
        setIsFeedbackModalOpen(false);
        navigate(`/certificate/${engagement.id}`, { state: { userRole } });
    };
    
    const handleMarkAsComplete = (sessionId: string) => {
        setEngagement(prev => {
            if (!prev || !prev.sessions) return prev;
            const updatedSessions = prev.sessions.map(s => s.id === sessionId ? { ...s, status: 'completed' as const } : s);
            return { ...prev, sessions: updatedSessions };
        });
        setSessionToComplete(null);
    };
    
    const handleDeleteSession = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            setEngagement(prev => {
                if (!prev || !prev.sessions) return prev;
                return { ...prev, sessions: prev.sessions.filter(s => s.id !== sessionId) };
            });
        }
    };

    const upcomingSession = engagement.sessions?.filter(s => s.status === 'upcoming').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div className="flex items-center space-x-4">
                            <img className="h-16 w-16 rounded-full" src={otherPartyDetails.imageUrl} alt={otherPartyDetails.name} />
                            <div>
                                <p className="text-sm text-r-gray-500 capitalize">{userRole === 'mentee' ? 'Mentor' : 'Mentee'}</p>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-heading font-bold text-r-gray-900">{otherPartyDetails.name}</h1>
                                    <button onClick={() => setIsDossierOpen(true)} className="text-r-gray-400 hover:text-r-blue p-1 rounded-full hover:bg-r-blue-50 transition-colors">
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-r-gray-600">Topic: <span className="font-semibold">{engagement.topic}</span></p>
                            </div>
                        </div>
                        {engagement.status === 'active' && (
                             <button onClick={() => setIsFeedbackModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700">
                                End Engagement
                            </button>
                        )}
                        {engagement.status === 'completed' && (
                            <Link to={`/certificate/${engagement.id}`} state={{ userRole }} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4"/> View Certificate
                            </Link>
                        )}
                    </div>
                </div>

                 <div>
                    <div className="border-b border-r-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab ? 'border-r-blue text-r-blue' : 'border-transparent text-r-gray-500 hover:text-r-gray-700 hover:border-r-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8">
                        {activeTab === 'Sessions' && (
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold text-gray-800">Goal Setting by Mentee</h3>
                                            {userRole === 'mentee' && engagement.status === 'active' && (
                                            <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-r-blue border border-r-blue rounded-lg hover:bg-r-blue-50">
                                                <PlusIcon className="w-4 h-4" /> Add Goal
                                            </button>
                                            )}
                                        </div>
                                        <div className="p-3 bg-blue-50/50 rounded-lg space-y-2">
                                            {(engagement.goals || []).slice(0, 2).map((goal, i) => (
                                            <div key={i} className="text-sm text-gray-700">{goal}</div>
                                            ))}
                                            {(!engagement.goals || engagement.goals.length === 0) && <p className="text-sm text-gray-500">No goals set yet.</p>}
                                        </div>
                                        {engagement.goals && engagement.goals.length > 2 && (
                                            <div className="text-right mt-2">
                                            <button onClick={() => setIsGoalModalOpen(true)} className="text-sm font-semibold text-r-blue hover:underline">View All</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-2">Upcoming Session</h3>
                                        {upcomingSession ? (
                                            <div>
                                                <p className="font-semibold text-lg">{new Date(upcomingSession.startTime).toLocaleDateString('en-US', {weekday: 'long'})}</p>
                                                <p className="text-gray-600">{new Date(upcomingSession.startTime).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric'})}, {new Date(upcomingSession.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} to {new Date(upcomingSession.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</p>
                                                <div className="mt-4 flex gap-2">
                                                    <button className="flex-1 px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50">Cancel</button>
                                                    <button onClick={() => { setEditingSession(upcomingSession); setIsSessionModalOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-r-blue bg-white border border-r-blue rounded-lg hover:bg-r-blue-50">
                                                        <CalendarIcon className="w-4 h-4" /> Reschedule
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">To be scheduled</p>
                                        )}
                                    </div>

                                    {/* Add Course Button */}
                                    {userRole === 'mentor' && (
                                        <div className="bg-white p-4 rounded-xl shadow-sm">
                                            <button 
                                                onClick={() => navigate('/discover')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-r-blue rounded-lg hover:bg-r-blue-dark shadow-sm transition-colors"
                                            >
                                                <PlusIcon className="w-5 h-5"/> Add Course
                                            </button>
                                        </div>
                                    )}

                                    {userRole === 'mentee' && (
                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <button onClick={() => setIsJournalModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-r-blue border-2 border-r-blue rounded-lg hover:bg-r-blue-50">
                                            <BookOpenIcon className="w-5 h-5"/> My Journal
                                        </button>
                                    </div>
                                    )}
                                </div>
                                
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold">Mentoring Sessions</h2>
                                            {(userRole === 'mentor' || userRole === 'mentee') && engagement.status === 'active' && <button onClick={() => { setEditingSession(null); setIsSessionModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark"><PlusIcon className="w-4 h-4"/> Add Session</button>}
                                        </div>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-r-blue text-white">
                                                    <tr>
                                                        <th className="p-3 text-left font-semibold">Session Title</th>
                                                        <th className="p-3 text-left font-semibold">Date &amp; Time</th>
                                                        <th className="p-3 text-left font-semibold">Notes &amp; Tasks</th>
                                                        <th className="p-3 text-left font-semibold">Session Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-black">
                                                    {(engagement.sessions || []).map(session => {
                                                        const hasPendingTasks = session.tasks?.some(t => t.status !== 'completed');
                                                        const isCurrentSession = new Date() > new Date(session.startTime) && new Date() < new Date(session.endTime) && session.status === 'upcoming';
                                                        return (
                                                            <tr key={session.id} className="border-b last:border-b-0">
                                                                <td className="p-3 align-top">{session.title}</td>
                                                                <td className="p-3 align-top whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{new Date(session.startTime).toLocaleDateString('en-GB')} | {new Date(session.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</span>
                                                                        {(userRole === 'mentor' || userRole === 'mentee') && engagement.status === 'active' && (
                                                                            <div className="relative">
                                                                                <button onClick={(e) => { e.stopPropagation(); setOpenActionMenu(session.id); }} className="p-1 rounded-full hover:bg-gray-200"><MoreHorizontalIcon className="w-4 h-4 text-gray-600" /></button>
                                                                                {openActionMenu === session.id && (
                                                                                    <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg z-10 border">
                                                                                        <button onClick={() => { setEditingSession(session); setIsSessionModalOpen(true); }} className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Edit</button>
                                                                                        <button onClick={() => handleDeleteSession(session.id)} className="block w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 align-top">
                                                                    <button 
                                                                        onClick={() => navigate(`/session/${session.id}/notes`, { 
                                                                            state: { 
                                                                                session: session, 
                                                                                userRole: userRole,
                                                                                contextTitle: otherPartyDetails.name
                                                                            } 
                                                                        })} 
                                                                        className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600"
                                                                    >
                                                                        <Edit2Icon className="w-5 h-5"/>
                                                                    </button>
                                                                </td>
                                                                <td className="p-3 align-top">
                                                                    {isCurrentSession ? (
                                                                        <button className="px-4 py-1.5 text-sm font-semibold text-white bg-r-blue rounded-full hover:bg-r-blue-dark">Join Session</button>
                                                                    ) : session.status === 'completed' ? (
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>
                                                                            {hasPendingTasks && (
                                                                                <div className="relative group"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" /><div className="absolute bottom-full -left-1/2 mb-2 hidden group-hover:block w-28 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center">Tasks Pending</div></div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1">
                                                                            <button onClick={() => setSessionToComplete(session)} className="px-3 py-1 text-sm font-semibold text-r-blue bg-white border border-r-blue rounded-full hover:bg-r-blue-50">Mark as Complete</button>
                                                                            {hasPendingTasks && (
                                                                                 <div className="relative group"><QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" /><div className="absolute bottom-full -left-1/2 mb-2 hidden group-hover:block w-28 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center">Tasks Pending</div></div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-4">*Note: Please mark all sessions as Completed to End your Engagement.</p>
                                    </div>
                                </div>
                           </div>
                        )}
                         {activeTab === 'Courses' && (
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                   <h3 className="text-lg font-heading font-semibold text-r-gray-800">Courses</h3>
                                   {userRole === 'mentor' && engagement.status === 'active' && (
                                       <Link to="/mentor/assign-courses" state={{ mentee: otherPartyDetails, engagementId: engagement.id }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark">
                                           <PlusIcon className="w-4 h-4"/> Assign Course
                                       </Link>
                                   )}
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {engagement.assignedCourses?.map(course => <CourseCard key={course.id} course={course} />)}
                               </div>
                               {(!engagement.assignedCourses || engagement.assignedCourses.length === 0) && <p className="text-r-gray-500">No courses assigned yet.</p>}
                            </div>
                         )}
                    </div>
                </div>
            </div>
             {sessionToComplete && (
                <MarkAsCompleteModal
                    isOpen={!!sessionToComplete}
                    onClose={() => setSessionToComplete(null)}
                    onConfirm={() => handleMarkAsComplete(sessionToComplete.id)}
                    sessionTitle={sessionToComplete.title}
                    hasPendingTasks={sessionToComplete.tasks?.some(t => t.status !== 'completed') || false}
                />
             )}
             <AddSessionModal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} onSubmit={handleSessionSubmit} initialData={editingSession} />
             <MentoringJournalModal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} onSubmit={handleJournalSubmit} journalEntries={engagement.journal || []} />
             <GoalSettingModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSubmit={handleGoalSubmit} initialGoals={engagement.goals || []} />
             <EngagementFeedbackModal 
                isOpen={isFeedbackModalOpen} 
                onClose={() => setIsFeedbackModalOpen(false)} 
                onConfirm={handleFeedbackSubmit}
                participant={engagement.participant}
                topic={engagement.topic}
             />
             <ProfileDossierModal
                isOpen={isDossierOpen}
                onClose={() => setIsDossierOpen(false)}
                participant={otherPartyDetails}
             />
        </div>
    );
};

export default MentorshipEngagementPage;
