
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { Edit2Icon, PlusIcon, SearchIcon, FilterIcon, SortUpDownIcon, Trash2Icon, MoreHorizontalIcon, EyeIcon, CopyIcon, UploadIcon, DownloadIcon, FileCsvIcon, CalendarIcon, MessageSquareIcon, HourglassIcon, UsersIcon, BookOpenIcon, CheckCircleIcon, XIcon } from '../components/Icons';
import RequestCard from '../components/RequestCard';
import type { MentorPreferences, MentorshipRequest, ActiveMentorship, AppliedMentor } from '../types';
import ActiveMentorshipCard from '../components/ActiveMentorshipCard';
import ViewGoalsModal from '../components/ViewGoalsModal';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import SearchableDropdown from '../components/SearchableDropdown';

const REQUEST_FILTERS = ['Pending', 'Accepted', 'Rejected', 'Programs Applied'];

const LOCATION_OPTIONS = ['All', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote'];

const mockMentorPreferences: MentorPreferences = {
  idealMentee: 'Someone eager to learn and take initiative.',
  mentoringMeaning: 'Guiding others to unlock their potential.',
  maxMentees: 2,
};

const mockMentorRequests: MentorshipRequest[] = [
    { 
        id: 'req1', 
        mentee: { 
            name: 'Ajinkya Patil', 
            grade: 'Senior Engineer', 
            imageUrl: 'https://picsum.photos/id/237/100/100',
            dossier: {
                employeeCode: 'EMP12345',
                email: 'ajinkya.patil@ril.com',
                grade: 'L5',
                location: 'Mumbai',
                experience: '5 Years',
                business: 'Jio Platforms',
                segment: 'Engineering',
                function: 'Technology'
            }
        }, 
        mentor: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://picsum.photos/seed/mentor1/100/100'}, 
        topic: 'Leadership', 
        status: 'pending_mentor', 
        submittedDate: '28-07-2024, 04:45 PM', 
        noteToMentor: 'I am looking to grow into a leadership role and would appreciate your guidance on team management and strategic thinking.', 
        goals: '1. Understand team leadership challenges. 2. Improve communication with stakeholders.'
    },
    { 
        id: 'req4', 
        mentee: { 
            name: 'Sneha Reddy', 
            grade: 'Software Engineer', 
            imageUrl: 'https://picsum.photos/seed/mentee4/100/100',
            dossier: {
                employeeCode: 'EMP67890',
                email: 'sneha.reddy@ril.com',
                grade: 'L4',
                location: 'Hyderabad',
                experience: '3 Years',
                business: 'Retail',
                segment: 'App Development',
                function: 'Technology'
            }
        }, 
        mentor: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://picsum.photos/seed/mentor1/100/100'}, 
        topic: 'Career Growth', 
        status: 'pending_mentor', 
        submittedDate: '29-07-2024, 10:20 AM', 
        noteToMentor: 'I want to plan my career path for the next 5 years and understand what skills are most valuable for a senior role.', 
        goals: '1. Create a 5-year career plan. 2. Identify key skills to develop.'
    },
    // Mentor's application to a program (Pending)
    { 
        id: 'req_mentor_prog_pending', 
        mentee: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://picsum.photos/seed/mentor1/100/100'}, 
        mentor: { 
            name: 'Future Leaders Program', 
            title: 'Group Mentoring', 
            imageUrl: 'https://picsum.photos/seed/future/100/100',
            dossier: {
                employeeCode: 'PROG-003',
                email: 'leaders@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Leadership',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Open',
            description: 'Accelerated development for high-potential individuals aiming for leadership roles. The program covers strategic thinking, change management, and financial acumen.'
        }, 
        topic: 'Strategy', 
        status: 'mentor_pending_program', 
        submittedDate: '30-07-2024, 11:30 AM'
    },
    // Mentor's application to a program (Accepted)
    { 
        id: 'req_mentor_prog_accepted', 
        mentee: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://picsum.photos/seed/mentor1/100/100'}, 
        mentor: { 
            name: 'Tech Mentoring Program', 
            title: 'Group Mentoring', 
            imageUrl: 'https://picsum.photos/seed/techprog/100/100',
            dossier: {
                employeeCode: 'PROG-001',
                email: 'learning@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Tech',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Open',
            description: 'A structured program for aspiring tech leaders, focusing on advanced technical skills, leadership, and project ownership.'
        }, 
        topic: 'System Design', 
        status: 'mentor_accepted_program', 
        submittedDate: '28-07-2024, 02:15 PM'
    },
    // Mentor's application to a program (Rejected)
    { 
        id: 'req_mentor_prog_rejected', 
        mentee: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://picsum.photos/seed/mentor1/100/100'}, 
        mentor: { 
            name: 'Data Science for All', 
            title: 'Group Mentoring Program', 
            imageUrl: 'https://picsum.photos/seed/data/100/100',
            dossier: {
                employeeCode: 'PROG-002',
                email: 'learning@ril.com',
                grade: 'Program',
                location: 'Remote',
                experience: 'N/A',
                business: 'L&D',
                segment: 'Data',
                function: 'HR'
            },
            mentoringType: 'Group',
            programType: 'Closed',
            description: 'A comprehensive program covering Machine Learning, Python, and Data Visualization.'
        }, 
        topic: 'Machine Learning', 
        status: 'mentor_rejected_program', 
        submittedDate: '29-07-2024, 09:00 AM', 
        rejectionReason: 'Looking for mentors with more data science background.'
    },
];

const mockMentorActiveMentorships: ActiveMentorship[] = [
    {
        id: 'active2',
        participant: { 
            name: 'Rahul Verma', 
            grade: 'Associate Product Manager', 
            imageUrl: 'https://picsum.photos/seed/mentee2/100/100',
            dossier: {
                employeeCode: 'E20045',
                email: 'rahul.verma@ril.com',
                grade: 'L4',
                location: 'Bangalore',
                experience: '3 Years',
                business: 'Reliance Retail',
                segment: 'Product',
                function: 'Product Management' // Will be shown as Vertical
            }
        },
        topic: 'Product Management',
        startDate: '2024-06-15',
        status: 'active',
        goals: ['Improve PRD writing skills', 'Learn prioritization techniques']
    }
];

const mockMentorActivePrograms: ActiveMentorship[] = [
    {
        id: 'mentor_prog_1o1_closed',
        participant: { name: 'Senior Mgmt Fast Track', title: 'Mentoring Program', imageUrl: 'https://picsum.photos/seed/mgmt1/100/100' },
        topic: 'Strategic Leadership',
        startDate: '2024-07-15',
        status: 'active',
        mentoringType: 'One-on-One',
        programType: 'Closed'
    },
    {
        id: 'mentor_prog_1o1_open',
        participant: { name: 'Cloud Architecture', title: 'Mentoring Program', imageUrl: 'https://picsum.photos/seed/cloud1/100/100' },
        topic: 'Cloud Native',
        startDate: '2024-07-20',
        status: 'active',
        mentoringType: 'One-on-One',
        programType: 'Open'
    },
    {
        id: 'mentor_prog_group_open',
        participant: { name: 'Agile Transformation', title: 'Mentoring Program', imageUrl: 'https://picsum.photos/seed/agile1/100/100' },
        topic: 'Agile Methodology',
        startDate: '2024-08-01',
        status: 'active',
        mentoringType: 'Group',
        programType: 'Open'
    },
    {
        id: 'mentor_prog_group_closed',
        participant: { name: 'High Potential Leaders', title: 'Mentoring Program', imageUrl: 'https://picsum.photos/seed/hipo1/100/100' },
        topic: 'Organizational Change',
        startDate: '2024-08-05',
        status: 'active',
        mentoringType: 'Group',
        programType: 'Closed'
    }
];

const mockMentorCompletedMentorships: ActiveMentorship[] = [
     {
        id: 'completed2',
        participant: { name: 'Anika Singh', grade: 'Junior Developer', imageUrl: 'https://picsum.photos/seed/mentee3/100/100' },
        topic: 'Onboarding',
        startDate: '2024-02-01',
        status: 'completed'
    }
];

// Mock data for Program Manager view - expanded for duplication
const initialPrograms = [
    { id: 'prog_draft_1', title: 'The Leaders (Draft)', mentoringType: 'Group Mentoring Program', duration: '2-5 months', mentors: 0, mentees: 0, status: 'Draft', lastEdited: '2024-07-30T10:00:00Z', objective: 'To groom high-potential employees into future leaders.', description: 'This program focuses on leadership skills, strategic thinking, and team management.', skills: ['Leadership', 'Strategy'], menteesPerMentor: 5, durationMin: 2, durationMax: 5, sessionOutline: [{title: 'Kickoff', details: 'Introduction to leadership principles.'}], programType: 'Open' as const, notifications: { launch: 'Generic Program Start', end: 'Generic Program End', mentorStart: 'Call for Mentors', mentorEnd: 'Last Call for Mentors'}, feedbackForms: { mentee: 'Standard Mentee Feedback', mentor: 'Standard Mentor Feedback'}, certificates: { mentor: 'Standard Mentor Certificate', mentee: 'Standard Mentee Certificate' }, location: 'Mumbai' },
    { id: 'prog1', title: 'The Leaders', mentoringType: 'Group Mentoring Program', duration: '2-5 months', mentors: 12, mentees: 36, status: 'In Progress', lastEdited: '2024-07-28T11:00:00Z', objective: 'To groom high-potential employees into future leaders.', description: 'This program focuses on leadership skills, strategic thinking, and team management.', skills: ['Leadership', 'Strategy'], menteesPerMentor: 5, durationMin: 2, durationMax: 5, sessionOutline: [{title: 'Kickoff', details: 'Introduction to leadership principles.'}], programType: 'Open' as const, location: 'Mumbai' },
    { id: 'prog2', title: "A Marketer's Guide to Appealing to Gen Z", mentoringType: 'One to One', duration: '4-6 months', mentors: 3, mentees: 3, status: 'Completed', lastEdited: '2024-06-15T14:30:00Z', objective: 'To understand Gen Z marketing trends.', description: 'A deep dive into marketing for Gen Z.', skills: ['Marketing', 'Gen Z'], menteesPerMentor: 1, durationMin: 4, durationMax: 6, sessionOutline: [{title: 'Intro to Gen Z', details: 'Understanding the demographic.'}], programType: 'Open' as const, location: 'Delhi' },
    { id: 'prog3', title: 'Pen to Proficiency: Unleashing Your Writing Potential', mentoringType: 'Group Mentoring Program', duration: '2-3 months', mentors: 15, mentees: 19, status: 'In Progress', lastEdited: '2024-07-29T09:00:00Z', objective: 'Improve business writing skills.', description: 'A workshop-based program on effective writing.', skills: ['Writing', 'Communication'], menteesPerMentor: 4, durationMin: 2, durationMax: 3, sessionOutline: [{title: 'Clarity and Conciseness', details: 'Writing clearly.'}], programType: 'Closed' as const, location: 'Bangalore' },
    { id: 'prog4', title: 'The Leaders 2.0', mentoringType: 'One to One', duration: '2-5 months', mentors: 9, mentees: 9, status: 'Yet to start', lastEdited: '2024-07-25T18:00:00Z', objective: 'Advanced leadership training.', description: 'Follow-up to The Leaders program.', skills: ['Leadership', 'Strategy'], menteesPerMentor: 1, durationMin: 2, durationMax: 5, sessionOutline: [{title: 'Advanced Strategy', details: 'Deep dive into corporate strategy.'}], programType: 'Open' as const, location: 'Mumbai' },
];

const mockTopicMentorMapping = [
    { id: '101', name: 'Sachin Kumar', topic: 'UI/UX', experience: '5 years', certified: 1, bio: 'Passionate UI/UX designer with a focus on user-centric design.', mentoringMeaning: 'Helping others grow their design skills.', idealMentee: 'Eager to learn and experiment.', maxMentees: 2 },
    { id: '102', name: 'Anjali Sharma', topic: 'System Design', experience: '8 years', certified: 0, bio: 'Lead engineer specializing in scalable systems.', mentoringMeaning: 'Building the next generation of architects.', idealMentee: 'Proactive and curious about technology.', maxMentees: 1 },
    { id: '103', name: 'Rohan Mehta', topic: 'Product Management', experience: '10 years', certified: 1, bio: 'Senior PM with experience in B2B and B2C products.', mentoringMeaning: 'Sharing product wisdom and strategic thinking.', idealMentee: 'Someone with a passion for solving user problems.', maxMentees: 3 },
    { id: '104', name: 'Priya Sharma', topic: 'Leadership', experience: '12 years', certified: 1, bio: 'Director of Engineering with a passion for mentoring.', mentoringMeaning: 'Guiding others to unlock their potential.', idealMentee: 'Someone eager to learn and take initiative.', maxMentees: 2 },
];

interface MentorJourneyPageProps {
  isProgramManagerView?: boolean;
}

const MentorJourneyPage: React.FC<MentorJourneyPageProps> = ({ isProgramManagerView = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [preferences, setPreferences] = useState<MentorPreferences>(mockMentorPreferences);
    const [requests, setRequests] = useState<MentorshipRequest[]>(mockMentorRequests);
    const [activeTab, setActiveTab] = useState('Requests');
    const [activeRequestFilter, setActiveRequestFilter] = useState('Pending');

    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [selectedMentorshipForGoals, setSelectedMentorshipForGoals] = useState<ActiveMentorship | null>(null);

    // State for Program Manager view
    const [pmActiveTab, setPmActiveTab] = useState('Program Management');
    const [pmActiveProgramTab, setPmActiveProgramTab] = useState(location.state?.showDrafts ? 'Drafts' : 'Live Programs');
    const [programs, setPrograms] = useState(initialPrograms);
    const [sortOption, setSortOption] = useState('latest');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All'); // Added Location Filter
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    
    // Topic Mentor Mapping Upload State
    const [uploadSummary, setUploadSummary] = useState<{ processed: number; unprocessed: number } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [topicMentorSearch, setTopicMentorSearch] = useState('');
    const [pmTopicMentorSubTab, setPmTopicMentorSubTab] = useState('Topic-Mentor Mapping');

    const breadcrumbItems: BreadcrumbItem[] = isProgramManagerView ? [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Program Manager', path: '/mentor/program-manager' },
    ] : [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentor Journey', path: '/mentor/mentor-journey' },
    ];

    useEffect(() => {
        if (location.state?.successMessage) {
            setToastMessage(location.state.successMessage);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (openActionMenu) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openActionMenu]);

    useEffect(() => {
        if (location.state?.showDrafts) {
            setPmActiveProgramTab('Drafts');
        }
    }, [location.state?.showDrafts]);
    
    useEffect(() => {
        if (location.state?.newProgram) {
            const newProgram = location.state.newProgram;
            setPrograms(prevPrograms => {
                const existingIndex = prevPrograms.findIndex(p => p.id === newProgram.id);
                if (existingIndex > -1) {
                    const updated = [...prevPrograms];
                    updated[existingIndex] = newProgram;
                    return updated;
                } else {
                    return [newProgram, ...prevPrograms];
                }
            });
            if (newProgram.status === 'Draft') {
                setPmActiveProgramTab('Drafts');
            } else {
                setPmActiveProgramTab('Live Programs');
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);


    const TABS = [
        { name: 'Requests', count: requests.filter(r => r.status === 'pending_mentor').length },
        { name: 'Active Mentorships', count: mockMentorActiveMentorships.length },
        { name: 'Active Programs', count: mockMentorActivePrograms.length },
        { name: 'Completed', count: mockMentorCompletedMentorships.length }
    ];
    
    const formatSessionTimeRange = (startStr: string) => {
        const startDate = new Date(startStr);
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', dateOptions)} | ${startDate.toLocaleTimeString('en-US', timeOptions)}`;
    };

    const handleAcceptRequest = (id: string) => {
        setRequests(requests.map(r => r.id === id ? {...r, status: 'accepted' as const} : r).filter(r => r.id !== id));
    };

    const handleRejectRequest = (id: string) => {
        setRequests(requests.map(r => r.id === id ? {...r, status: 'rejected_mentor' as const} : r));
    };

    const handleViewGoals = (mentorship: ActiveMentorship) => {
        setSelectedMentorshipForGoals(mentorship);
        setIsGoalsModalOpen(true);
    };

    const handleEditProgram = (program: any) => {
        navigate('/mentor/program-manager/create', { state: { programToEdit: program } });
    };
    
    const handleDeleteProgram = (programId: string) => {
        if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
            setPrograms(currentPrograms => currentPrograms.filter(p => p.id !== programId));
        }
    };

    const handleDuplicateProgram = (programToDuplicate: any) => {
        const duplicatedProgram = {
            ...programToDuplicate,
            id: `prog_draft_${Date.now()}`,
            title: `${programToDuplicate.title} (2)`,
            status: 'Draft',
            lastEdited: new Date().toISOString(),
            mentors: 0,
            mentees: 0,
            minMentorLevel: undefined,
            menteeLevel: undefined,
            levelDifference: undefined,
            mentorCriteria: [],
            menteeCriteria: [],
        };
        navigate('/mentor/program-manager/create', { state: { programToEdit: duplicatedProgram } });
    };
    
    const handleBulkUpload = () => {
        alert("Simulating bulk upload processing...");
        setTimeout(() => {
            setUploadSummary({ processed: 150, unprocessed: 10 });
        }, 1500);
    };

    const handleDownloadCSV = (filename: string) => {
        alert(`Downloading ${filename}...`);
    };

    const filteredRequests = useMemo(() => {
        if (activeRequestFilter === 'Pending') {
            // Only Pending Open Mentoring Requests from Mentees
            return requests.filter(req => req.status === 'pending_mentor');
        }
        if (activeRequestFilter === 'Programs Applied') {
            // Pending Program Requests
            return requests.filter(req => req.status === 'mentor_pending_program');
        }
        if (activeRequestFilter === 'Accepted') {
            return requests.filter(req => req.status === 'accepted' || req.status === 'mentor_accepted_program');
        }
        if (activeRequestFilter === 'Rejected') {
            return requests.filter(req => req.status === 'rejected_mentor' || req.status === 'mentor_rejected_program');
        }
        return [];
    }, [activeRequestFilter, requests]);

    const pendingCount = useMemo(() => requests.filter(req => req.status === 'pending_mentor').length, [requests]);
    
    const sortedAndFilteredPrograms = useMemo(() => {
        return programs
            .filter(p => {
                const typeMatch = filterType === 'All' || p.mentoringType === filterType;
                const statusMatch = filterStatus === 'All' || p.status === filterStatus;
                const locationMatch = filterLocation === 'All' || p.location === filterLocation; // Filter by Location
                return typeMatch && statusMatch && locationMatch;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case 'name-asc':
                        return a.title.localeCompare(b.title);
                    case 'name-desc':
                        return b.title.localeCompare(a.title);
                    case 'oldest':
                        return new Date(a.lastEdited).getTime() - new Date(b.lastEdited).getTime();
                    case 'latest':
                    default:
                        return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
                }
            });
    }, [programs, sortOption, filterType, filterStatus, filterLocation]);

    const livePrograms = sortedAndFilteredPrograms.filter(p => p.status !== 'Draft');
    const draftPrograms = sortedAndFilteredPrograms.filter(p => p.status === 'Draft');
    
    const filteredTopicMentors = useMemo(() => {
        return mockTopicMentorMapping.filter(
            m => m.name.toLowerCase().includes(topicMentorSearch.toLowerCase()) || m.topic.toLowerCase().includes(topicMentorSearch.toLowerCase())
        );
    }, [topicMentorSearch]);

    const ProgramStatusPill: React.FC<{ status: string }> = ({ status }) => {
        const style = {
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Yet to start': 'bg-yellow-100 text-yellow-800',
            'Draft': 'bg-gray-100 text-gray-800',
        }[status] || 'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{status}</span>;
    };


    if (isProgramManagerView) {
        // Removed Program Mentor Pool Management Tab
        const PM_TABS = ["Program Management", "Topic-Mentor Management"];
        const pmStatCards = [
            { label: 'Application Request pending', value: 23 },
            { label: 'Mentors Onboarded', value: 345 },
            { label: 'Mentees Onboarded', value: 659 },
            { label: 'Programs Live', value: livePrograms.length },
        ];
        
        const programsToDisplay = pmActiveProgramTab === 'Live Programs' ? livePrograms : draftPrograms;
        
        return (
            <div className="bg-r-gray-50 min-h-screen">
                <MentorSubHeader />
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>
                     <div className="border-b border-r-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {PM_TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setPmActiveTab(tab)}
                                    className={`${pmActiveTab === tab ? 'border-r-blue text-r-blue' : 'border-transparent text-r-gray-500 hover:text-r-gray-700 hover:border-r-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-8">
                        {pmActiveTab === 'Program Management' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <button onClick={() => navigate('/mentor/program-manager/create')} className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-center p-6 hover:bg-blue-100 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-red-300">
                                             <PlusIcon className="w-8 h-8 text-red-500" />
                                        </div>
                                        <p className="mt-3 font-semibold text-r-blue-dark">Create Program</p>
                                    </button>
                                    {pmStatCards.map(card => (
                                        <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <p className="text-sm text-gray-500">{card.label}</p>
                                            <p className="text-5xl font-bold text-gray-800 mt-2">{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <button onClick={() => setPmActiveProgramTab('Live Programs')} className={`px-4 py-2 text-sm font-medium rounded-md ${pmActiveProgramTab === 'Live Programs' ? 'bg-blue-100 text-r-blue-dark' : 'text-gray-600'}`}>Live Programs</button>
                                        <button onClick={() => setPmActiveProgramTab('Drafts')} className={`px-4 py-2 text-sm font-medium rounded-md ${pmActiveProgramTab === 'Drafts' ? 'bg-blue-100 text-r-blue-dark' : 'text-gray-600'}`}>Drafts</button>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                        <div className="relative w-full md:w-1/3">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="text" placeholder="Search by program name" className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-gray-900"/>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-1">
                                                <SortUpDownIcon className="w-4 h-4 text-gray-500"/>
                                                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-sm border-gray-300 rounded-lg focus:ring-r-blue focus:border-r-blue bg-white text-gray-900">
                                                    <option value="latest">Latest edited</option>
                                                    <option value="oldest">Oldest edited</option>
                                                    <option value="name-asc">Name A-Z</option>
                                                    <option value="name-desc">Name Z-A</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FilterIcon className="w-4 h-4 text-gray-500"/>
                                                 <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border-gray-300 rounded-lg focus:ring-r-blue focus:border-r-blue bg-white text-gray-900">
                                                    <option value="All">All Types</option>
                                                    <option value="One to One">One to One</option>
                                                    <option value="Group Mentoring Program">Group Mentoring</option>
                                                </select>
                                                {pmActiveProgramTab === 'Live Programs' && (
                                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border-gray-300 rounded-lg focus:ring-r-blue focus:border-r-blue bg-white text-gray-900">
                                                        <option value="All">All Statuses</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Yet to start">Yet to start</option>
                                                    </select>
                                                )}
                                                {/* Location Filter with Searchable Dropdown */}
                                                <SearchableDropdown
                                                    options={LOCATION_OPTIONS}
                                                    selected={filterLocation === 'All' ? 'All Locations' : filterLocation}
                                                    onSelect={(val) => setFilterLocation(val === 'All Locations' ? 'All' : val)}
                                                    className="w-40"
                                                    placeholder="Location"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-white uppercase bg-r-blue">
                                                <tr>
                                                    <th className="px-6 py-3">Title</th>
                                                    <th className="px-6 py-3">Program Type</th>
                                                    <th className="px-6 py-3">Mentoring type</th>
                                                    {pmActiveProgramTab === 'Live Programs' && (
                                                        <>
                                                            <th className="px-6 py-3">No.of Mentors</th>
                                                            <th className="px-6 py-3">No.of Mentees</th>
                                                        </>
                                                    )}
                                                    {/* Added Location Column */}
                                                    <th className="px-6 py-3">Location</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {programsToDisplay.map(p => (
                                                <tr key={p.id} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-700">
                                                    <td className="px-6 py-4 text-r-blue-dark font-semibold">
                                                        {pmActiveProgramTab === 'Live Programs' ? (
                                                            <Link to={`/mentor/program-manager/track/${p.id}`} state={{ program: p }} className="hover:underline">{p.title}</Link>
                                                        ) : p.title}
                                                    </td>
                                                    <td className="px-6 py-4">{p.programType}</td>
                                                    <td className="px-6 py-4">{p.mentoringType}</td>
                                                    {pmActiveProgramTab === 'Live Programs' && (
                                                        <>
                                                            <td className="px-6 py-4">{p.mentors}</td>
                                                            <td className="px-6 py-4">{p.mentees}</td>
                                                        </>
                                                    )}
                                                    {/* Added Location Data */}
                                                    <td className="px-6 py-4">{p.location || 'N/A'}</td>
                                                    <td className="px-6 py-4"><ProgramStatusPill status={p.status}/></td>
                                                    <td className="px-6 py-4">
                                                        {pmActiveProgramTab === 'Drafts' ? (
                                                            <div className="flex space-x-3">
                                                                <button onClick={() => handleEditProgram(p)} title="Edit Draft"><Edit2Icon className="w-5 h-5 text-gray-500 hover:text-r-blue"/></button>
                                                                <button onClick={() => handleDeleteProgram(p.id)} title="Delete Draft"><Trash2Icon className="w-5 h-5 text-gray-500 hover:text-red-600"/></button>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenActionMenu(openActionMenu === p.id ? null : p.id);
                                                                    }}
                                                                    className="p-2 rounded-full hover:bg-gray-200"
                                                                >
                                                                    <MoreHorizontalIcon className="w-5 h-5 text-gray-600" />
                                                                </button>
                                                                {openActionMenu === p.id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                                                                        <button onClick={() => navigate(`/mentor/program-manager/track/${p.id}`, { state: { program: p } })} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                            <EyeIcon className="w-4 h-4" /> View
                                                                        </button>
                                                                        <button onClick={() => handleDuplicateProgram(p)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                            <CopyIcon className="w-4 h-4" /> Duplicate
                                                                        </button>
                                                                        <button onClick={() => handleEditProgram(p)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                            <Edit2Icon className="w-4 h-4" /> Edit
                                                                        </button>
                                                                        <button onClick={() => handleDeleteProgram(p.id)} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                                            <Trash2Icon className="w-4 h-4" /> Delete Course
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                                ))}
                                                {programsToDisplay.length === 0 && (
                                                    <tr>
                                                        <td colSpan={pmActiveProgramTab === 'Live Programs' ? 8 : 6} className="text-center py-10 text-gray-500">
                                                            No programs found with the selected filters.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-center items-center space-x-2 mt-6">
                                        <button className="px-3 py-1 border rounded-md text-sm bg-white text-gray-700">&lt;</button>
                                        {[1,2,3,4,5,6,7].map(n=><button key={n} className={`px-3 py-1 border rounded-md text-sm ${n===1 ? 'bg-r-blue text-white' : 'bg-white text-gray-700'}`}>{n}</button>)}
                                        <button className="px-3 py-1 border rounded-md text-sm bg-white text-gray-700">&gt;</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {pmActiveTab === 'Topic-Mentor Management' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                {/* ... (rest of Topic-Mentor content) ... */}
                                <div className="flex items-center space-x-4 border-b">
                                    <button onClick={() => setPmTopicMentorSubTab('Topic-Mentor Mapping')} className={`whitespace-nowrap pb-2 px-1 border-b-2 text-sm font-medium ${pmTopicMentorSubTab === 'Topic-Mentor Mapping' ? 'border-r-blue text-r-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Topic-Mentor Mapping</button>
                                    <button onClick={() => setPmTopicMentorSubTab('Current Topic-Mentor Mapping')} className={`whitespace-nowrap pb-2 px-1 border-b-2 text-sm font-medium ${pmTopicMentorSubTab === 'Current Topic-Mentor Mapping' ? 'border-r-blue text-r-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Current Topic-Mentor Mapping</button>
                                </div>

                                {pmTopicMentorSubTab === 'Topic-Mentor Mapping' && (
                                    <div className="mt-6">
                                        <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-4">
                                           <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => alert('Downloading sample CSV...')} className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                                                    <DownloadIcon className="w-4 h-4" /> Download sample CSV
                                                </button>
                                                <button onClick={handleBulkUpload} className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                                                    <UploadIcon className="w-4 h-4" /> Upload Excel
                                                </button>
                                           </div>
                                           {uploadSummary && (
                                                <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                                                    <div className="flex gap-8">
                                                        <div><p className="text-sm text-gray-500">Total Processed</p><p className="text-2xl font-bold">{uploadSummary.processed + uploadSummary.unprocessed}</p></div>
                                                        <div><p className="text-sm text-green-600">Successfully Uploaded</p><p className="text-2xl font-bold text-green-600">{uploadSummary.processed}</p></div>
                                                        <div><p className="text-sm text-red-600">Rows with Errors</p><p className="text-2xl font-bold text-red-600">{uploadSummary.unprocessed}</p></div>
                                                    </div>
                                                    <button onClick={() => alert('Exporting summary...')} className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg hover:bg-gray-100">
                                                        <FileCsvIcon className="w-4 h-4"/> Export CSV
                                                    </button>
                                                </div>
                                           )}
                                        </div>
                                    </div>
                                )}

                                {pmTopicMentorSubTab === 'Current Topic-Mentor Mapping' && (
                                     <div className="mt-6">
                                        {/* ... (rest of Current Topic-Mentor Mapping content) ... */}
                                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                            <div className="relative w-full md:w-1/3">
                                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search by mentor or topic" 
                                                    value={topicMentorSearch}
                                                    onChange={(e) => setTopicMentorSearch(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border rounded-full bg-white text-gray-900"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleDownloadCSV('Current Topic-Mentor Mapping')} 
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                                            >
                                                <DownloadIcon className="w-4 h-4" /> Download CSV
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-white uppercase bg-r-blue">
                                                    <tr>
                                                        <th className="px-6 py-3">Mentor ID/Name</th>
                                                        <th className="px-6 py-3">Topic</th>
                                                        <th className="px-6 py-3">Experience</th>
                                                        <th className="px-6 py-3">Certified</th>
                                                        <th className="px-6 py-3">Mentor Bio</th>
                                                        <th className="px-6 py-3">Mentoring to Me</th>
                                                        <th className="px-6 py-3">Ideal Mentee</th>
                                                        <th className="px-6 py-3">Max Mentee</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredTopicMentors.map(mentor => (
                                                        <tr key={mentor.id} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-700">
                                                            <td className="px-6 py-4">{mentor.name} ({mentor.id})</td>
                                                            <td className="px-6 py-4">{mentor.topic}</td>
                                                            <td className="px-6 py-4">{mentor.experience}</td>
                                                            <td className="px-6 py-4">{mentor.certified}</td>
                                                            <td className="px-6 py-4 max-w-xs truncate" title={mentor.bio}>{mentor.bio}</td>
                                                            <td className="px-6 py-4 max-w-xs truncate" title={mentor.mentoringMeaning}>{mentor.mentoringMeaning}</td>
                                                            <td className="px-6 py-4 max-w-xs truncate" title={mentor.idealMentee}>{mentor.idealMentee}</td>
                                                            <td className="px-6 py-4">{mentor.maxMentees}</td>
                                                        </tr>
                                                    ))}
                                                    {filteredTopicMentors.length === 0 && (
                                                        <tr><td colSpan={8} className="text-center py-8 text-gray-500">No mentors found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 bg-r-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                        {toastMessage}
                    </div>
                )}
            </div>
        )
    }
    
    // Default Mentor Journey View
    const {activeMenteesCount, activeProgramsCount, completedCount} = TABS.reduce((acc, tab) => {
        if(tab.name === 'Active Mentorships') acc.activeMenteesCount = tab.count;
        if(tab.name === 'Active Programs') acc.activeProgramsCount = tab.count;
        if(tab.name === 'Completed') acc.completedCount = tab.count;
        return acc;
    }, { activeMenteesCount: 0, activeProgramsCount: 0, completedCount: 0 });

     const statCards = [
        { label: 'Requests', count: pendingCount, icon: <HourglassIcon />, colorClasses: 'bg-yellow-100 text-yellow-800', onClick: () => { setActiveTab('Requests'); setActiveRequestFilter('Pending'); } },
        { label: 'Active Mentorships', count: activeMenteesCount, icon: <UsersIcon />, colorClasses: 'bg-r-blue-50 text-r-blue-dark', onClick: () => setActiveTab('Active Mentorships') },
        { label: 'Active Programs', count: activeProgramsCount, icon: <BookOpenIcon />, colorClasses: 'bg-green-100 text-green-800', onClick: () => setActiveTab('Active Programs') },
        { label: 'Completed', count: completedCount, icon: <CheckCircleIcon />, colorClasses: 'bg-r-gray-100 text-r-gray-700', onClick: () => setActiveTab('Completed') }
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
                            <img className="h-16 w-16 rounded-full" src="https://picsum.photos/seed/mentor1/100/100" alt="Mentor" />
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-r-gray-900">Priya Sharma</h2>
                                <p className="text-sm text-r-gray-500">Director of Engineering</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <button onClick={() => navigate('/mentor/program-search')} className="bg-r-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-r-blue-dark transition-colors duration-300 shadow-sm text-sm" aria-label="Find Programs">
                               Find Programs
                             </button>
                            <button onClick={() => navigate('/mentor/mentor-journey/preferences')} className="flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-r-blue hover:text-r-blue-dark px-4 py-2 rounded-lg border border-r-gray-200 hover:bg-r-blue-50 transition-colors">
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
                                        <p className="font-semibold text-r-gray-800 text-xs">Prioritization Techniques</p>
                                        <p className="text-xs text-r-gray-500">with Rahul Verma</p>
                                        <p className="text-xs text-r-gray-600 mt-0.5 font-medium">{formatSessionTimeRange('2024-08-01T10:00:00Z')}</p>
                                    </div>
                                </div>
                                <button onClick={() => alert('Starting meeting...')} className="ml-2 flex-shrink-0 px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700">
                                    Start
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
                                        <p className="text-xs text-r-gray-500">For mentorship on 'Onboarding' with Anika Singh.</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/mentor/engagement/completed2', { state: { userRole: 'mentor' } })} className="ml-2 flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs font-semibold text-r-blue-dark bg-r-blue-100 rounded-full hover:bg-r-blue-200">
                                    Give Feedback
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
                                            className={`px-3 py-1 text-sm rounded-full ${activeRequestFilter === filter ? 'bg-r-blue text-white' : 'bg-white text-r-gray-600 border border-gray-200'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map(req => <RequestCard key={req.id} request={req} userType="mentor" onAccept={handleAcceptRequest} onReject={handleRejectRequest} />)
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
                                {mockMentorActiveMentorships.map(mentorship => <ActiveMentorshipCard key={mentorship.id} mentorship={mentorship} userType="mentor" onViewGoals={handleViewGoals} />)}
                           </div>
                        )}
                         {activeTab === 'Active Programs' && (
                            <div className="space-y-4">
                                {mockMentorActivePrograms.map(program => (
                                    <ActiveMentorshipCard 
                                        key={program.id}
                                        mentorship={program}
                                        userType="mentor"
                                    />
                                ))}
                            </div>
                        )}
                        {activeTab === 'Completed' && (
                             <div className="space-y-4">
                                {mockMentorCompletedMentorships.map(mentorship => <ActiveMentorshipCard key={mentorship.id} mentorship={mentorship} userType="mentor" />)}
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedMentorshipForGoals && (
                <ViewGoalsModal 
                    isOpen={isGoalsModalOpen}
                    onClose={() => setIsGoalsModalOpen(false)}
                    goals={selectedMentorshipForGoals.goals || []}
                    menteeName={selectedMentorshipForGoals.participant.name}
                />
            )}
        </div>
    );
};

export default MentorJourneyPage;
