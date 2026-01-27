
// ... imports remain same ...
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UsersIcon, AwardIcon, FileTextIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, DownloadIcon, EyeIcon, ShareIcon } from '../components/Icons';
import type { MentorSearchItem } from '../types';
import AssignToTeamModal from '../components/AssignToTeamModal';
import ShareModal from '../components/ShareModal';
import ApplyAsMentorModal from '../components/ApplyAsMentorModal';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import VideoPlayerModal from '../components/VideoPlayerModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

const mockPrograms: { [id: string]: MentorSearchItem } = {
    'tech-mentoring': { 
        id: 'tech-mentoring', 
        title: 'Tech Mentoring Program', 
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/techprog/800/450', 
        description: 'A structured program for aspiring tech leaders, focusing on advanced technical skills, leadership, and project ownership. Participants will work on real-world problems under the guidance of senior engineers and architects.', 
        isAvailable: true, proficiencyLevel: 'Level 1 - Awareness', 
        duration: '2 Hour(s)', 
        creditHours: '2 Hour(s)', 
        contactPerson: { name: 'Program Manager', email: 'learningoperations@ril.com'}, 
        academy: 'HR Academy', 
        assignedOn: '26-06-2025', 
        learningObjectives: ['Understand scalable system architecture.', 'Develop effective code review practices.', 'Lead a small technical project.'], 
        skillsCovered: ['Mentoring', 'Leadership', 'System Design'], 
        mentoringType: 'Group', 
        maxMentees: 15, 
        programDurationDays: 90, 
        expectedSessions: 8, 
        attendanceRequiredPercent: 75, 
        sessionOutline: [ { title: 'Kick-off and Introductions', details: 'Program overview and goal setting.' }, { title: 'Workshop: System Design', details: 'Deep dive into scalable system design.' }, { title: 'Mentee Project Presentations', details: 'Mentees present their project progress.' } ], 
        videos: [
            { title: 'Welcome to the Program', thumbnailUrl: 'https://picsum.photos/seed/vid1/400/225', videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
            { title: 'Deep Dive into System Design', thumbnailUrl: 'https://picsum.photos/seed/vid2/400/225', videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
        ],
        aboutProgramDocs: [
            { title: 'Program Brochure.pdf', url: '#', uploadedBy: 'Program Manager', date: '2024-06-15' },
            { title: 'Information Sheet.pdf', url: '#', uploadedBy: 'Program Manager', date: '2024-06-20' }
        ],
        referenceDocs: [
            { title: 'Program Handbook.pdf', url: '#', uploadedBy: 'Program Manager', date: '2024-07-01' },
            { title: 'Case Study.pptx', url: '#', uploadedBy: 'Program Manager', date: '2024-07-05' }
        ],
        // Dates set in future (2026) for countdown visibility
        mentorApplicationStartDate: '2026-10-01', 
        mentorApplicationEndDate: '2026-10-20', 
        menteeEnrollmentStartDate: '2026-10-01', 
        menteeEnrollmentEndDate: '2026-10-25', 
        startDate: '2026-11-01', 
        endDate: '2027-01-31',
        isShareable: true,
    },
    'future-leaders': { 
        id: 'future-leaders', 
        title: 'Future Leaders Program', 
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/future/800/450', 
        description: 'Accelerated development for high-potential individuals aiming for leadership roles. The program covers strategic thinking, change management, and financial acumen.', 
        isAvailable: false, 
        proficiencyLevel: 'Level 3 - Expert', 
        duration: '6 Month(s)', 
        creditHours: '40 Hour(s)', 
        contactPerson: { name: 'Program Lead', email: 'leaders@ril.com'}, 
        academy: 'Leadership Academy', 
        assignedOn: 'N/A', 
        learningObjectives: ['Develop a strategic business plan.', 'Lead a cross-functional team through a change initiative.', 'Analyze financial statements to make informed decisions.'], 
        skillsCovered: ['Strategy', 'Communication', 'Financial Acumen', 'Change Management'], 
        mentoringType: 'Group', 
        maxMentees: 10, 
        programDurationDays: 180, 
        expectedSessions: 12, 
        attendanceRequiredPercent: 80, 
        sessionOutline: [ { title: 'Module 1: Strategic Thinking', details: 'Learn to develop and execute business strategy.' }, { title: 'Module 2: Change Management', details: 'Lead teams through organizational change.' }, { title: 'Capstone Project', details: 'Apply learnings to a real-world business challenge.' } ], 
        // Future dates
        mentorApplicationStartDate: '2026-11-01', 
        mentorApplicationEndDate: '2026-11-20', 
        menteeEnrollmentStartDate: '2026-11-01', 
        menteeEnrollmentEndDate: '2026-11-25', 
        startDate: '2026-12-01', 
        endDate: '2027-05-01', 
        isShareable: false 
    },
    'active_prog_1': { 
        id: 'active_prog_1', 
        title: 'Data Science for All', 
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/data/800/450', 
        description: 'A comprehensive program covering Machine Learning, Python, and Data Visualization, designed for professionals looking to transition into data science roles.', 
        isAvailable: true, 
        skillsCovered: ['Machine Learning', 'Python', 'Data Visualization'],
        mentoringType: 'Group',
        expectedSessions: 10,
        attendanceRequiredPercent: 80,
        programDurationDays: 120,
        proficiencyLevel: 'Level 2 - Intermediate',
        // Future dates
        menteeEnrollmentStartDate: '2026-09-15',
        menteeEnrollmentEndDate: '2026-09-30',
        mentorApplicationStartDate: '2026-09-01',
        mentorApplicationEndDate: '2026-09-20',
        sessionOutline: [
            { title: 'Intro to Data Science', details: 'Program overview and tools setup.' },
            { title: 'Python for Data Science', details: 'Learn the basics of Pandas and NumPy.' }
        ],
        startDate: '2026-10-01',
        endDate: '2027-01-30',
        isShareable: true,
    },
    'completed_prog_1': {
        id: 'completed_prog_1',
        title: 'Tech Mentoring Program (Completed)',
        type: 'program', 
        imageUrl: 'https://picsum.photos/seed/techprog-completed/800/450',
        description: 'A past mentoring program on Leadership and Project Management. This program is now closed.',
        isAvailable: false,
        skillsCovered: ['Leadership', 'Project Management'],
        mentoringType: 'Group',
        programDurationDays: 90,
        startDate: '2023-11-01',
        endDate: '2024-02-01',
        isShareable: false,
    }
};

const formatDateTimeDisplay = (dateStr?: string, isEndOfDay?: boolean) => {
    if (!dateStr) return 'N/A';
    
    let dateObj: Date;
    // Check if string is YYYY-MM-DD
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    
    if (isDateOnly) {
        // Construct date with specific time to ensure consistent display
        dateObj = new Date(`${dateStr}T${isEndOfDay ? '23:59:59' : '10:00:00'}`);
    } else {
        dateObj = new Date(dateStr);
    }

    if (isNaN(dateObj.getTime())) return dateStr;

    // Format: YYYY-MM-DD HH:MM AM/PM
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => {
    if (!value) return null;
    return <p className="flex items-center gap-3"><span className="text-r-gray-500">{icon}</span><strong>{label}:</strong> {value}</p>;
};

const DateInfoItem: React.FC<{ title: string; dateStr?: string; isEndOfDay?: boolean }> = ({ title, dateStr, isEndOfDay }) => {
    if (!dateStr) return null;
    const formattedDate = formatDateTimeDisplay(dateStr, isEndOfDay);
    return (
        <div className="mb-4 pb-4 border-b border-r-gray-200 last:border-b-0 last:pb-0">
            <p className="text-xs font-bold text-r-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-base font-medium text-r-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-r-blue" />
                {formattedDate}
            </p>
        </div>
    );
};

const CountdownDisplay: React.FC<{ targetDate?: string, label: string }> = ({ targetDate, label }) => {
    const calculateState = () => {
        if (!targetDate) return null;
        
        let targetTime: number;
        // Handle YYYY-MM-DD format explicitly by setting to end of day
        if (/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
             targetTime = new Date(`${targetDate}T23:59:59`).getTime();
        } else {
             targetTime = new Date(targetDate).getTime();
        }

        if (isNaN(targetTime)) return null;

        const now = Date.now();
        const difference = targetTime - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            return `${days}d : ${hours}h : ${minutes}m`;
        }
        return 'Expired';
    };

    // Initialize state lazily to ensure synchronous calculation on first render
    const [timeLeft, setTimeLeft] = useState<string | null>(() => calculateState());

    useEffect(() => {
        // Immediate update on effect to catch any discrepancy
        setTimeLeft(calculateState());
        
        const timer = setInterval(() => {
            setTimeLeft(calculateState());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft || timeLeft === 'Expired') return null;

    return (
        <div className="mt-2 py-1 px-2 bg-orange-50 border border-orange-200 rounded text-center shadow-sm w-fit min-w-[40%] mx-auto">
            <p className="text-[9px] text-orange-800 font-bold uppercase tracking-wider mb-0.5 leading-none">{label}</p>
            <div className="text-[10px] font-mono font-bold text-orange-700 leading-none">
                {timeLeft}
            </div>
        </div>
    );
};

const ProgramDetailsPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = location.state?.userRole || 'mentee';
    const isEnrolled = location.state?.isEnrolled || false;

    const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApplyMentorModalOpen, setIsApplyMentorModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [openSession, setOpenSession] = useState<number | null>(0);
    const [videoForModal, setVideoForModal] = useState<{ src: string; title: string } | null>(null);
    const [docForModal, setDocForModal] = useState<{ url: string; title: string } | null>(null);

    const program = programId ? mockPrograms[programId] : null;
    
    const journey = userRole === 'mentee' ? 'Mentee Journey' : 'Mentor Journey';
    const journeyPath = userRole === 'mentee' ? '/mentor/mentee-journey' : '/mentor/mentor-journey';
    const discover = userRole === 'mentee' ? 'Discover' : 'Discover Programs';
    const discoverPath = userRole === 'mentee' ? '/mentor/search' : '/mentor/program-search';

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: journey, path: journeyPath },
        { label: discover, path: discoverPath },
        { label: program?.title || 'Program Details', path: `/program/${programId}` },
    ];

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const showToast = (message: string) => {
        setToastMessage(message);
    };

    if (!program) {
        return <div>Program not found.</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-r-gray-50 p-6 rounded-xl">
                             <img src={program.imageUrl} alt={program.title} className="w-full h-64 object-cover rounded-lg mb-6 shadow-sm"/>
                             
                             <div className="flex flex-wrap gap-3 mb-4">
                                 <span className="text-sm font-semibold text-purple-800 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200">Mentoring Program</span>
                                 <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${program.mentoringType === 'One-on-One' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}>
                                    {program.mentoringType === 'One-on-One' ? 'One-on-One' : 'Group Mentoring'}
                                 </span>
                             </div>

                             <h1 className="text-3xl font-heading font-bold text-r-gray-900">{program.title}</h1>
                             <p className="mt-4 text-r-gray-600 leading-relaxed">{program.description}</p>
                             
                             <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Learning Objectives</h2>
                                <ul className="space-y-2 list-disc list-inside text-r-gray-700">
                                    {program.learningObjectives?.map((obj, i) => <li key={i}>{obj}</li>)}
                                </ul>
                             </div>
                             
                             <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Skills Mapping</h2>
                                <div className="flex flex-wrap gap-2">
                                    {program.skillsCovered?.map(skill => (
                                        <span key={skill} className="bg-r-blue-50 text-r-blue-dark text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                             </div>

                             <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Sessions Outline</h2>
                                <div className="space-y-2">
                                    {program.sessionOutline?.map((session, index) => (
                                        <div key={index} className="border rounded-lg bg-white">
                                            <button onClick={() => setOpenSession(openSession === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors">
                                                <h3 className="font-semibold text-r-gray-800">{session.title}</h3>
                                                {openSession === index ? <ChevronUpIcon className="w-5 h-5 text-r-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-r-gray-500" />}
                                            </button>
                                            {openSession === index && <div className="p-4 border-t bg-gray-50"><p className="text-sm text-r-gray-600">{session.details}</p></div>}
                                        </div>
                                    ))}
                                </div>
                             </div>

                             <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Related Videos</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {program.videos?.map((video) => (
                                        <div key={video.title} className="group cursor-pointer" onClick={() => setVideoForModal({ src: video.videoSrc, title: video.title })}>
                                            <div className="relative">
                                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                                </div>
                                            </div>
                                            <h3 className="mt-2 text-sm font-semibold text-r-gray-800 group-hover:text-r-blue">{video.title}</h3>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">About Program Documents</h2>
                                <div className="space-y-3">
                                    {program.aboutProgramDocs?.map((doc) => (
                                        <div key={doc.title} className="flex justify-between items-center p-3 border rounded-lg bg-white hover:bg-r-gray-50 transition-colors shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FileTextIcon className="w-6 h-6 text-purple-600"/>
                                                <div>
                                                    <p className="font-medium text-r-gray-800">{doc.title}</p>
                                                    <p className="text-xs text-r-gray-500">Uploaded by {doc.uploadedBy} on {new Date(doc.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => setDocForModal({ url: doc.url, title: doc.title })} 
                                                    className="px-3 py-1.5 text-xs font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50 flex items-center gap-1"
                                                >
                                                    <EyeIcon className="w-3 h-3"/> Preview
                                                </button>
                                                <a 
                                                    href={doc.url} 
                                                    download 
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark flex items-center gap-1"
                                                >
                                                    <DownloadIcon className="w-3 h-3"/> Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {!program.aboutProgramDocs?.length && (
                                        <p className="text-sm text-gray-500 italic">No documents available.</p>
                                    )}
                                </div>
                             </div>
                             
                              <div className="mt-8">
                                <h2 className="text-xl font-heading font-semibold text-r-gray-800 border-b pb-2 mb-4">Reference Documents</h2>
                                <div className="space-y-3">
                                    {program.referenceDocs?.map((doc) => (
                                        <div key={doc.title} className="flex justify-between items-center p-3 border rounded-lg bg-white hover:bg-r-gray-50 transition-colors shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FileTextIcon className="w-6 h-6 text-r-blue"/>
                                                <div>
                                                    <p className="font-medium text-r-gray-800">{doc.title}</p>
                                                    <p className="text-xs text-r-gray-500">Uploaded by {doc.uploadedBy} on {new Date(doc.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setDocForModal({ url: doc.url, title: doc.title })} className="p-2 text-r-blue hover:bg-r-blue-50 rounded-full" title="Preview">
                                                    <EyeIcon className="w-5 h-5"/>
                                                </button>
                                                <a href={doc.url} download className="p-2 text-r-blue hover:bg-r-blue-50 rounded-full" title="Download">
                                                    <DownloadIcon className="w-5 h-5"/>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-r-gray-50 p-6 rounded-xl sticky top-24 shadow-sm border border-r-gray-200">
                             <div className="space-y-6">
                                {isEnrolled ? (
                                    <Link
                                        to={`/program-engagement/${program.id}`}
                                        state={{ userRole }}
                                        className="w-full text-center block px-6 py-3 text-white font-semibold rounded-lg bg-r-blue hover:bg-r-blue-dark shadow-md transition-colors"
                                    >
                                        Continue to Program
                                    </Link>
                                ) : (
                                    <>
                                        {/* Mentee Enrollment Section */}
                                        <div className={(userRole !== 'mentee' && userRole !== 'mentor') ? 'opacity-50 pointer-events-none' : ''}>
                                            <button className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-colors ${program.isAvailable ? 'bg-r-blue hover:bg-r-blue-dark' : 'bg-r-gray-400 cursor-not-allowed'}`} disabled={!program.isAvailable || (userRole !== 'mentee' && userRole !== 'mentor')}>
                                                {program.isAvailable ? 'Enroll as Mentee' : 'Enrollment Closed'}
                                            </button>
                                            {(userRole === 'mentee' || userRole === 'mentor') && program.isAvailable && (
                                                <CountdownDisplay targetDate={program.menteeEnrollmentEndDate} label="Time left to Enroll:" />
                                            )}
                                        </div>
                                        
                                        {/* Mentor Application Section */}
                                        <div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-1">
                                                    <button 
                                                        onClick={() => setIsApplyMentorModalOpen(true)} 
                                                        className={`w-full h-full px-4 py-2 text-sm font-semibold border rounded-lg shadow-sm transition-colors flex items-center justify-center text-center leading-tight ${(program.isAvailable && userRole === 'mentor') ? 'text-r-blue border-r-blue hover:bg-r-blue-50 bg-white' : 'text-r-gray-400 border-r-gray-200 bg-r-gray-100 cursor-not-allowed'}`}
                                                        disabled={!program.isAvailable || userRole !== 'mentor'}
                                                    >
                                                        Apply as a Mentor
                                                    </button>
                                                </div>
                                                {program.isShareable !== false && (
                                                    <div className="col-span-1">
                                                        <button 
                                                            onClick={() => setIsShareModalOpen(true)} 
                                                            className="w-full h-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-r-gray-700 border border-r-gray-300 bg-white rounded-lg hover:bg-r-gray-100 shadow-sm transition-colors"
                                                        >
                                                            <ShareIcon className="w-4 h-4" />
                                                            Share
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {userRole === 'mentor' && program.isAvailable && (
                                                <CountdownDisplay targetDate={program.mentorApplicationEndDate} label="Time left to Apply:" />
                                            )}
                                        </div>
                                    </>
                                )}
                             </div>

                             <div className="mt-8 pt-6 space-y-2 border-t border-r-gray-300">
                                <h3 className="font-heading font-semibold text-lg mb-4 text-r-gray-800">Key Dates</h3>
                                
                                <DateInfoItem title="Mentor Application Starts:" dateStr={program.mentorApplicationStartDate} />
                                <DateInfoItem title="Mentor Application Ends:" dateStr={program.mentorApplicationEndDate} isEndOfDay />
                                
                                <DateInfoItem title="Mentee Enrollment Starts:" dateStr={program.menteeEnrollmentStartDate} />
                                <DateInfoItem title="Mentee Enrollment Ends:" dateStr={program.menteeEnrollmentEndDate} isEndOfDay />
                                
                                <DateInfoItem title="Program Live Date:" dateStr={program.startDate} />
                                <DateInfoItem title="Program End Date:" dateStr={program.endDate} isEndOfDay />
                             </div>

                             <div className="mt-6 pt-6 border-t border-r-gray-300 space-y-3 text-sm text-r-gray-700">
                                <InfoItem icon={<UsersIcon className="w-5 h-5"/>} label="Mentoring Type" value={program.mentoringType} />
                                {/* Duration removed */}
                                <InfoItem icon={<UserIcon className="w-5 h-5"/>} label="Contact" value={program.contactPerson?.name} />
                                
                                {program.attendanceRequiredPercent && (
                                     <InfoItem icon={<CheckCircleIcon className="w-5 h-5"/>} label="Attendance Required" value={`${program.attendanceRequiredPercent}%`} />
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
             {toastMessage && (
                 <div className="fixed bottom-5 right-5 bg-r-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    {toastMessage}
                </div>
            )}
            {program.isShareable !== false && <AssignToTeamModal isOpen={isAssignTeamModalOpen} onClose={() => setIsAssignTeamModalOpen(false)} onSubmit={() => { setIsAssignTeamModalOpen(false); showToast('Assigned to team.'); }} program={program}/>}
            {program.isShareable !== false && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onSubmit={() => { setIsShareModalOpen(false); showToast('Program shared.'); }} program={program}/>}
            <ApplyAsMentorModal isOpen={isApplyMentorModalOpen} onClose={() => setIsApplyMentorModalOpen(false)} onSubmit={() => { setIsApplyMentorModalOpen(false); showToast('Application submitted.'); }} program={program}/>
            {videoForModal && <VideoPlayerModal isOpen={true} onClose={() => setVideoForModal(null)} videoSrc={videoForModal.src} title={videoForModal.title} />}
            {docForModal && <DocumentPreviewModal isOpen={true} onClose={() => setDocForModal(null)} docUrl={docForModal.url} title={docForModal.title} />}
        </div>
    );
};

export default ProgramDetailsPage;
