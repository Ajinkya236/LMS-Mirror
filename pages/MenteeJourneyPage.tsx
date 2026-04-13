
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { Edit2Icon, CalendarIcon, MessageSquareIcon, HourglassIcon, UsersIcon, BookOpenIcon, CheckCircleIcon } from '../components/Icons';
import RequestCard from '../components/RequestCard';
import type { MenteePreferences, MentorshipRequest, ActiveMentorship } from '../types';
import ActiveMentorshipCard from '../components/ActiveMentorshipCard';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

const REQUEST_FILTERS = ['Pending', 'Programs Applied', 'Accepted', 'Rejected'];

const mockMenteePreferences: MenteePreferences = {
  name: 'Ajinkya Patil',
  employeeCode: 'EMP12345',
  email: 'ajinkya.patil@r-university.com',
  grade: 'Senior Engineer',
  location: 'Mumbai',
  experience: '5 Years',
  mentoringNeeds: 'Learn role-based skills, power skills, and business knowledge.',
  idealMentor: 'Someone humble with experiential knowledge.',
  preferredTopics: ['Leadership', 'System Design'],
};

const mockMenteeRequests: MentorshipRequest[] = [
    { 
        id: 'req2', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Rohan Mehta', 
            title: 'Senior Product Manager', 
            imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: '5002341',
                email: 'rohan.mehta@ril.com',
                grade: 'L7',
                location: 'Mumbai',
                experience: '10 Years',
                business: 'Jio Platforms',
                segment: 'Product',
                function: 'Technology'
            },
            idealMentee: 'Curious and driven individuals.',
            mentoringMeaning: 'Giving back to the community.'
        }, 
        topic: 'Product Strategy', 
        status: 'rejected_mentor', 
        submittedDate: '27-07-2024, 10:00 AM', 
        rejectionReason: 'Not accepting new mentees at the moment.'
    },
    { 
        id: 'req3', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Anjali Desai', 
            title: 'Lead Architect', 
            imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: '5008892',
                email: 'anjali.desai@ril.com',
                grade: 'L6',
                location: 'Bangalore',
                experience: '8 Years',
                business: 'Retail',
                segment: 'Engineering',
                function: 'Technology'
            },
            idealMentee: 'Someone passionate about code quality.',
            mentoringMeaning: 'Building the next generation of architects.'
        }, 
        topic: 'Technical Leadership', 
        status: 'pending_mentor', 
        submittedDate: '28-07-2024, 02:30 PM',
        noteToMentor: 'I admire your work on the new architecture and would love to learn from your experience in designing scalable systems.'
    },
    { 
        id: 'req_prog_pending', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Tech Mentoring Program', 
            title: 'Group Mentoring', 
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'PROG-001',
                email: 'learning@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Training',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Open',
            description: 'A structured program for aspiring tech leaders, focusing on advanced technical skills, leadership, and project ownership.'
        }, 
        topic: 'System Design', 
        status: 'pending_program', 
        submittedDate: '29-07-2024, 09:15 AM'
    },
    { 
        id: 'req_accepted', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Sameer Khan', 
            title: 'Program Manager', 
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: '5001122',
                email: 'sameer.khan@ril.com',
                grade: 'L6',
                location: 'Delhi',
                experience: '12 Years',
                business: 'Jio',
                segment: 'Operations',
                function: 'Management'
            },
            idealMentee: 'Organized and goal-oriented.',
            mentoringMeaning: 'Sharing practical management tips.'
        }, 
        topic: 'Project Management', 
        status: 'accepted', 
        submittedDate: '25-07-2024, 11:00 AM'
    },
    { 
        id: 'req_prog_accepted', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Data Science for All', 
            title: 'Group Mentoring Program', 
            imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'PROG-002',
                email: 'learning@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Training',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Closed',
            description: 'A comprehensive program covering Machine Learning, Python, and Data Visualization.'
        }, 
        topic: 'Machine Learning', 
        status: 'accepted', 
        submittedDate: '29-07-2024, 04:20 PM'
    },
    { 
        id: 'req_prog_rejected', 
        mentee: { name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80'}, 
        mentor: { 
            name: 'Future Leaders Program', 
            title: 'Group Mentoring', 
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
            dossier: {
                employeeCode: 'PROG-003',
                email: 'learning@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Training',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Open',
            description: 'Accelerated development for high-potential individuals aiming for leadership roles.'
        }, 
        topic: 'Strategy', 
        status: 'rejected_program', 
        submittedDate: '26-07-2024, 05:00 PM', 
        rejectionReason: 'Program is currently full. Please apply for the next cohort.'
    },
];

const mockMenteeActiveMentorships: ActiveMentorship[] = [
    {
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
                function: 'Technology' // Will be shown as Vertical
            }
        },
        topic: 'Leadership',
        startDate: '2024-07-20',
        status: 'active'
    }
];

const mockMenteeActivePrograms: ActiveMentorship[] = [
    {
        id: 'prog_1o1_closed',
        participant: { name: 'Executive Leadership', title: 'Mentoring Program', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        topic: 'Executive Presence',
        startDate: '2024-08-01',
        status: 'active',
        mentoringType: 'One-on-One',
        programType: 'Closed'
    },
    {
        id: 'prog_1o1_open',
        participant: { name: 'Tech Leads Rising', title: 'Mentoring Program', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80' },
        topic: 'System Design',
        startDate: '2024-08-05',
        status: 'active',
        mentoringType: 'One-on-One',
        programType: 'Open'
    },
    {
        id: 'prog_group_open',
        participant: { name: 'Data Science for All', title: 'Mentoring Program', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&q=80' },
        topic: 'Machine Learning',
        startDate: '2024-08-10',
        status: 'active',
        mentoringType: 'Group',
        programType: 'Open'
    },
    {
        id: 'prog_group_closed',
        participant: { name: 'Women in Tech Cohort 5', title: 'Mentoring Program', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80' },
        topic: 'Career Growth',
        startDate: '2024-08-15',
        status: 'active',
        mentoringType: 'Group',
        programType: 'Closed'
    }
];

const mockMenteeCompletedMentorships: ActiveMentorship[] = [
     {
        id: 'completed1',
        participant: { name: 'Vikram Singh', title: 'Agile Coach', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80' },
        topic: 'Project Management',
        startDate: '2024-01-15',
        status: 'completed'
    },
    {
        id: 'completed_prog_1',
        participant: { name: 'Tech Mentoring Program', title: 'Group Mentoring Program', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        topic: 'Leadership',
        startDate: '2023-11-01',
        status: 'completed'
    }
];

const MenteeJourneyPage: React.FC = () => {
    const [preferences, setPreferences] = useState<MenteePreferences>(mockMenteePreferences);
    const [activeTab, setActiveTab] = useState('Requests');
    const [activeRequestFilter, setActiveRequestFilter] = useState('Pending');
    const navigate = useNavigate();
    
    const TABS = [
        { name: 'Requests', count: mockMenteeRequests.length },
        { name: 'Active Mentorships', count: mockMenteeActiveMentorships.length },
        { name: 'Active Programs', count: mockMenteeActivePrograms.length },
        { name: 'Completed', count: mockMenteeCompletedMentorships.length }
    ];

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentee Journey', path: '/mentor/mentee-journey' },
    ];

    const formatSessionTimeRange = (startStr: string) => {
        const startDate = new Date(startStr);
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', dateOptions)} | ${startDate.toLocaleTimeString('en-US', timeOptions)}`;
    };

    const filteredRequests = useMemo(() => {
        if (activeRequestFilter === 'Pending') {
            // Only Pending Open Mentoring Requests
            return mockMenteeRequests.filter(req => req.status === 'pending_mentor');
        }
        if (activeRequestFilter === 'Programs Applied') {
            // Only Pending Program Requests
            return mockMenteeRequests.filter(req => req.status === 'pending_program');
        }
        if (activeRequestFilter === 'Accepted') {
            return mockMenteeRequests.filter(req => req.status === 'accepted');
        }
        if (activeRequestFilter === 'Rejected') {
            return mockMenteeRequests.filter(req => req.status.startsWith('rejected'));
        }
        return [];
    }, [activeRequestFilter]);

    const pendingCount = useMemo(() => mockMenteeRequests.filter(req => req.status === 'pending_mentor' || req.status === 'pending_program').length, []);
    const activeMentorshipsCount = mockMenteeActiveMentorships.length;
    const activeProgramsCount = mockMenteeActivePrograms.length;
    const completedCount = mockMenteeCompletedMentorships.length;

    const statCards = [
        {
            label: 'Requests',
            count: pendingCount,
            colorClasses: 'bg-yellow-100 text-yellow-800',
            icon: <HourglassIcon className="w-6 h-6 opacity-70" />,
            onClick: () => {
                setActiveTab('Requests');
                setActiveRequestFilter('Pending');
            }
        },
        {
            label: 'Active Mentorships',
            count: activeMentorshipsCount,
            colorClasses: 'bg-r-blue-50 text-r-blue-dark',
            icon: <UsersIcon className="w-6 h-6 opacity-70" />,
            onClick: () => setActiveTab('Active Mentorships')
        },
        {
            label: 'Active Programs',
            count: activeProgramsCount,
            colorClasses: 'bg-green-100 text-green-800',
            icon: <BookOpenIcon className="w-6 h-6 opacity-70" />,
            onClick: () => setActiveTab('Active Programs')
        },
        {
            label: 'Completed',
            count: completedCount,
            colorClasses: 'bg-r-gray-100 text-r-gray-700',
            icon: <CheckCircleIcon className="w-6 h-6 opacity-70" />,
            onClick: () => setActiveTab('Completed')
        }
    ];
    
    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <img className="h-16 w-16 rounded-full" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" alt="Mentee" />
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-r-gray-900">{preferences.name}</h2>
                                <p className="text-sm text-r-gray-500">{preferences.grade}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/mentor/search')} className="bg-r-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-r-blue-dark transition-colors duration-300 shadow-sm text-sm" aria-label="Find Mentors and Programs">
                               Find Mentors and Programs
                             </button>
                            <button onClick={() => navigate('/mentor/mentee-journey/preferences')} className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-r-blue hover:text-r-blue-dark px-4 py-2 rounded-lg border border-r-gray-200 hover:bg-r-blue-50 transition-colors">
                                <Edit2Icon className="w-4 h-4" />
                                <span>Edit Preferences</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(card => (
                             <button key={card.label} onClick={card.onClick} className={`group p-4 rounded-lg transition-transform hover:scale-105 ${card.colorClasses}`}>
                                <div className="flex items-center gap-4">
                                    {React.cloneElement(card.icon, { className: "w-8 h-8 opacity-75" })}
                                    <div className="text-left">
                                        <p className="text-3xl font-bold">{card.count}</p>
                                        <p className="text-sm font-medium group-hover:underline">{card.label}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Upcoming Sessions */}
                        <div className="bg-r-gray-50 border p-2.5 rounded-xl shadow-sm">
                            <h3 className="font-heading font-semibold text-sm mb-1.5">Upcoming Session</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-start space-x-1.5">
                                    <div className="bg-r-blue-50 p-1.5 rounded-full flex-shrink-0">
                                        <CalendarIcon className="w-3.5 h-3.5 text-r-blue" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-r-gray-800 text-xs">Goal Refinement</p>
                                        <p className="text-xs text-r-gray-500">with Priya Sharma</p>
                                        <p className="text-xs text-r-gray-600 mt-0.5 font-medium">{formatSessionTimeRange('2024-07-29T14:00:00Z')}</p>
                                    </div>
                                </div>
                                <button onClick={() => alert('Joining meeting...')} className="ml-2 flex-shrink-0 px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700">
                                    Join
                                </button>
                            </div>
                        </div>

                        {/* Actionables */}
                        <div className="bg-r-gray-50 border p-2.5 rounded-xl shadow-sm">
                            <h3 className="font-heading font-semibold text-sm mb-1.5">Actionables</h3>
                             <div className="flex items-center justify-between">
                                <div className="flex items-start space-x-1.5">
                                    <div className="bg-yellow-50 p-1.5 rounded-full flex-shrink-0">
                                        <MessageSquareIcon className="w-3.5 h-3.5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-r-gray-800 text-xs">Pending Feedback</p>
                                        <p className="text-xs text-r-gray-500">For mentorship on 'Project Management' with Vikram Singh.</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/mentor/engagement/completed1', { state: { userRole: 'mentee' } })} className="ml-2 flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs font-semibold text-r-blue-dark bg-r-blue-100 rounded-full hover:bg-r-blue-200">
                                    Mark Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="border-b border-r-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`${
                                        activeTab === tab.name
                                            ? 'border-r-blue text-r-blue'
                                            : 'border-transparent text-r-gray-500 hover:text-r-gray-700 hover:border-r-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.name} ({tab.count})
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8">
                        {activeTab === 'Requests' && (
                            <div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {REQUEST_FILTERS.map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveRequestFilter(filter)}
                                            className={`px-3 py-1 text-sm rounded-full ${activeRequestFilter === filter ? 'bg-r-blue text-white' : 'bg-white text-r-gray-900 border border-gray-200'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map(req => <RequestCard key={req.id} request={req} userType="mentee" />)
                                    ) : (
                                        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                                            <p className="text-r-gray-500">No items found for this filter.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                         {activeTab === 'Active Mentorships' && (
                           <div className="space-y-4">
                                {mockMenteeActiveMentorships.map(mentorship => <ActiveMentorshipCard key={mentorship.id} mentorship={mentorship} userType="mentee" />)}
                           </div>
                        )}
                        {activeTab === 'Completed' && (
                           <div className="space-y-4">
                                {mockMenteeCompletedMentorships.map(mentorship => <ActiveMentorshipCard key={mentorship.id} mentorship={mentorship} userType="mentee" />)}
                           </div>
                        )}
                         {activeTab === 'Active Programs' && (
                            <div className="space-y-4">
                               {mockMenteeActivePrograms.length > 0 ? (
                                   mockMenteeActivePrograms.map(program => <ActiveMentorshipCard key={program.id} mentorship={program} userType="mentee" />)
                               ) : (
                                    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                                        <p className="text-r-gray-500">You are not currently enrolled in any mentoring programs.</p>
                                    </div>
                               )}
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeJourneyPage;
