
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, SortUpDownIcon, FilterIcon, MoreHorizontalIcon, DownloadIcon, FileTextIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon, FileCsvIcon, CalendarIcon, UserIcon, UsersIcon, CheckCircleIcon } from '../components/Icons';
import type { MentorSearchItem, MentorMenteePair, AppliedMentor, AppliedMentee } from '../types';
import SessionDetailsModal from '../components/SessionDetailsModal';

const mockPrograms: { [id: string]: MentorSearchItem } = {
    'prog1': { 
        id: 'prog1', 
        title: 'Leading with Impact: Empowering Leaders for Tomorrow', 
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/impact/800/450', 
        sessions: 12, 
        mentoringType: 'One-on-One', 
        status: 'In Progress', 
        startDate: '02/06/2023', 
        endDate: '02/12/2023', 
        mentors: 22, 
        mentees: 22, 
        expectedSessions: 12,
        objective: 'To groom high-potential employees into future leaders by developing their strategic thinking, communication, and team management skills.',
        description: 'This intensive program pairs emerging leaders with senior mentors to navigate complex business challenges and prepare for executive roles.',
        skillsCovered: ['Leadership', 'Strategic Thinking', 'Communication', 'Team Management'],
        menteesPerMentor: 1,
        durationMin: 6,
        durationMax: 6,
        programType: 'Open',
        mentorLocation: 'Mumbai',
        mentorDepartment: 'Technology',
        mentorApplicationStartDate: '2023-05-01',
        mentorApplicationEndDate: '2023-05-20',
        menteeEnrollmentStartDate: '2023-05-15',
        menteeEnrollmentEndDate: '2023-05-30',
        contactPerson: { name: 'Program Manager', email: 'admin@example.com'},
        sessionOutline: [
            { title: 'Month 1: Understanding Leadership Styles', details: 'Exploring various leadership theories and identifying personal styles.' },
            { title: 'Month 2: Strategic Communication', details: 'Workshop on communicating with impact to stakeholders.' },
            { title: 'Month 3: Team Dynamics & Motivation', details: 'Strategies for building and motivating high-performing teams.' }
        ],
        referenceDocs: [
             { title: 'Program Handbook.pdf', url: '#', uploadedBy: 'Admin', date: '2023-05-20' },
             { title: 'Leadership Case Studies.docx', url: '#', uploadedBy: 'Admin', date: '2023-06-01' }
        ]
    },
    'prog3': { 
        id: 'prog3', 
        title: 'Pen to Proficiency: Unleashing Your Writing Potential', 
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/writing/800/450', 
        sessions: 10, 
        mentoringType: 'Group Mentoring Program', 
        status: 'In Progress', 
        startDate: '01/08/2023', 
        endDate: '01/11/2023', 
        mentors: 15, 
        mentees: 19, 
        programType: 'Closed',
        expectedSessions: 10,
        description: 'A program to enhance professional writing skills.',
        objective: 'To improve clarity, conciseness, and impact in all forms of business communication.'
    },
};

const mockPairs: { [programId: string]: MentorMenteePair[] } = {
    'prog1': [
        { mentor: 'Tony Roy', mentee: 'Virat Kumar', sessionsCreated: 5, sessionsCompleted: 3, totalSessions: 12, attendancePercent: 60, nextSessionDate: 'to be scheduled' },
        { mentor: 'Rakesh Yadav', mentee: 'Niraj Shah', sessionsCreated: 4, sessionsCompleted: 2, totalSessions: 12, attendancePercent: 50, nextSessionDate: '12/09/2023' },
        { mentor: 'Aaron Smith', mentee: 'Benny Joe', sessionsCreated: 6, sessionsCompleted: 4, totalSessions: 12, attendancePercent: 67, nextSessionDate: '09/09/2023' },
        { mentor: 'Vineet Kumar', mentee: 'Monika Riya', sessionsCreated: 3, sessionsCompleted: 3, totalSessions: 12, attendancePercent: 100, nextSessionDate: 'to be scheduled' },
        { mentor: 'Rani Mahesh', mentee: 'Hari Krishnan', sessionsCreated: 5, sessionsCompleted: 3, totalSessions: 12, attendancePercent: 60, nextSessionDate: 'to be scheduled' },
        { mentor: 'Priya Pradeep', mentee: 'Priyanka Singh', sessionsCreated: 5, sessionsCompleted: 5, totalSessions: 12, attendancePercent: 100, nextSessionDate: '10/09/2023' },
    ],
    'prog3': [
        { mentor: 'Jane Doe', mentee: 'John Smith', sessionsCreated: 2, sessionsCompleted: 1, totalSessions: 10, attendancePercent: 50, nextSessionDate: '15/09/2023' },
    ],
};

// Extending types locally for updated requirements if needed, or assuming API response provides them
const mockAppliedMentors: (AppliedMentor & { empCode: string })[] = [
    { id: '101', name: 'Sachin Kumar', empCode: 'E1001', email: 'sachin.k@example.com', grade: 'L5', location: 'Mumbai', department: 'UI/UX', certification: 'Yes', rating: 3.7, menteesMentored: 4 },
    { id: '102', name: 'Anjali Sharma', empCode: 'E1002', email: 'anjali.s@example.com', grade: 'L6', location: 'Bangalore', department: 'Engineering', certification: 'No', rating: 4.5, menteesMentored: 8 },
];

const mockAppliedMentees: (AppliedMentee & { empCode: string })[] = [
    { id: '201', name: 'Rahul Verma', empCode: 'E2001', email: 'rahul.v@example.com', grade: 'L2', location: 'Mumbai', department: 'Marketing', status: 'Applied' },
    { id: '202', name: 'Priya Singh', empCode: 'E2002', email: 'priya.s@example.com', grade: 'L3', location: 'Delhi', department: 'HR', status: 'Shortlisted' },
];

const ProgramTrackingPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Mentor-Mentee details');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: 'mentor'; direction: 'asc' | 'desc' }>({ key: 'mentor', direction: 'asc' });
    const [openOutline, setOpenOutline] = useState<number | null>(0);
    const [programStatus, setProgramStatus] = useState<string>('In Progress');
    
    const programFromState = location.state?.program as MentorSearchItem;
    const programFromMock = programId ? mockPrograms[programId] : null;
    
    // Determine program data source and handle status updates from navigation
    const program = useMemo(() => {
        const baseProgram = programFromState || programFromMock;
        if (!baseProgram) return null;
        
        return {
            ...baseProgram,
            status: location.state?.updatedStatus || baseProgram.status
        };
    }, [programFromState, programFromMock, location.state?.updatedStatus]);

    useEffect(() => {
        if (program) {
            setProgramStatus(program.status || 'In Progress');
        }
    }, [program]);
    
    const allPairs = programId ? mockPairs[programId] || [] : [];

    const sortedPairs = useMemo(() => {
        const sortableItems = [...allPairs];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [allPairs, sortConfig]);

    const handleSort = () => {
        setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleViewSessionDetails = (pair: MentorMenteePair, index: number) => {
        navigate(`/mentor/program-manager/track/${programId}/pair/${index}`, { state: { pair, programTitle: program?.title } });
    };

    const handleEndProgram = () => {
        navigate(`/mentor/program-manager/end-program/${programId}`, { state: { program } });
    };

    if (!program) {
        return <div className="p-8">Program not found.</div>;
    }
    
    const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
        <div className="mb-4">
            <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
            <div className="text-base text-gray-800">{children}</div>
        </div>
    );
    
    const TABS = useMemo(() => {
        const baseTabs = ['Mentor-Mentee details'];
        if (program?.programType === 'Open') {
            // Renamed as requested
            baseTabs.push('Mentors Enrolled', 'Mentees Enrolled');
        }
        baseTabs.push('Description', 'Reference docs');
        return baseTabs;
    }, [program?.programType]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Yet to start': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    return (
        <div className="bg-r-gray-50 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center space-x-4 h-16">
                         <button onClick={() => navigate('/mentor/program-manager')} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Program Details</h1>
                    </div>
                </div>
            </header>
            
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <img src={program.imageUrl} alt={program.title} className="w-full md:w-1/3 lg:w-1/4 h-auto object-cover rounded-lg" />
                        <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-3xl font-bold text-gray-900">{program.title}</h2>
                                        {/* Visible Colorful Status Tag */}
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getStatusColor(programStatus)}`}>
                                            {programStatus}
                                        </span>
                                    </div>
                                    {program.programType && (
                                        <div className="mt-2">
                                            <span className={`text-sm font-semibold px-3 py-1 rounded-md ${program.programType === 'Open' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {program.programType} Program
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {programStatus === 'In Progress' && (
                                    <button 
                                        onClick={handleEndProgram}
                                        className="flex-shrink-0 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5"/>
                                        End Program
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-sm text-gray-600">
                                <div><span className="font-semibold block text-gray-800">Type</span> {program.mentoringType}</div>
                                <div><span className="font-semibold block text-gray-800">Start Date</span> {program.startDate}</div>
                                <div><span className="font-semibold block text-gray-800">End Date</span> {program.endDate}</div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <div className="bg-gray-100 p-4 rounded-lg text-center min-w-[100px]">
                                    <p className="font-semibold text-gray-500 text-sm">Mentors</p>
                                    <p className="text-3xl font-bold text-gray-800">{program.mentors}</p>
                                </div>
                                 <div className="bg-gray-100 p-4 rounded-lg text-center min-w-[100px]">
                                    <p className="font-semibold text-gray-500 text-sm">Mentees</p>
                                    <p className="text-3xl font-bold text-gray-800">{program.mentees}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {TABS.map(tabName => (
                               <button key={tabName} onClick={() => setActiveTab(tabName)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabName ? 'border-r-blue text-r-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tabName}</button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border">
                        {activeTab === 'Mentor-Mentee details' && (
                             <div>
                                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                    <div className="relative w-full md:w-1/3">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" placeholder="Search by Mentor or Mentee" className="w-full pl-10 pr-4 py-2 border rounded-full bg-white text-gray-900"/>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleSort} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-full bg-white text-gray-700 hover:bg-gray-100">
                                            <SortUpDownIcon className="w-4 h-4" /> Mentor {sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'}
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-full bg-white text-gray-700 hover:bg-gray-100">Filter <FilterIcon className="w-4 h-4" /></button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 border rounded-full hover:bg-green-700"><DownloadIcon className="w-4 h-4"/> Download Excel</button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-white uppercase bg-r-blue">
                                            <tr>
                                                <th className="px-6 py-3">Mentor</th>
                                                <th className="px-6 py-3">Mentee</th>
                                                <th className="px-6 py-3">Sessions Created</th>
                                                <th className="px-6 py-3">Sessions Completed</th>
                                                <th className="px-6 py-3">Attendance %</th>
                                                <th className="px-6 py-3">Next Session date</th>
                                                <th className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedPairs.map((pair, index) => (
                                                <tr key={index} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-700">
                                                    <td className="px-6 py-4">{pair.mentor}</td>
                                                    <td className="px-6 py-4">{pair.mentee}</td>
                                                    <td className="px-6 py-4">{pair.sessionsCreated}</td>
                                                    <td className="px-6 py-4 text-r-blue-dark font-semibold">{`${pair.sessionsCompleted} of ${pair.totalSessions}`}</td>
                                                    <td className="px-6 py-4">{pair.attendancePercent}%</td>
                                                    <td className="px-6 py-4">{pair.nextSessionDate}</td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => handleViewSessionDetails(pair, index)} className="p-2 rounded-full hover:bg-gray-200" title="View Session Details">
                                                            <EyeIcon className="w-5 h-5 text-gray-600" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center items-center space-x-2 mt-6">
                                    <button className="px-3 py-1 border rounded-md text-sm bg-white text-gray-700">&lt;</button>
                                    {[1,2,3,4,5,6,7].map(n=><button key={n} onClick={() => setCurrentPage(n)} className={`px-3 py-1 border rounded-md text-sm ${n===currentPage ? 'bg-r-blue text-white' : 'bg-white text-gray-700'}`}>{n}</button>)}
                                    <button className="px-3 py-1 border rounded-md text-sm bg-white text-gray-700">&gt;</button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Mentors Enrolled' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                     <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 border rounded-full hover:bg-green-700"><FileCsvIcon className="w-4 h-4"/> Download CSV</button>
                                </div>
                                <div className="overflow-x-auto">
                                     <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                {/* Modified Columns */}
                                                {['Emp Code', 'Mentor Name', 'Mentor Email', 'Grade', 'Location', 'Department'].map(h => <th key={h} className="px-6 py-3">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockAppliedMentors.map(mentor => (
                                                <tr key={mentor.id} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-900">
                                                    <td className="px-6 py-4">{mentor.empCode}</td>
                                                    <td className="px-6 py-4 font-semibold text-blue-600"><Link to={`/mentor/details/${mentor.id}`} className="hover:underline">{mentor.name}</Link></td>
                                                    <td className="px-6 py-4">{mentor.email}</td>
                                                    <td className="px-6 py-4">{mentor.grade}</td>
                                                    <td className="px-6 py-4">{mentor.location}</td>
                                                    <td className="px-6 py-4">{mentor.department}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Mentees Enrolled' && (
                            <div>
                                <div className="flex justify-end mb-4">
                                     <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 border rounded-full hover:bg-green-700"><FileCsvIcon className="w-4 h-4"/> Download CSV</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                {/* Modified Columns */}
                                                {['Emp Code', 'Mentee Name', 'Mentee Email', 'Grade', 'Location', 'Department'].map(h => <th key={h} className="px-6 py-3">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockAppliedMentees.map(mentee => (
                                                <tr key={mentee.id} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-900">
                                                    <td className="px-6 py-4">{mentee.empCode}</td>
                                                    <td className="px-6 py-4 font-semibold">{mentee.name}</td>
                                                    <td className="px-6 py-4">{mentee.email}</td>
                                                    <td className="px-6 py-4">{mentee.grade}</td>
                                                    <td className="px-6 py-4">{mentee.location}</td>
                                                    <td className="px-6 py-4">{mentee.department}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Description' && (
                             <div className="space-y-6">
                                 {/* Added all fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Program Title"><p>{program.title}</p></DetailItem>
                                    <DetailItem label="Mentoring Type"><p>{program.mentoringType}</p></DetailItem>
                                    <DetailItem label="Objective"><p>{program.objective}</p></DetailItem>
                                    <DetailItem label="Description"><p>{program.description}</p></DetailItem>
                                    <DetailItem label="Duration"><p>{`${program.durationMin} - ${program.durationMax} months`}</p></DetailItem>
                                    <DetailItem label="Mentees per Mentor"><p>{program.menteesPerMentor}</p></DetailItem>
                                    <DetailItem label="Program Dates"><p>{program.startDate} to {program.endDate}</p></DetailItem>
                                    <DetailItem label="Mentor Application Dates"><p>{program.mentorApplicationStartDate} to {program.mentorApplicationEndDate}</p></DetailItem>
                                    <DetailItem label="Mentee Enrollment Dates"><p>{program.menteeEnrollmentStartDate} to {program.menteeEnrollmentEndDate}</p></DetailItem>
                                    <DetailItem label="Contact Person"><p>{program.contactPerson?.name} ({program.contactPerson?.email})</p></DetailItem>
                                    <DetailItem label="Academy"><p>{program.academy || 'N/A'}</p></DetailItem>
                                    <DetailItem label="Location"><p>{program.location || 'N/A'}</p></DetailItem>
                                </div>
                                <DetailItem label="Skills Covered">
                                    <div className="flex flex-wrap gap-2">
                                        {program.skillsCovered?.map(skill => <span key={skill} className="bg-r-blue-50 text-r-blue-dark text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)}
                                    </div>
                                </DetailItem>
                                
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Sessions Outline</h3>
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
                                    </div>
                                </div>
                            </div>
                        )}
                         {activeTab === 'Reference docs' && (
                             <div>
                                <h3 className="text-lg font-heading font-semibold text-r-gray-800 mb-4">Reference Documents</h3>
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProgramTrackingPage;
