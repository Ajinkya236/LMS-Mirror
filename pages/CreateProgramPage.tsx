
import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, UploadIcon, XIcon, PlusIcon, SearchIcon, Trash2Icon, FileTextIcon, DownloadIcon, FileCsvIcon, CheckCircleIcon } from '../components/Icons';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import SearchableDropdown from '../components/SearchableDropdown';

const NOTIFICATION_TEMPLATES = [
    'Program Welcome Email',
    'Session Reminder (24h before)',
    'Session Feedback Request',
    'Program Completion Congratulation',
    'Mentor Application Received',
    'Mentee Enrollment Confirmation',
    'Program Update Announcement'
];

const FEEDBACK_FORMS = [
    'Standard Mentor Post-Program Feedback',
    'Detailed Mentor Feedback V2',
    'Standard Mentee Post-Program Feedback',
    'NPS Survey',
    'Session Effectiveness Survey'
];

const CERTIFICATE_TEMPLATES = [
    'Standard Completion Certificate',
    'Excellence in Mentoring',
    'Certificate of Participation',
    'Leadership Development Certificate'
];

const LOCATION_OPTIONS = [
    'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote'
];

const ACADEMY_OPTIONS = [
    'HR Academy', 'Tech Academy', 'Leadership Academy', 'Sales Academy', 'Marketing Academy', 'Finance Academy', 'Operations Academy'
];

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ["Program Details", "Mentor-Mentee Criterion", "Feedbacks and Notifications", "Program Schedule"];
    return (
        <div className="flex items-center justify-center">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;

                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center text-center w-28">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300 ${
                                isActive ? 'bg-r-blue text-white ring-4 ring-r-blue-100' :
                                isCompleted ? 'bg-green-500 text-white' :
                                'bg-gray-200 text-gray-500'
                            }`}>
                                {isCompleted ? '✔' : stepNumber}
                            </div>
                            <p className={`mt-2 text-sm leading-tight ${isActive ? 'text-r-blue font-semibold' : 'text-gray-500'}`}>{label}</p>
                        </div>
                        {stepNumber < steps.length && <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const NumberSpinner: React.FC<{ label: string, value: number, onValueChange: (newValue: number) => void, disabled?: boolean, required?: boolean }> = ({ label, value, onValueChange, disabled = false, required = false }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="mt-1 flex items-center space-x-2">
                <button type="button" onClick={() => onValueChange(Math.max(0, value - 1))} className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-900" disabled={disabled}>-</button>
                <span className="w-12 text-center bg-white text-gray-900">{value}</span>
                <button type="button" onClick={() => onValueChange(value + 1)} className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-900" disabled={disabled}>+</button>
            </div>
        </div>
    );
};

interface ProgramVideo {
    title: string;
    link: string;
}

interface ProgramDoc {
    title: string;
    file: File;
}

interface CriteriaItem {
    id: number;
    type: string;
    value: string;
}

const CRITERIA_TYPES = ['Location', 'Department', 'Grade', 'Tenure'];

const CRITERIA_OPTIONS: { [key: string]: string[] } = {
    'Location': ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote'],
    'Department': ['Technology', 'HR', 'Marketing', 'Finance', 'Operations', 'Sales', 'Product', 'Design'],
    'Grade': ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'Executive'],
    'Tenure': ['< 1 Year', '1-3 Years', '3-5 Years', '5-10 Years', '> 10 Years']
};

const CriteriaBuilder: React.FC<{ 
    title: string; 
    criteriaList: CriteriaItem[]; 
    setCriteriaList: (list: CriteriaItem[]) => void; 
    required?: boolean;
}> = ({ title, criteriaList, setCriteriaList, required }) => {
    
    const addCriteria = () => {
        const newId = criteriaList.length > 0 ? Math.max(...criteriaList.map(c => c.id)) + 1 : 1;
        // Default to 'Location' and empty value
        setCriteriaList([...criteriaList, { id: newId, type: 'Location', value: '' }]);
    };

    const removeCriteria = (id: number) => {
        setCriteriaList(criteriaList.filter(c => c.id !== id));
    };

    const updateCriteria = (id: number, field: 'type' | 'value', value: string) => {
        setCriteriaList(criteriaList.map(c => {
            if (c.id === id) {
                if (field === 'type') {
                    // Reset value if type changes to ensure consistency
                    return { ...c, type: value, value: '' };
                }
                return { ...c, value };
            }
            return c;
        }));
    };

    return (
        <div className="p-4 border rounded-md bg-white shadow-sm">
            <h3 className="font-semibold mb-4 text-r-gray-800">{title} {required && <span className="text-red-500">*</span>}</h3>
            <div className="space-y-3">
                {criteriaList.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <select 
                            value={item.type} 
                            onChange={(e) => updateCriteria(item.id, 'type', e.target.value)}
                            className="block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm rounded-md bg-white text-gray-900"
                        >
                            {CRITERIA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        
                        {/* Dropdown for Value based on Type */}
                        <select
                            value={item.value}
                            onChange={(e) => updateCriteria(item.id, 'value', e.target.value)}
                            className="block w-2/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm rounded-md bg-white text-gray-900"
                        >
                            <option value="">Select {item.type}</option>
                            {CRITERIA_OPTIONS[item.type]?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>

                        <button onClick={() => removeCriteria(item.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2Icon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {criteriaList.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No criteria added.</p>
                )}
            </div>
            <button 
                type="button" 
                onClick={addCriteria} 
                className="mt-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-r-blue border border-r-blue rounded-md hover:bg-r-blue-50"
            >
                <PlusIcon className="w-4 h-4"/> Add Criteria
            </button>
        </div>
    );
};

const CreateProgramPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    // State for Step 1
    const [programDetails, setProgramDetails] = useState({
        title: '',
        learningObjectives: '',
        description: '',
        skills: [] as string[],
        mentoringType: 'Group',
        sessionOutline: [{ title: '', details: '' }],
        programType: 'Open',
        isShareable: true,
        contactEmail: '',
        attendancePercent: 75,
        menteesPerMentor: 1, // Added for Open Program
        videos: [] as ProgramVideo[],
        referenceDocs: [] as ProgramDoc[],
        aboutProgramDocs: [] as ProgramDoc[], // Added About Program Docs
        location: '', // Added Location
        academy: '', // Added Academy
    });
    
    // Helper states for inputs
    const [skillInput, setSkillInput] = useState('');
    
    // Video helper states
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoLink, setNewVideoLink] = useState('');

    // Doc helper states
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // About Program Doc helper states
    const [newAboutDocTitle, setNewAboutDocTitle] = useState('');
    const [newAboutDocFile, setNewAboutDocFile] = useState<File | null>(null);
    const aboutFileInputRef = useRef<HTMLInputElement>(null);

    // State for Step 2 - Open Program
    const [mentorCriteriaList, setMentorCriteriaList] = useState<CriteriaItem[]>([]);
    const [menteeCriteriaList, setMenteeCriteriaList] = useState<CriteriaItem[]>([]);
    
    // State for Step 2 - Closed Program
    // Updated to track single mapping file
    const [closedProgramData, setClosedProgramData] = useState({
        mappingFile: null as File | null,
        isMappingUploaded: false
    });

    // State for Step 3
    const [step3Data, setStep3Data] = useState({
        notifications: [] as string[],
        mentorFeedbackForm: '',
        menteeFeedbackForm: '',
        mentorCertificate: '',
        menteeCertificate: '',
    });
    
    const [selectedNotification, setSelectedNotification] = useState('');

    // State for Step 4
    const [scheduleDetails, setScheduleDetails] = useState({
        programStart: '',
        programEnd: '',
        mentorAppStart: '',
        mentorAppEnd: '',
        menteeAppStart: '',
        menteeAppEnd: '',
        sessionSchedules: [] as { date: string, startTime: string, endTime: string }[],
    });

    useEffect(() => {
        if (location.state?.programToEdit) {
            const programToEdit = location.state.programToEdit;
            setProgramDetails({
                title: programToEdit.title || '',
                learningObjectives: programToEdit.objective || '', // Mapping objective to learningObjectives
                description: programToEdit.description || '',
                skills: programToEdit.skills || [],
                mentoringType: programToEdit.mentoringType === 'One to One' ? 'One-on-One' : 'Group',
                sessionOutline: programToEdit.sessionOutline?.length ? programToEdit.sessionOutline : [{ title: '', details: '' }],
                programType: programToEdit.programType || 'Open',
                isShareable: programToEdit.isShareable ?? true,
                contactEmail: programToEdit.contactPerson?.email || '',
                attendancePercent: programToEdit.attendanceRequiredPercent || 75,
                menteesPerMentor: programToEdit.menteesPerMentor || 1,
                videos: programToEdit.videos?.map((v: any) => ({ title: v.title, link: v.videoSrc })) || [],
                referenceDocs: [], // Files can't be carried over easily
                aboutProgramDocs: [],
                location: programToEdit.location || '',
                academy: programToEdit.academy || '',
            });
            
            if (programToEdit.mentorCriteriaList) setMentorCriteriaList(programToEdit.mentorCriteriaList);
            if (programToEdit.menteeCriteriaList) setMenteeCriteriaList(programToEdit.menteeCriteriaList);

            // Flattening nested objects to state for editing
            setStep3Data({
                notifications: Array.isArray(programToEdit.notifications) ? programToEdit.notifications : Object.values(programToEdit.notifications || {}),
                mentorFeedbackForm: programToEdit.feedbackForms?.mentor || '',
                menteeFeedbackForm: programToEdit.feedbackForms?.mentee || '',
                mentorCertificate: programToEdit.certificates?.mentor || '',
                menteeCertificate: programToEdit.certificates?.mentee || '',
            });
        }
    }, [location.state]);

    useEffect(() => {
        // Initialize or update session schedules when the outline changes
        if (programDetails.sessionOutline.length !== scheduleDetails.sessionSchedules.length) {
            setScheduleDetails(prev => ({
                ...prev,
                sessionSchedules: programDetails.sessionOutline.map(() => ({ date: '', startTime: '', endTime: '' }))
            }));
        }
    }, [programDetails.sessionOutline, scheduleDetails.sessionSchedules.length]);


    const handleDetailsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProgramDetails(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setProgramDetails(prev => ({ ...prev, [name]: checked }));
    };
    
    // Skill selection logic
    const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!programDetails.skills.includes(skillInput.trim())) {
                setProgramDetails(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
                setSkillInput('');
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setProgramDetails(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    // Video Logic
    const addVideo = () => {
        if (newVideoTitle.trim() && newVideoLink.trim()) {
            setProgramDetails(prev => ({
                ...prev,
                videos: [...prev.videos, { title: newVideoTitle, link: newVideoLink }]
            }));
            setNewVideoTitle('');
            setNewVideoLink('');
        }
    };

    const removeVideo = (index: number) => {
        setProgramDetails(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }));
    };

    // Document Logic
    const addDocument = () => {
        if (newDocTitle.trim() && newDocFile) {
            setProgramDetails(prev => ({
                ...prev,
                referenceDocs: [...prev.referenceDocs, { title: newDocTitle, file: newDocFile }]
            }));
            setNewDocTitle('');
            setNewDocFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeDocument = (index: number) => {
        setProgramDetails(prev => ({
            ...prev,
            referenceDocs: prev.referenceDocs.filter((_, i) => i !== index)
        }));
    };

    // About Program Document Logic
    const addAboutDocument = () => {
        if (newAboutDocTitle.trim() && newAboutDocFile) {
            setProgramDetails(prev => ({
                ...prev,
                aboutProgramDocs: [...prev.aboutProgramDocs, { title: newAboutDocTitle, file: newAboutDocFile }]
            }));
            setNewAboutDocTitle('');
            setNewAboutDocFile(null);
            if (aboutFileInputRef.current) aboutFileInputRef.current.value = '';
        }
    };

    const removeAboutDocument = (index: number) => {
        setProgramDetails(prev => ({
            ...prev,
            aboutProgramDocs: prev.aboutProgramDocs.filter((_, i) => i !== index)
        }));
    };

    // Step 3 Handlers
    const addNotification = () => {
        if (selectedNotification && !step3Data.notifications.includes(selectedNotification)) {
            setStep3Data(prev => ({ ...prev, notifications: [...prev.notifications, selectedNotification] }));
            setSelectedNotification('');
        }
    };

    const removeNotification = (notif: string) => {
        setStep3Data(prev => ({ ...prev, notifications: prev.notifications.filter(n => n !== notif) }));
    };

    // Session outline logic
    const handleSessionOutlineChange = (index: number, field: 'title' | 'details', value: string) => {
        const updatedOutline = [...programDetails.sessionOutline];
        updatedOutline[index][field] = value;
        setProgramDetails(prev => ({ ...prev, sessionOutline: updatedOutline }));
    };
    const addSessionOutline = () => {
        setProgramDetails(prev => ({ ...prev, sessionOutline: [...prev.sessionOutline, { title: '', details: '' }] }));
    };
    const removeSessionOutline = (index: number) => {
        if (programDetails.sessionOutline.length > 1) {
            setProgramDetails(prev => ({ ...prev, sessionOutline: prev.sessionOutline.filter((_, i) => i !== index) }));
        }
    };

    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setScheduleDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSessionScheduleChange = (index: number, field: 'date' | 'startTime' | 'endTime', value: string) => {
        const updatedSchedules = [...scheduleDetails.sessionSchedules];
        updatedSchedules[index][field] = value;
        setScheduleDetails(prev => ({ ...prev, sessionSchedules: updatedSchedules }));
    };

    // Closed Program Helper Functions
    const handleClosedFileChange = (file: File | null) => {
        setClosedProgramData(prev => ({ ...prev, mappingFile: file, isMappingUploaded: false }));
    };

    const handleUpload = () => {
        // Simulate upload
        setTimeout(() => {
            setClosedProgramData(prev => ({ ...prev, isMappingUploaded: true }));
            alert('Mentor-Mentee Mapping uploaded successfully.');
        }, 1000);
    };

    const handleDownloadSample = () => {
        alert("Downloading sample CSV...");
    };

    const nextStep = () => {
        if (currentStep === 1) {
            // Validation for Academy and Location
            if (!programDetails.academy) {
                alert('Please select an Academy.');
                return;
            }
            if (!programDetails.location) {
                alert('Please select a Location.');
                return;
            }
        }
        if (currentStep === 2) {
            if (programDetails.programType === 'Open') {
                if (mentorCriteriaList.length === 0) {
                    alert('Please add at least one Mentor Criteria.');
                    return;
                }
                if (menteeCriteriaList.length === 0) {
                    alert('Please add at least one Mentee Criteria.');
                    return;
                }
            } else {
                // For Closed programs, validate if mapping file is uploaded
                if (!closedProgramData.isMappingUploaded) {
                    if (!window.confirm("You haven't uploaded the mentor-mentee mapping yet. Do you want to proceed anyway?")) {
                        return;
                    }
                }
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };
    
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigate('/mentor/program-manager');
        }
    };

    const handleSkip = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            // On last step, Skip acts as "Save Draft" (skip publishing)
            handleSaveDraft();
        }
    };
    
    const isStep1Valid = 
        programDetails.title.trim() !== '' &&
        programDetails.description.trim() !== '' &&
        programDetails.contactEmail.trim() !== '' &&
        programDetails.programType !== '' &&
        programDetails.academy !== '' &&
        programDetails.location !== '' &&
        programDetails.attendancePercent >= 0 && programDetails.attendancePercent <= 100;

    const constructStep3Payload = () => ({
        notifications: step3Data.notifications,
        feedbackForms: {
            mentor: step3Data.mentorFeedbackForm,
            mentee: step3Data.menteeFeedbackForm
        },
        certificates: {
            mentor: step3Data.mentorCertificate,
            mentee: step3Data.menteeCertificate
        }
    });

    const handleSaveDraft = () => {
        const programData = {
            id: location.state?.programToEdit?.id || `prog_draft_${Date.now()}`,
            ...programDetails,
            objective: programDetails.learningObjectives, // Map back to objective
            mentorCriteriaList: programDetails.programType === 'Open' ? mentorCriteriaList : [],
            menteeCriteriaList: programDetails.programType === 'Open' ? menteeCriteriaList : [],
            closedProgramData: programDetails.programType === 'Closed' ? closedProgramData : null,
            ...constructStep3Payload(),
            status: 'Draft',
            attendanceRequiredPercent: programDetails.attendancePercent,
            lastEdited: new Date().toISOString()
        };
        navigate('/mentor/program-manager', { state: { newProgram: programData, successMessage: `Draft "${programData.title}" saved successfully!`, showDrafts: true }, replace: true });
    };

    const handlePublish = () => {
        const { programStart, programEnd, mentorAppStart, mentorAppEnd, menteeAppStart, menteeAppEnd } = scheduleDetails;
        if (!programStart || !programEnd || !mentorAppStart || !mentorAppEnd || !menteeAppStart || !menteeAppEnd) {
             alert('Please fill in all program and application dates.');
             return;
        }

        const programData = {
            id: location.state?.programToEdit?.id?.startsWith('prog_draft_') ? location.state.programToEdit.id.replace('draft', 'live') : `prog_live_${Date.now()}`,
            ...programDetails,
            objective: programDetails.learningObjectives,
            mentorCriteriaList: programDetails.programType === 'Open' ? mentorCriteriaList : [],
            menteeCriteriaList: programDetails.programType === 'Open' ? menteeCriteriaList : [],
            closedProgramData: programDetails.programType === 'Closed' ? closedProgramData : null,
            ...constructStep3Payload(),
            attendanceRequiredPercent: programDetails.attendancePercent,
            startDate: programStart,
            endDate: programEnd,
            mentorApplicationStartDate: mentorAppStart,
            mentorApplicationEndDate: mentorAppEnd,
            menteeEnrollmentStartDate: menteeAppStart,
            menteeEnrollmentEndDate: menteeAppEnd,
            sessionOutline: programDetails.sessionOutline.map((session, index) => {
                const schedule = scheduleDetails.sessionSchedules[index];
                if (schedule && schedule.date && schedule.startTime && schedule.endTime) {
                    return {
                        ...session,
                        startTime: new Date(`${schedule.date}T${schedule.startTime}`).toISOString(),
                        endTime: new Date(`${schedule.date}T${schedule.endTime}`).toISOString(),
                    };
                }
                return session;
            }),
            status: 'Yet to start',
            lastEdited: new Date().toISOString()
        };
        navigate('/mentor/program-manager', { state: { newProgram: programData, successMessage: `Program "${programData.title}" published successfully!` }, replace: true });
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Program Manager', path: '/mentor/program-manager' },
        { label: 'Create Program', path: '/mentor/program-manager/create' },
    ];


    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    <h1 className="text-2xl font-bold text-center mb-8">Create a Mentoring Program</h1>
                    <Stepper currentStep={currentStep} />
                    
                    <div className="mt-12">
                        {/* Step 1 Content */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-4">Program Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Program Title <span className="text-red-500">*</span></label>
                                            <input type="text" name="title" id="title" value={programDetails.title} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" required/>
                                        </div>
                                        <div>
                                            <label htmlFor="learningObjectives" className="block text-sm font-medium text-gray-700">Learning Objectives</label>
                                            <textarea name="learningObjectives" id="learningObjectives" rows={3} value={programDetails.learningObjectives} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"></textarea>
                                        </div>
                                         <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Program Description <span className="text-red-500">*</span></label>
                                            <textarea name="description" id="description" rows={4} value={programDetails.description} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" required></textarea>
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-gray-700">Skills covered</label>
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                placeholder="Type a skill and press Enter"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {programDetails.skills.map((skill, index) => (
                                                    <span key={index} className="flex items-center bg-r-blue-100 text-r-blue-dark text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                        {skill}
                                                        <button onClick={() => removeSkill(skill)} className="ml-1.5 text-r-blue-dark hover:text-r-blue">
                                                            <XIcon className="w-3 h-3"/>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="col-span-1 md:col-span-2">
                                        <h3 className="font-semibold mb-2">Program Type <span className="text-red-500">*</span></h3>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center"><input type="radio" name="programType" value="Open" checked={programDetails.programType === 'Open'} onChange={handleDetailsChange} className="mr-2"/> Open Program</label>
                                            <label className="flex items-center"><input type="radio" name="programType" value="Closed" checked={programDetails.programType === 'Closed'} onChange={handleDetailsChange} className="mr-2"/> Closed Program</label>
                                        </div>
                                    </div>
                                    {programDetails.programType === 'Open' && (
                                        <div className="col-span-1 md:col-span-2">
                                            <NumberSpinner 
                                                label="Max Mentees per Mentor" 
                                                value={programDetails.menteesPerMentor} 
                                                onValueChange={(val) => setProgramDetails(prev => ({...prev, menteesPerMentor: val}))}
                                                required
                                            />
                                        </div>
                                    )}
                                     <div>
                                        <h3 className="font-semibold mb-2">Mentoring type <span className="text-red-500">*</span></h3>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center"><input type="radio" name="mentoringType" value="Group" checked={programDetails.mentoringType === 'Group'} onChange={handleDetailsChange} className="mr-2"/> Group</label>
                                            <label className="flex items-center"><input type="radio" name="mentoringType" value="One-on-One" checked={programDetails.mentoringType === 'One-on-One'} onChange={handleDetailsChange} className="mr-2"/> One-on-One</label>
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-1 md:col-span-2">
                                        <SearchableDropdown
                                            label="Academy"
                                            options={ACADEMY_OPTIONS}
                                            selected={programDetails.academy}
                                            onSelect={(val) => setProgramDetails(prev => ({ ...prev, academy: val }))}
                                            placeholder="Select Academy..."
                                            required
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <SearchableDropdown
                                            label="Location"
                                            options={LOCATION_OPTIONS}
                                            selected={programDetails.location}
                                            onSelect={(val) => setProgramDetails(prev => ({ ...prev, location: val }))}
                                            placeholder="Select Location..."
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Add Video Section */}
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-4">Program Videos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input 
                                            type="text" 
                                            placeholder="Video Title *" 
                                            value={newVideoTitle} 
                                            onChange={(e) => setNewVideoTitle(e.target.value)} 
                                            className="border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Video Link *" 
                                                value={newVideoLink} 
                                                onChange={(e) => setNewVideoLink(e.target.value)} 
                                                className="border border-gray-300 rounded-md p-2 text-sm flex-grow bg-white text-gray-900"
                                            />
                                            <button type="button" onClick={addVideo} className="px-3 py-2 bg-r-blue text-white rounded-md hover:bg-r-blue-dark text-sm font-medium">Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {programDetails.videos.map((video, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                                <div className="overflow-hidden">
                                                    <p className="font-medium text-sm truncate">{video.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{video.link}</p>
                                                </div>
                                                <button type="button" onClick={() => removeVideo(index)} className="text-red-500 hover:text-red-700"><Trash2Icon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* About Program Documents Section */}
                                <div className="p-4 border rounded-md">
                                     <h3 className="font-semibold mb-4">About Program Documents</h3>
                                     <p className="text-xs text-gray-500 mb-4">Upload brochures, information sheets, or any documents that describe the program.</p>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input 
                                            type="text" 
                                            placeholder="Document Title *" 
                                            value={newAboutDocTitle} 
                                            onChange={(e) => setNewAboutDocTitle(e.target.value)} 
                                            className="border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="file" 
                                                ref={aboutFileInputRef}
                                                onChange={(e) => setNewAboutDocFile(e.target.files ? e.target.files[0] : null)} 
                                                className="border border-gray-300 rounded-md p-1 text-sm flex-grow bg-white text-gray-900"
                                            />
                                            <button type="button" onClick={addAboutDocument} className="px-3 py-2 bg-r-blue text-white rounded-md hover:bg-r-blue-dark text-sm font-medium">Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {programDetails.aboutProgramDocs.map((doc, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileTextIcon className="w-4 h-4 text-purple-600"/>
                                                    <div>
                                                        <p className="font-medium text-sm truncate">{doc.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{doc.file.name}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeAboutDocument(index)} className="text-red-500 hover:text-red-700"><Trash2Icon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reference Documents Section */}
                                <div className="p-4 border rounded-md">
                                     <h3 className="font-semibold mb-4">Reference Documents</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input 
                                            type="text" 
                                            placeholder="Document Title *" 
                                            value={newDocTitle} 
                                            onChange={(e) => setNewDocTitle(e.target.value)} 
                                            className="border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)} 
                                                className="border border-gray-300 rounded-md p-1 text-sm flex-grow bg-white text-gray-900"
                                            />
                                            <button type="button" onClick={addDocument} className="px-3 py-2 bg-r-blue text-white rounded-md hover:bg-r-blue-dark text-sm font-medium">Add</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {programDetails.referenceDocs.map((doc, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileTextIcon className="w-4 h-4 text-r-blue"/>
                                                    <div>
                                                        <p className="font-medium text-sm truncate">{doc.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{doc.file.name}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeDocument(index)} className="text-red-500 hover:text-red-700"><Trash2Icon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-2">Program Session Outline</h3>
                                    <div className="space-y-4">
                                        {programDetails.sessionOutline.map((item, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                                                <span className="font-bold pt-2">{index + 1}.</span>
                                                <div className="flex-grow space-y-2">
                                                    <input type="text" placeholder="Session Title" value={item.title} onChange={(e) => handleSessionOutlineChange(index, 'title', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"/>
                                                    <textarea placeholder="Session Details" value={item.details} onChange={(e) => handleSessionOutlineChange(index, 'details', e.target.value)} rows={2} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"></textarea>
                                                </div>
                                                <button type="button" onClick={() => removeSessionOutline(index)} disabled={programDetails.sessionOutline.length <= 1} className="p-2 mt-2 text-red-500 disabled:text-gray-300"><Trash2Icon className="w-5 h-5"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addSessionOutline} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50"><PlusIcon className="w-4 h-4"/> Add Session</button>
                                </div>

                                 <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-4">Program Settings</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Person Email ID <span className="text-red-500">*</span></label>
                                            <input type="email" name="contactEmail" id="contactEmail" value={programDetails.contactEmail} onChange={handleDetailsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900" required/>
                                        </div>
                                        <div>
                                            <label htmlFor="attendancePercent" className="block text-sm font-medium text-gray-700">Required Attendance Percentage <span className="text-red-500">*</span></label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    name="attendancePercent" 
                                                    id="attendancePercent" 
                                                    min="0" 
                                                    max="100"
                                                    value={programDetails.attendancePercent} 
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val) && val >= 0 && val <= 100) {
                                                            setProgramDetails(prev => ({...prev, attendancePercent: val}));
                                                        } else if (e.target.value === '') {
                                                            setProgramDetails(prev => ({...prev, attendancePercent: 0})); 
                                                        }
                                                    }} 
                                                    className="w-20 border border-gray-300 rounded-md p-2 text-sm text-center bg-white text-gray-900"
                                                />
                                                <span className="text-gray-500">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-700">Shareability</h4>
                                            <div className="flex items-center mt-1">
                                                <input type="checkbox" name="isShareable" id="isShareable" checked={programDetails.isShareable} onChange={handleCheckboxChange} className="h-4 w-4 text-r-blue focus:ring-r-blue border-gray-300 rounded" />
                                                <label htmlFor="isShareable" className="ml-2 block text-sm text-gray-900">Allow this program to be shared</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {currentStep === 2 && (
                             <div className="space-y-6">
                                 {programDetails.programType === 'Open' ? (
                                     <>
                                        <CriteriaBuilder 
                                            title="Mentor Criteria" 
                                            criteriaList={mentorCriteriaList} 
                                            setCriteriaList={setMentorCriteriaList} 
                                            required 
                                        />
                                        <CriteriaBuilder 
                                            title="Mentee Criteria" 
                                            criteriaList={menteeCriteriaList} 
                                            setCriteriaList={setMenteeCriteriaList} 
                                            required 
                                        />
                                     </>
                                 ) : (
                                    // Closed Program - Single Mapping Upload
                                    <div className="p-6 border rounded-md bg-white shadow-sm">
                                        <h3 className="font-semibold mb-4 text-r-gray-800">Upload Mentor-Mentee Mapping</h3>
                                        <div className="space-y-4">
                                            <button onClick={handleDownloadSample} className="flex items-center gap-2 text-sm font-medium text-r-blue hover:text-r-blue-dark">
                                                <DownloadIcon className="w-4 h-4"/> Download Sample CSV
                                            </button>
                                            <div className="flex gap-3 items-center">
                                                <input 
                                                    type="file" 
                                                    accept=".csv, .xlsx" 
                                                    onChange={(e) => handleClosedFileChange(e.target.files ? e.target.files[0] : null)} 
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-r-blue-50 file:text-r-blue hover:file:bg-r-blue-100 border border-gray-300 rounded-md"
                                                />
                                                <button 
                                                    onClick={handleUpload} 
                                                    disabled={!closedProgramData.mappingFile || closedProgramData.isMappingUploaded}
                                                    className="px-4 py-2 bg-r-blue text-white text-sm font-medium rounded-md hover:bg-r-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                            {closedProgramData.isMappingUploaded && (
                                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <span className="flex items-center gap-2 text-sm text-green-700 font-medium">
                                                        <CheckCircleIcon className="w-5 h-5"/> Mentor-Mentee Mapping Uploaded Successfully
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                 )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                {/* Notifications */}
                                <div className="p-6 border rounded-md bg-white shadow-sm">
                                    <h3 className="font-semibold mb-4 text-r-gray-800">Notifications</h3>
                                    <div className="flex gap-4 mb-4">
                                        <select 
                                            value={selectedNotification} 
                                            onChange={(e) => setSelectedNotification(e.target.value)}
                                            className="flex-grow border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                        >
                                            <option value="">Select Notification Template</option>
                                            {NOTIFICATION_TEMPLATES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={addNotification} 
                                            disabled={!selectedNotification}
                                            className="px-4 py-2 bg-r-blue text-white text-sm font-medium rounded-md hover:bg-r-blue-dark disabled:bg-gray-300"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {step3Data.notifications.map((notif, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                                <span className="text-sm text-gray-700">{notif}</span>
                                                <button onClick={() => removeNotification(notif)} className="text-red-500 hover:text-red-700">
                                                    <Trash2Icon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        ))}
                                        {step3Data.notifications.length === 0 && <p className="text-sm text-gray-500 italic">No notifications added.</p>}
                                    </div>
                                </div>

                                {/* Feedback Forms */}
                                <div className="p-6 border rounded-md bg-white shadow-sm">
                                    <h3 className="font-semibold mb-4 text-r-gray-800">Feedback Forms</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Completion Feedback</label>
                                            <select 
                                                value={step3Data.mentorFeedbackForm}
                                                onChange={(e) => setStep3Data({...step3Data, mentorFeedbackForm: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                            >
                                                <option value="">Select Form</option>
                                                {FEEDBACK_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mentee Completion Feedback</label>
                                            <select 
                                                value={step3Data.menteeFeedbackForm}
                                                onChange={(e) => setStep3Data({...step3Data, menteeFeedbackForm: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                            >
                                                <option value="">Select Form</option>
                                                {FEEDBACK_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Certificates */}
                                <div className="p-6 border rounded-md bg-white shadow-sm">
                                    <h3 className="font-semibold mb-4 text-r-gray-800">Certificates</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Completion Certificate</label>
                                            <select 
                                                value={step3Data.mentorCertificate}
                                                onChange={(e) => setStep3Data({...step3Data, mentorCertificate: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                            >
                                                <option value="">Select Certificate</option>
                                                {CERTIFICATE_TEMPLATES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mentee Completion Certificate</label>
                                            <select 
                                                value={step3Data.menteeCertificate}
                                                onChange={(e) => setStep3Data({...step3Data, menteeCertificate: e.target.value})}
                                                className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-900"
                                            >
                                                <option value="">Select Certificate</option>
                                                {CERTIFICATE_TEMPLATES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="p-4 border rounded-md space-y-6">
                                    <div>
                                        <h3 className="font-medium text-gray-800">Program Dates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div><label className="text-sm text-gray-600">Launch Date <span className="text-red-500">*</span></label><input type="date" name="programStart" value={scheduleDetails.programStart} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                            <div><label className="text-sm text-gray-600">End Date <span className="text-red-500">*</span></label><input type="date" name="programEnd" value={scheduleDetails.programEnd} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Mentor Application Dates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div><label className="text-sm text-gray-600">Start Date <span className="text-red-500">*</span></label><input type="date" name="mentorAppStart" value={scheduleDetails.mentorAppStart} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                            <div><label className="text-sm text-gray-600">End Date <span className="text-red-500">*</span></label><input type="date" name="mentorAppEnd" value={scheduleDetails.mentorAppEnd} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Mentee Application Dates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div><label className="text-sm text-gray-600">Start Date <span className="text-red-500">*</span></label><input type="date" name="menteeAppStart" value={scheduleDetails.menteeAppStart} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                            <div><label className="text-sm text-gray-600">End Date <span className="text-red-500">*</span></label><input type="date" name="menteeAppEnd" value={scheduleDetails.menteeAppEnd} onChange={handleScheduleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-semibold mb-4">Schedule Session Dates</h3>
                                    <div className="space-y-4">
                                        {programDetails.sessionOutline.map((session, index) => (
                                            <div key={index} className="p-3 border rounded-md bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                <div className="md:col-span-1">
                                                    <p className="font-semibold text-sm truncate">{session.title || `Session ${index + 1}`}</p>
                                                    <p className="text-xs text-gray-500 truncate">{session.details}</p>
                                                </div>
                                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <div><label className="text-xs text-gray-500">Date</label><input type="date" value={scheduleDetails.sessionSchedules[index]?.date || ''} onChange={e => handleSessionScheduleChange(index, 'date', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 bg-white text-gray-900"/></div>
                                                    <div><label className="text-xs text-gray-500">Start Time</label><input type="time" value={scheduleDetails.sessionSchedules[index]?.startTime || ''} onChange={e => handleSessionScheduleChange(index, 'startTime', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 bg-white text-gray-900"/></div>
                                                    <div><label className="text-xs text-gray-500">End Time</label><input type="time" value={scheduleDetails.sessionSchedules[index]?.endTime || ''} onChange={e => handleSessionScheduleChange(index, 'endTime', e.target.value)} className="mt-1 block w-full text-sm border-gray-300 rounded-md p-1 bg-white text-gray-900"/></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="mt-12 flex justify-between items-center">
                        <button 
                            onClick={handlePrev} 
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Prev
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <button onClick={handleSaveDraft} className="px-6 py-2 text-sm font-medium text-r-blue hover:underline">Save Draft</button>
                            
                            <button 
                                onClick={handleSkip} 
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Skip
                            </button>

                            {currentStep < 4 ? (
                                <button onClick={nextStep} disabled={currentStep === 1 && !isStep1Valid} className="px-6 py-2 text-sm font-medium text-white bg-r-blue rounded-md hover:bg-r-blue-dark disabled:bg-gray-400">Next</button>
                            ) : (
                                <button onClick={handlePublish} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Publish Program</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProgramPage;
