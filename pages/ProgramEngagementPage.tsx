
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import type { ProgramEngagement, ProgramSession, ProgramMentee, AssignedCourse, MenteeJournalEntry, Course, EngagementSession, MentorshipTask } from '../types';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, PlusIcon, Edit2Icon, UsersIcon, BookOpenIcon, DownloadIcon, FileTextIcon, MoreHorizontalIcon, Trash2Icon, QuestionMarkCircleIcon, CalendarIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, EyeIcon } from '../components/Icons';
import AddProgramSessionModal from '../components/AddProgramSessionModal';
import AttendanceReportModal from '../components/AttendanceReportModal';
import EndProgramFeedbackModal from '../components/EndProgramFeedbackModal';
import CourseCard from '../components/CourseCard';
import MentoringJournalModal from '../components/MentoringJournalModal';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import MarkAsCompleteModal from '../components/MarkAsCompleteModal';
import GoalSettingModal from '../components/GoalSettingModal';
import ProfileDossierModal from '../components/ProfileDossierModal';


const mockProgramData: { [id: string]: ProgramEngagement } = {
    'tech-mentoring': {
        id: 'tech-mentoring',
        title: 'Tech Mentoring Program',
        imageUrl: 'https://picsum.photos/seed/techprog/400/225',
        mentor: { 
            name: 'Priya Sharma', 
            title: 'Director of Engineering', 
            imageUrl: 'https://picsum.photos/seed/mentor1/100/100',
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
        skillsCovered: ['Mentoring', 'Leadership', 'System Design'],
        expectedSessions: 8,
        attendanceRequiredPercent: 75,
        mentoringType: 'Group',
        programType: 'Open',
        status: 'active',
        sessions: [
            { id: 'ps1', title: 'Kick-off and Introductions', category: 'Onboarding', startTime: '2024-08-10T10:00:00Z', endTime: '2024-08-10T11:00:00Z', status: 'completed', agenda: 'Program overview and goal setting.', attendees: [], notes: {mentorNote: 'Good kickoff session.', menteeNote: ''} },
            { id: 'ps2', title: 'Workshop: System Design', category: 'Workshop', startTime: '2024-08-17T10:00:00Z', endTime: '2024-08-17T12:00:00Z', status: 'upcoming', agenda: 'Deep dive into scalable system design.', attendees: [], notes: {mentorNote: 'Important session for all.', menteeNote: ''} },
        ],
        mentees: [
            { id: 'mentee1', name: 'Ravi Kumar', grade: 'Software Engineer II', imageUrl: 'https://picsum.photos/seed/mentee2/100/100', assignedCourses: [{id: 1, title: 'Advanced System Design', provider: 'Internal', imageUrl: 'https://picsum.photos/seed/advsys/400/225', tags:['Online'], status: 'In Progress'}], attendance: 'pending' },
            { id: 'mentee2', name: 'Sunita Singh', grade: 'Data Analyst', imageUrl: 'https://picsum.photos/seed/mentee3/100/100', assignedCourses: [{id: 2, title: 'Data Structures in Practice', provider: 'Coursera', imageUrl: 'https://picsum.photos/seed/ds/400/225', tags:['Online'], status: 'Completed'}], attendance: 'pending' },
            { id: 'mentee3', name: 'Amit Patel', grade: 'Intern', imageUrl: 'https://picsum.photos/seed/mentee5/100/100', assignedCourses: [], attendance: 'present' },
        ],
        referenceDocs: [
            { title: 'Program Onboarding Guide.pdf', url: '#', uploadedBy: 'Priya Sharma', date: '2024-08-01' },
            { title: 'System Design Principles.docx', url: '#', uploadedBy: 'Priya Sharma', date: '2024-08-05' }
        ],
        sessionOutline: [
            { title: 'Session 1: Kick-off and Introductions', details: 'Program overview, expectations, and initial goal setting for all participants.' },
            { title: 'Session 2: Workshop: System Design Fundamentals', details: 'A deep dive into the principles of designing scalable and resilient systems.' },
            { title: 'Session 3: Code Review Best Practices', details: 'Interactive session on conducting effective and constructive code reviews.' },
        ],
    },
    'active_prog_1': {
        id: 'active_prog_1',
        title: 'Data Science for All',
        imageUrl: 'https://picsum.photos/seed/data/400/225',
        mentor: { 
            name: 'Priya Sharma', 
            title: 'Director of Engineering', 
            imageUrl: 'https://picsum.photos/seed/mentor1/100/100',
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
        skillsCovered: ['Machine Learning', 'Python', 'Data Visualization'],
        expectedSessions: 10,
        attendanceRequiredPercent: 80,
        mentoringType: 'One-on-One',
        programType: 'Closed',
        status: 'active',
        sessions: [
            { id: 'ds1', title: 'Intro to Data Science', category: 'Onboarding', startTime: '2024-08-01T10:00:00Z', endTime: '2024-08-01T11:00:00Z', status: 'completed', agenda: 'Program overview and tools setup.', attendees: [{ menteeId: 'mentee_ajinkya', status: 'present'}], notes: {mentorNote: '', menteeNote: ''} },
            { id: 'ds2', title: 'Python for Data Science', category: 'Workshop', startTime: '2024-09-01T10:00:00Z', endTime: '2024-09-01T11:00:00Z', status: 'upcoming', agenda: 'Learn the basics of Pandas and NumPy.', attendees: [], notes: {mentorNote: '', menteeNote: ''} },
        ],
        journal: [
            { date: '2024-08-02', note: 'Learned about the basics of data science. Need to set up my Python environment.' }
        ],
        mentees: [
            { id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [{id: 3, title: 'Machine Learning A-Z', provider: 'Udemy', imageUrl: 'https://picsum.photos/seed/mlaz/400/225', tags:['Online'], status: 'In Progress'}], attendance: 'present' },
            { id: 'mentee_rahul', name: 'Rahul Verma', grade: 'Associate Product Manager', imageUrl: 'https://picsum.photos/seed/mentee2/100/100', assignedCourses: [], attendance: 'present' },
        ],
        referenceDocs: [
             { title: 'Data Science Handbook.pdf', url: '#', uploadedBy: 'Priya Sharma', date: '2024-08-01' }
        ],
        goals: ['Master Python for data analysis', 'Build a predictive model'],
        sessionOutline: [
            { title: 'Intro to Data Science', details: 'Program overview and tools setup.' },
            { title: 'Python for Data Science', details: 'Learn the basics of Pandas and NumPy.' }
        ],
    },
    'completed_prog_1': {
        id: 'completed_prog_1',
        title: 'Tech Mentoring Program (Completed)',
        imageUrl: 'https://picsum.photos/seed/techprog-completed/400/225',
        mentor: { 
            name: 'Priya Sharma', 
            title: 'Director of Engineering', 
            imageUrl: 'https://picsum.photos/seed/mentor1/100/100',
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
        skillsCovered: ['Leadership', 'Project Management'],
        mentoringType: 'Group',
        programType: 'Open',
        status: 'completed',
        sessions: [
            { id: 'cps1', title: 'Program Conclusion', category: 'Closing Session', startTime: '2023-12-15T10:00:00Z', endTime: '2023-12-15T11:00:00Z', status: 'completed', agenda: 'Final review and feedback.', attendees: [], notes: {mentorNote: 'Program complete.', menteeNote: ''} }
        ],
        journal: [],
        mentees: [
            { id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [], attendance: 'present' },
        ],
        sessionOutline: [
            { title: 'Final Review', details: 'Review of the completed program and feedback session.' }
        ],
    },
    'prog_1o1_closed': { id: 'prog_1o1_closed', title: 'Executive Leadership', imageUrl: 'https://picsum.photos/seed/exec1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Leadership', 'Strategy'], mentoringType: 'One-on-One', programType: 'Closed', expectedSessions: 6, attendanceRequiredPercent: 100, sessions: [{ id: 's1', title: 'Goal Setting', category: 'Goal Setting', startTime: '2024-08-05T10:00:00Z', endTime: '2024-08-05T11:00:00Z', status: 'completed', agenda: 'Define goals.', attendees: [{ menteeId: 'mentee_ajinkya', status: 'present' }] }, { id: 's2', title: 'Strategic Review', category: 'Review', startTime: '2024-08-20T10:00:00Z', endTime: '2024-08-20T11:00:00Z', status: 'upcoming', agenda: 'Review strategic plans.', attendees: [] }], mentees: [{ id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [], attendance: 'present' }], goals: ['Improve executive presence'], referenceDocs: [], sessionOutline: [{ title: 'Goal Setting', details: 'Setting expectations and goals for the 1-on-1 engagement.' }, { title: 'Strategic Review', details: 'Periodic review of strategic initiatives.' }], status: 'active' },
    'prog_1o1_open': { id: 'prog_1o1_open', title: 'Tech Leads Rising', imageUrl: 'https://picsum.photos/seed/tech1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['System Design', 'Team Management'], mentoringType: 'One-on-One', programType: 'Open', expectedSessions: 8, attendanceRequiredPercent: 90, sessions: [{ id: 's1', title: 'Intro', category: 'Intro', startTime: '2024-08-08T10:00:00Z', endTime: '2024-08-08T11:00:00Z', status: 'completed', agenda: 'Intro.', attendees: [{ menteeId: 'mentee_ajinkya', status: 'present' }] }], mentees: [{ id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [], attendance: 'present' }], goals: ['Become a Tech Lead'], sessionOutline: [{ title: 'Intro', details: 'Introduction to the Tech Lead role.' }], status: 'active' },
    'prog_group_open': { id: 'prog_group_open', title: 'Data Science for All', imageUrl: 'https://picsum.photos/seed/data/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Machine Learning', 'Data Analysis'], mentoringType: 'Group', programType: 'Open', expectedSessions: 10, attendanceRequiredPercent: 80, sessions: [{ id: 's1', title: 'Python Basics', category: 'Workshop', startTime: '2024-08-12T10:00:00Z', endTime: '2024-08-12T12:00:00Z', status: 'completed', agenda: 'Python setup.', attendees: [{ menteeId: 'mentee_ajinkya', status: 'present' }] }], mentees: [{ id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [], attendance: 'present' }], goals: ['Learn Python'], sessionOutline: [{ title: 'Python Basics', details: 'Introduction to Python programming.' }], status: 'active' },
    'prog_group_closed': { id: 'prog_group_closed', title: 'Women in Tech Cohort 5', imageUrl: 'https://picsum.photos/seed/women/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Career Growth', 'Networking'], mentoringType: 'Group', programType: 'Closed', expectedSessions: 12, attendanceRequiredPercent: 85, sessions: [{ id: 's1', title: 'Networking 101', category: 'Workshop', startTime: '2024-08-15T14:00:00Z', endTime: '2024-08-15T16:00:00Z', status: 'upcoming', agenda: 'Networking skills.', attendees: [] }], mentees: [{ id: 'mentee_ajinkya', name: 'Ajinkya Patil', grade: 'Senior Engineer', imageUrl: 'https://picsum.photos/id/237/100/100', assignedCourses: [], attendance: 'present' }], goals: ['Build a network'], sessionOutline: [{ title: 'Networking 101', details: 'Strategies for effective networking.' }], status: 'active' },
    'mentor_prog_1o1_closed': { id: 'mentor_prog_1o1_closed', title: 'Senior Mgmt Fast Track', imageUrl: 'https://picsum.photos/seed/mgmt1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Strategic Leadership'], mentoringType: 'One-on-One', programType: 'Closed', expectedSessions: 6, sessions: [{ id: 's1', title: 'Strategy', category: 'Discussion', startTime: '2024-07-20T10:00:00Z', endTime: '2024-07-20T11:00:00Z', status: 'completed', agenda: 'Strategy discussion.', attendees: [], notes: {} }], mentees: [{ id: 'mentee_rahul', name: 'Rahul Verma', grade: 'Senior Manager', imageUrl: 'https://picsum.photos/seed/mentee2/100/100', assignedCourses: [] }], sessionOutline: [{ title: 'Strategy', details: 'Discussion on strategic leadership.' }], status: 'active' },
    'mentor_prog_1o1_open': { id: 'mentor_prog_1o1_open', title: 'Cloud Architecture', imageUrl: 'https://picsum.photos/seed/cloud1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Cloud Native'], mentoringType: 'One-on-One', programType: 'Open', expectedSessions: 8, sessions: [], mentees: [{ id: 'mentee_sunita', name: 'Sunita Singh', grade: 'Architect', imageUrl: 'https://picsum.photos/seed/mentee3/100/100', assignedCourses: [] }], sessionOutline: [{ title: 'Cloud Basics', details: 'Introduction to Cloud Architecture.' }], status: 'active' },
    'mentor_prog_group_open': { id: 'mentor_prog_group_open', title: 'Agile Transformation', imageUrl: 'https://picsum.photos/seed/agile1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Agile'], mentoringType: 'Group', programType: 'Open', expectedSessions: 10, sessions: [{ id: 's1', title: 'Scrum Basics', category: 'Workshop', startTime: '2024-08-05T10:00:00Z', endTime: '2024-08-05T12:00:00Z', status: 'upcoming', agenda: 'Intro to Scrum.', attendees: [{ menteeId: 'mentee1', status: 'pending' }, { menteeId: 'mentee2', status: 'pending' }], notes: {} }], mentees: [{ id: 'mentee1', name: 'Dev 1', grade: 'Dev', imageUrl: 'https://picsum.photos/seed/m1/100/100', assignedCourses: [] }, { id: 'mentee2', name: 'Dev 2', grade: 'Dev', imageUrl: 'https://picsum.photos/seed/m2/100/100', assignedCourses: [] }], sessionOutline: [{ title: 'Scrum Basics', details: 'Introduction to Scrum methodology.' }], status: 'active' },
    'mentor_prog_group_closed': { id: 'mentor_prog_group_closed', title: 'High Potential Leaders', imageUrl: 'https://picsum.photos/seed/hipo1/400/225', mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://picsum.photos/seed/mentor1/100/100' }, skillsCovered: ['Organizational Change'], mentoringType: 'Group', programType: 'Closed', expectedSessions: 12, sessions: [], mentees: [{ id: 'mentee_lead', name: 'Lead 1', grade: 'Lead', imageUrl: 'https://picsum.photos/seed/l1/100/100', assignedCourses: [] }], sessionOutline: [{ title: 'Change Management', details: 'Leading organizational change.' }], status: 'active' }
};

const StatCard: React.FC<{ label: string; value: number | string; colorClass: string; }> = ({ label, value, colorClass }) => (
    <div className={`p-2 rounded-lg ${colorClass}`}>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
);

const ProgramEngagementPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const userRole = location.state?.userRole || 'mentee';

    const [program, setProgram] = useState<ProgramEngagement | null>(null);
    const [activeTab, setActiveTab] = useState('Sessions');

    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<ProgramSession | null>(null);
    
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [sessionForAttendance, setSessionForAttendance] = useState<ProgramSession | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    
    const [showAddDocForm, setShowAddDocForm] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocFile, setNewDocFile] = useState<File | null>(null);

    const [sessionToComplete, setSessionToComplete] = useState<ProgramSession | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [openOutline, setOpenOutline] = useState<number | null>(null);

    useEffect(() => {
        if (programId) {
            setProgram(JSON.parse(JSON.stringify(mockProgramData[programId] || null)));
        }
    }, [programId]);
    
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
        { label: program?.title || 'Program', path: `/program-engagement/${programId}` },
    ];

    const TABS = useMemo(() => {
        const baseTabs = [];
        
        // Hide Sessions tab for One-on-One programs
        if (program?.mentoringType !== 'One-on-One') {
            baseTabs.push('Sessions');
        }
        
        if (userRole === 'mentor') {
            baseTabs.push('Mentees');
            baseTabs.push('Assigned Courses');
        } else {
            baseTabs.push('Courses');
        }
        
        baseTabs.push('Reference Docs');
        
        // Add Sessions Outline tab for mentors if outline data exists
        if (userRole === 'mentor' && program?.sessionOutline && program.sessionOutline.length > 0) {
            baseTabs.push('Sessions Outline');
        }
        
        return baseTabs;
    }, [userRole, program]);

    useEffect(() => {
        if (program && program.mentoringType === 'One-on-One' && activeTab === 'Sessions') {
            // Default to 'Mentees' if user is mentor, otherwise 'Courses' or next available tab
            if (userRole === 'mentor') {
                setActiveTab('Mentees');
            } else {
                setActiveTab('Courses'); // Or handle mentee 1-on-1 logic if different
            }
        }
    }, [program, userRole, activeTab]);
    
    const handleSessionSubmit = (sessionData: Omit<ProgramSession, 'id'|'status'|'attendees'|'notes'>) => {
        console.log("Program session submitted:", sessionData);
        setIsSessionModalOpen(false);
        setEditingSession(null);
    };

    const handleEndProgramConfirm = (feedback: { rating: number; text: string }) => {
        console.log("Feedback submitted:", feedback);
        setIsFeedbackModalOpen(false);
        // Navigate to certificate page after feedback
        if (program) {
            navigate(`/certificate/${program.id}`, { state: { userRole } });
        }
    };
    
    const handleAttendanceClick = (session: ProgramSession) => {
        setSessionForAttendance(session);
        setIsAttendanceModalOpen(true);
    };

    const handleSaveAttendance = (updatedMentees: ProgramMentee[]) => {
        console.log("Saving attendance", updatedMentees);
        setIsAttendanceModalOpen(false);
    };

    const handleJournalSubmit = (newNote: string) => {
        if (program) {
            const newEntry: MenteeJournalEntry = { date: new Date().toISOString(), note: newNote };
            const updatedJournal = [...(program.journal || []), newEntry];
            setProgram({ ...program, journal: updatedJournal });
        }
        setIsJournalModalOpen(false);
    };

    const handleGoalSubmit = (goals: string[]) => {
        if (program) {
            setProgram({ ...program, goals });
        }
        setIsGoalModalOpen(false);
    };
    
     const handleAddDocSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (program && newDocTitle && newDocFile) {
            const newDoc = {
                title: newDocTitle,
                url: '#', // Placeholder URL
                uploadedBy: program.mentor.name,
                date: new Date().toISOString().split('T')[0]
            };
            const updatedDocs = [...(program.referenceDocs || []), newDoc];
            setProgram({...program, referenceDocs: updatedDocs });
            
            setNewDocTitle('');
            setNewDocFile(null);
            setShowAddDocForm(false);
        }
    };

    const handleMarkAsComplete = (sessionId: string) => {
        setProgram(prev => {
            if (!prev || !prev.sessions) return prev;
            const updatedSessions = prev.sessions.map(s => s.id === sessionId ? { ...s, status: 'completed' as const } : s);
            return { ...prev, sessions: updatedSessions };
        });
        setSessionToComplete(null);
    };
    
    const handleDeleteSession = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            setProgram(prev => {
                if (!prev || !prev.sessions) return prev;
                return { ...prev, sessions: prev.sessions.filter(s => s.id !== sessionId) };
            });
        }
    };

    const menteeCourses = useMemo(() => {
        if (userRole !== 'mentee' || !program) return [];
        const currentMentee = program.mentees.find(m => m.name === 'Ajinkya Patil');
        return currentMentee?.assignedCourses || [];
    }, [program, userRole]);

    const allProgramCourses = useMemo(() => {
        if (userRole !== 'mentor' || !program) return [];
        const coursesMap = new Map<string | number, Course>();
        program.mentees.forEach(mentee => {
            mentee.assignedCourses.forEach(course => {
                if (!coursesMap.has(course.id)) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { status, ...courseDetails } = course;
                    coursesMap.set(course.id, courseDetails);
                }
            });
        });
        return Array.from(coursesMap.values());
    }, [program, userRole]);

    if (!program) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-r-gray-50">
                <p className="text-xl text-r-gray-700">Program engagement not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 flex items-center text-sm font-medium text-r-blue hover:underline">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Go Back
                </button>
            </div>
        );
    }
    
    const completedSessions = program.sessions.filter(s => s.status === 'completed').length;
    const totalScheduled = program.sessions.length;

    const assignedCoursesCount = allProgramCourses.length;
    const mentorDashboard = [
        { label: 'Expected Sessions', value: program.expectedSessions || 'N/A', color: 'bg-r-gray-100 text-r-gray-800' },
        { label: 'Scheduled Sessions', value: totalScheduled, color: 'bg-blue-100 text-blue-800' },
        { label: 'Completed Sessions', value: completedSessions, color: 'bg-green-100 text-green-800' },
        { label: 'Assigned Courses', value: assignedCoursesCount, color: 'bg-purple-100 text-purple-800' },
    ];
    
    const menteeAttendedSessions = program.sessions.filter(s => 
        s.status === 'completed' && s.attendees?.some(a => a.menteeId === 'mentee_ajinkya' && a.status === 'present')
    ).length;

    const currentAttendancePercent = completedSessions > 0 ? ((menteeAttendedSessions / completedSessions) * 100).toFixed(0) : 0;
    
    const pendingCourses = menteeCourses.filter(c => c.status === 'In Progress' || c.status === 'Not Started').length;
    const completedCourses = menteeCourses.filter(c => c.status === 'Completed').length;

    const menteeDashboard = [
        { label: 'Total Sessions', value: totalScheduled, color: 'bg-blue-100 text-blue-800' },
        { label: 'Attended Sessions', value: menteeAttendedSessions, color: 'bg-green-100 text-green-800' },
        { label: 'Pending Courses', value: pendingCourses, color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Completed Courses', value: completedCourses, color: 'bg-gray-100 text-gray-800' },
    ];
    const dashboardData = userRole === 'mentor' ? mentorDashboard : menteeDashboard;
    const upcomingSession = program.sessions?.filter(s => s.status === 'upcoming').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];


    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {program.imageUrl && (
                            <img src={program.imageUrl} alt={program.title} className="w-full h-auto object-cover rounded-lg md:col-span-1" />
                        )}
                        <div className="md:col-span-3">
                             <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <p className="text-sm text-purple-600 font-medium">Mentoring Program</p>
                                        {program.mentoringType && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                {program.mentoringType}
                                            </span>
                                        )}
                                        {/* Only show Program Type (Open/Closed) if user is Mentor */}
                                        {userRole === 'mentor' && program.programType && (
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${program.programType === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {program.programType}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl font-heading font-bold text-r-gray-900">{program.title}</h1>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/program/${program.id}`}
                                        state={{ userRole: userRole, isEnrolled: true }}
                                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50 transition-colors"
                                    >
                                        {userRole === 'mentor' ? 'View Program' : 'View Program Details Page'}
                                    </Link>
                                    {program.status === 'completed' && (
                                        <button 
                                            onClick={() => setIsFeedbackModalOpen(true)}
                                            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark transition-colors flex items-center gap-2"
                                        >
                                            <DownloadIcon className="w-4 h-4"/>
                                            Download Certificate
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {program.mentoringType === 'One-on-One' ? (
                                <div className="flex flex-wrap items-center gap-8 mt-4">
                                    <div className="flex items-center space-x-3">
                                        <img className="h-12 w-12 rounded-full border-2 border-r-blue" src={program.mentor.imageUrl} alt={program.mentor.name} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-r-gray-500 uppercase">Mentor</p>
                                                <button onClick={() => setIsDossierOpen(true)} className="text-r-gray-400 hover:text-r-blue p-0.5 rounded-full hover:bg-r-blue-50 transition-colors">
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-r-gray-900">{program.mentor.name}</p>
                                            <p className="text-xs text-r-gray-600">{program.mentor.title}</p>
                                        </div>
                                    </div>
                                    {/* Removed Mentee block for One-on-One as requested */}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 mt-2">
                                    <img className="h-8 w-8 rounded-full" src={program.mentor.imageUrl} alt={program.mentor.name} />
                                    <span className="text-sm text-r-gray-600">With {program.mentor.name}</span>
                                    <button onClick={() => setIsDossierOpen(true)} className="text-r-gray-400 hover:text-r-blue p-0.5 rounded-full hover:bg-r-blue-50 transition-colors">
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                {dashboardData.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} colorClass={stat.color} />)}
                            </div>
                        </div>
                    </div>

                    {userRole === 'mentor' && program.attendanceRequiredPercent && (
                        <div className="mt-4 text-sm text-center text-r-gray-600 font-medium">
                            Minimum Attendance Required for Mentees: {program.attendanceRequiredPercent}%
                        </div>
                    )}

                    {userRole === 'mentee' && program.attendanceRequiredPercent && (
                         <div className="mt-4 text-sm text-center text-r-gray-600 font-medium">
                            Your Attendance: <span className="font-bold text-green-600">{currentAttendancePercent}%</span> | Required: <span className="font-bold text-r-blue-dark">{program.attendanceRequiredPercent}%</span>
                        </div>
                    )}
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
                                    {/* Removed Goals section as requested */}

                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-2">Upcoming Session</h3>
                                        {upcomingSession ? (
                                            <div>
                                                <p className="font-semibold">{upcomingSession.title}</p>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {new Date(upcomingSession.startTime).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric'})}, {new Date(upcomingSession.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">To be scheduled</p>
                                        )}
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold">Program Sessions</h2>
                                            {(userRole === 'mentor' || userRole === 'mentee') && program.status === 'active' && <button onClick={() => { setEditingSession(null); setIsSessionModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark"><PlusIcon className="w-4 h-4"/> Add Session</button>}
                                        </div>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-r-blue text-white">
                                                    <tr>
                                                        <th className="p-3 text-left font-semibold">Session Title</th>
                                                        <th className="p-3 text-left font-semibold">Date &amp; Time</th>
                                                        <th className="p-3 text-left font-semibold">Actions</th>
                                                        <th className="p-3 text-left font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-black">
                                                     {(program.sessions || []).map(session => {
                                                        const isCurrentSession = new Date() > new Date(session.startTime) && new Date() < new Date(session.endTime) && session.status === 'upcoming';
                                                        return (
                                                            <tr key={session.id} className="border-b last:border-b-0">
                                                                <td className="p-3 align-top">{session.title}</td>
                                                                <td className="p-3 align-top whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{new Date(session.startTime).toLocaleDateString('en-GB')} | {new Date(session.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</span>
                                                                        {(userRole === 'mentor' || userRole === 'mentee') && (
                                                                            <div className="relative">
                                                                                <button onClick={(e) => { e.stopPropagation(); setOpenActionMenu(session.id); }} className="p-1 rounded-full hover:bg-gray-200"><MoreHorizontalIcon className="w-4 h-4 text-gray-600" /></button>
                                                                                {openActionMenu === session.id && (
                                                                                    <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg z-10 border">
                                                                                        {userRole === 'mentor' && <button onClick={() => handleAttendanceClick(session)} className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Attendance</button>}
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
                                                                                contextTitle: program.title
                                                                            } 
                                                                        })} 
                                                                        className="p-1.5 rounded-full hover:bg-blue-100 text-blue-600"
                                                                    >
                                                                        <Edit2Icon className="w-5 h-5"/>
                                                                    </button>
                                                                </td>
                                                                <td className="p-3 align-top">
                                                                    {isCurrentSession ? (
                                                                        <button className="px-4 py-1.5 text-sm font-semibold text-white bg-r-blue rounded-full hover:bg-r-blue-dark">{userRole === 'mentor' ? 'Start Session' : 'Join Session'}</button>
                                                                    ) : session.status === 'completed' ? (
                                                                        <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>
                                                                    ) : (userRole === 'mentor' || userRole === 'mentee') ? (
                                                                        <button onClick={() => setSessionToComplete(session)} className="px-3 py-1 text-sm font-semibold text-r-blue bg-white border border-r-blue rounded-full hover:bg-r-blue-50">Mark as Complete</button>
                                                                    ) : (
                                                                        <span className="px-2.5 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Upcoming</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                           </div>
                        )}
                        {activeTab === 'Mentees' && userRole === 'mentor' && (
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-heading font-semibold text-r-gray-800 mb-4">Enrolled Mentees ({program.mentees.length})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {program.mentees.map(mentee => (
                                        <Link to={`/program-engagement/${programId}/mentee/${mentee.id}`} key={mentee.id} className="block p-4 border rounded-lg hover:bg-r-gray-50 hover:shadow-md">
                                            <div className="flex items-center space-x-3">
                                                <img src={mentee.imageUrl} alt={mentee.name} className="h-12 w-12 rounded-full"/>
                                                <div>
                                                    <p className="font-semibold text-r-gray-800">{mentee.name}</p>
                                                    <p className="text-sm text-r-gray-500">{mentee.grade}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(activeTab === 'Courses' || activeTab === 'Assigned Courses') && (
                             <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-heading font-semibold text-r-gray-800 mb-4">Courses {userRole === 'mentor' ? 'Assigned in this Program' : ''}</h3>
                                { (userRole === 'mentee' ? menteeCourses : allProgramCourses).length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(userRole === 'mentee' ? menteeCourses : allProgramCourses).map(course => (
                                            <CourseCard key={course.id} course={course as AssignedCourse | Course} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-r-gray-500">No courses have been assigned yet.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'Reference Docs' && (
                             <div className="bg-white p-6 rounded-xl shadow-sm">
                                 <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-heading font-semibold text-r-gray-800">Reference Documents</h3>
                                    {userRole === 'mentor' && (
                                        <button onClick={() => setShowAddDocForm(!showAddDocForm)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark">
                                            <PlusIcon className="w-4 h-4"/> Add Document
                                        </button>
                                    )}
                                </div>
                                {showAddDocForm && userRole === 'mentor' && (
                                    <form onSubmit={handleAddDocSubmit} className="my-4 p-4 border rounded-md bg-r-gray-50 space-y-3">
                                        <input type="text" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="Document Title" required className="w-full px-3 py-2 text-sm border border-r-gray-300 rounded-md bg-white text-gray-900"/>
                                        <input type="file" onChange={e => setNewDocFile(e.target.files ? e.target.files[0] : null)} required className="w-full text-sm bg-white text-gray-900"/>
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setShowAddDocForm(false)} className="px-3 py-1 text-sm bg-white border rounded-md">Cancel</button>
                                            <button type="submit" className="px-3 py-1 text-sm text-white bg-r-blue rounded-md">Save</button>
                                        </div>
                                    </form>
                                )}
                                <div className="space-y-3">
                                    {(program.referenceDocs && program.referenceDocs.length > 0) ? (
                                        program.referenceDocs.map((doc) => (
                                            <div key={doc.title} className="flex justify-between items-center p-3 border rounded-md hover:bg-r-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <FileTextIcon className="w-6 h-6 text-r-blue"/>
                                                    <div>
                                                        <p className="font-medium text-r-gray-800">{doc.title}</p>
                                                        <p className="text-xs text-r-gray-500">Uploaded by {doc.uploadedBy} on {new Date(doc.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <a href={doc.url} download className="p-2 text-r-blue hover:bg-r-blue-50 rounded-full">
                                                    <DownloadIcon className="w-5 h-5"/>
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-r-gray-500 text-center py-4">No reference documents have been uploaded for this program.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'Sessions Outline' && userRole === 'mentor' && (
                             <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-heading font-semibold text-r-gray-800 mb-4">Sessions Outline</h3>
                                <div className="space-y-2">
                                    {program.sessionOutline?.map((session, index) => (
                                        <div key={index} className="border rounded-lg bg-gray-50">
                                            <button onClick={() => setOpenOutline(openOutline === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left">
                                                <h3 className="font-semibold text-r-gray-800">{session.title}</h3>
                                                {openOutline === index ? <ChevronUpIcon className="w-5 h-5 text-r-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-r-gray-500" />}
                                            </button>
                                            {openOutline === index && <div className="p-4 border-t"><p className="text-sm text-r-gray-600">{session.details}</p></div>}
                                        </div>
                                    ))}
                                    {(!program.sessionOutline || program.sessionOutline.length === 0) && (
                                        <p className="text-r-gray-500 text-center py-4">No session outline is available for this program.</p>
                                    )}
                                </div>
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
            
            <AddProgramSessionModal 
                isOpen={isSessionModalOpen} 
                onClose={() => setIsSessionModalOpen(false)} 
                onSubmit={handleSessionSubmit} 
                initialData={editingSession} 
            />

            {sessionForAttendance && (
                <AttendanceReportModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => setIsAttendanceModalOpen(false)}
                    onSave={handleSaveAttendance}
                    session={sessionForAttendance}
                    participants={program.mentees}
                />
            )}

            <EndProgramFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onConfirm={handleEndProgramConfirm}
                programTitle={program.title}
                title={program.status === 'completed' ? "Program Feedback" : "End Program & Provide Feedback"}
                buttonText={program.status === 'completed' ? "Submit & Download Certificate" : "Submit & End Program"}
            />

            <MentoringJournalModal
                isOpen={isJournalModalOpen}
                onClose={() => setIsJournalModalOpen(false)}
                onSubmit={handleJournalSubmit}
                journalEntries={program.journal || []}
            />

            {program && <GoalSettingModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSubmit={handleGoalSubmit} initialGoals={program.goals || []} />}
            
            <ProfileDossierModal
                isOpen={isDossierOpen}
                onClose={() => setIsDossierOpen(false)}
                participant={program.mentor}
            />
        </div>
    );
};

export default ProgramEngagementPage;
