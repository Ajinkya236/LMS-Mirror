
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons';
import type { MentorSearchItem, Mentor } from '../types';
import SearchCard from '../components/SearchCard';
import AssignToTeamModal from '../components/AssignToTeamModal';
import ShareModal from '../components/ShareModal';
import ApplyAsMentorModal from '../components/ApplyAsMentorModal';
import MentorCard from '../components/MentorCard';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import FilterDropdown from '../components/FilterDropdown';
import SendRequestModal from '../components/SendRequestModal';

const mockSearchItems: MentorSearchItem[] = [
    { id: 'leadership', title: 'Leadership', type: 'topic', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', description: 'Develop your leadership skills and guide teams effectively.' },
    { id: 'tech-mentoring', title: 'Tech Mentoring Program', type: 'program', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&q=80', description: 'A structured program for aspiring tech leaders.', isAvailable: true, proficiencyLevel: 'Level 1 - Awareness', duration: '2 Hour(s)', creditHours: '2 Hour(s)', contactPerson: { name: 'Program Manager', email: 'learningoperations@ril.com'}, academy: 'HR Academy', location: 'Mumbai', assignedOn: '26-06-2025', learningObjectives: ['Objective 1', 'Objective 2'], skillsCovered: ['Mentoring', 'Leadership'], isShareable: true },
    { id: 'project-management', title: 'Project Management', type: 'topic', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=225&fit=crop&q=80', description: 'Master the art of managing projects and delivering results.' },
    { id: 'communication', title: 'Communication Skills', type: 'topic', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop&q=80', description: 'Enhance your verbal and written communication abilities.' },
    { id: 'career-growth', title: 'Career Growth', type: 'topic', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', description: 'Navigate your career path and achieve your professional goals.' },
    { id: 'future-leaders', title: 'Future Leaders Program', type: 'program', imageUrl: 'https://images.unsplash.com/photo-1513258496099-48162023ac90?w=400&h=225&fit=crop&q=80', description: 'Accelerated development for high-potential individuals.', isAvailable: false, proficiencyLevel: 'Level 3 - Expert', duration: '6 Month(s)', creditHours: '40 Hour(s)', contactPerson: { name: 'Program Lead', email: 'leaders@ril.com'}, academy: 'Leadership Academy', location: 'Bangalore', assignedOn: 'N/A', learningObjectives: ['Strategic Thinking', 'Change Management'], skillsCovered: ['Strategy', 'Communication'], isShareable: false },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `program-${i}`, title: `Growth Program ${i + 1}`, type: 'program' as const, imageUrl: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=225&fit=crop&q=80`, description: `Description for growth program ${i+1}.`, isAvailable: i % 2 === 0, academy: i % 3 === 0 ? 'HR Academy' : 'Tech Academy', location: i % 2 === 0 ? 'Mumbai' : 'Delhi', isShareable: true })),
    { id: 'data-science', title: 'Data Science', type: 'topic', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', description: 'Unlock insights from data.' },
];

const allMentors: { [topicId: string]: Mentor[] } = {
  leadership: [
    { 
        id: 1, 
        name: 'Priya Sharma', 
        title: 'Director of Engineering', 
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80', 
        isAvailable: true, 
        expertise: ['Leadership', 'Team Building'], 
        mentoringMeaning: 'Guiding others to unlock their potential.', 
        idealMentee: 'Someone eager to learn and take initiative.', 
        business: 'Jio Platforms', 
        vertical: 'Cloud Engineering', 
        employeeCode: '5001234', 
        email: 'priya.sharma@ril.com', 
        grade: 'L8', 
        location: 'Navi Mumbai', 
        experience: '12 Years',
        segment: 'Engineering',
        function: 'Technology'
    },
    { 
        id: 2, 
        name: 'Rohan Mehta', 
        title: 'Senior Product Manager', 
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80', 
        isAvailable: false, 
        expertise: ['Leadership', 'Product Strategy'], 
        mentoringMeaning: 'Sharing experiences to accelerate growth.', 
        idealMentee: 'A curious and collaborative individual.', 
        business: 'Reliance Retail', 
        vertical: 'Product', 
        employeeCode: '5005678', 
        email: 'rohan.mehta@ril.com', 
        grade: 'L7', 
        location: 'Mumbai', 
        experience: '10 Years',
        segment: 'Retail Product',
        function: 'Product Management'
    },
    { 
        id: 3, 
        name: 'Anjali Desai', 
        title: 'Lead Architect', 
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&q=80', 
        isAvailable: true, 
        expertise: ['Leadership', 'Technical Leadership'], 
        mentoringMeaning: 'Building the next generation of technical leaders.', 
        idealMentee: 'A passionate problem-solver.', 
        business: 'Jio Platforms', 
        vertical: 'Architecture', 
        employeeCode: '5009012', 
        email: 'anjali.desai@ril.com', 
        grade: 'L6', 
        location: 'Bangalore', 
        experience: '8 Years',
        segment: 'Engineering',
        function: 'Technology'
    },
  ],
  'project-management': [
     { id: 4, name: 'Vikram Singh', title: 'Agile Coach', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&q=80', isAvailable: true, expertise: ['Project Management', 'Agile'], mentoringMeaning: 'Empowering teams to deliver value effectively.', idealMentee: 'Someone open to new methodologies.', business: 'Reliance Retail', vertical: 'Agile COE', employeeCode: '5003456', email: 'vikram.singh@ril.com', grade: 'L6', location: 'Bangalore', experience: '9 Years', segment: 'Agile', function: 'Coaching' },
     { id: 5, name: 'Sameer Khan', title: 'Program Manager', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80', isAvailable: true, expertise: ['Project Management', 'Risk Management'], mentoringMeaning: 'Navigating complexity to achieve strategic goals.', idealMentee: 'A detail-oriented and proactive planner.', business: 'Jio Platforms', vertical: 'Program Mgmt', employeeCode: '5007890', email: 'sameer.khan@ril.com', grade: 'L5', location: 'Delhi', experience: '7 Years', segment: 'PMO', function: 'Program Management' },
  ],
  'communication': [
     { id: 6, name: 'Isha Verma', title: 'Corporate Trainer', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80', isAvailable: false, expertise: ['Communication'], mentoringMeaning: 'Helping others find their voice and communicate with impact.', idealMentee: 'An active listener and dedicated practitioner.', business: 'Reliance Foundation', vertical: 'Training', employeeCode: '5002345', email: 'isha.verma@ril.com', grade: 'L5', location: 'Mumbai', experience: '6 Years', segment: 'L&D', function: 'Training' },
  ],
  'career-growth': [
      { id: 7, name: 'Aditya Rao', title: 'HR Business Partner', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80', isAvailable: true, expertise: ['Career Growth'], mentoringMeaning: 'Partnering with individuals to build fulfilling careers.', idealMentee: 'Someone with a clear vision and drive.', business: 'Reliance Retail', vertical: 'HR', employeeCode: '5006789', email: 'aditya.rao@ril.com', grade: 'L6', location: 'Hyderabad', experience: '8 Years', segment: 'Retail HR', function: 'HR' },
      { id: 8, name: 'Neha Reddy', title: 'Talent Development Head', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80', isAvailable: true, expertise: ['Career Growth'], mentoringMeaning: 'Creating pathways for professional development.', idealMentee: 'A lifelong learner.', business: 'Jio Platforms', vertical: 'Talent', employeeCode: '5001122', email: 'neha.reddy@ril.com', grade: 'L8', location: 'Mumbai', experience: '15 Years', segment: 'Corporate', function: 'Talent' },
  ]
};


const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200";
    const activeClasses = "bg-r-blue text-white";
    const inactiveClasses = "bg-white border border-r-gray-300 text-r-gray-700 hover:bg-r-gray-100";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>
}

const SubFilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200";
    const activeClasses = "bg-r-blue-100 text-r-blue-dark";
    const inactiveClasses = "bg-white border border-r-gray-300 text-r-gray-700 hover:bg-r-gray-100";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>
}

// Removed academyOptions
const locationOptions = ['Mumbai', 'Bangalore', 'Delhi', 'Remote'];

const MentorSearchPage: React.FC = () => {
    const location = useLocation();
    const [filter, setFilter] = useState<'program' | 'topic' | 'mentors'>(location.state?.initialFilter || 'program');
    const [programStatusFilter, setProgramStatusFilter] = useState<'available' | 'unavailable'>('available');
    const [mentorAvailabilityFilter, setMentorAvailabilityFilter] = useState<'available' | 'unavailable'>('available');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const [selectedLocation, setSelectedLocation] = useState('All');

    const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApplyMentorModalOpen, setIsApplyMentorModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<MentorSearchItem | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    // New state for Mentor Request Modal
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    
    const flatMentors = useMemo(() => Object.values(allMentors).flat().filter(
        (mentor, index, self) => index === self.findIndex((m) => m.id === mentor.id)
    ), []);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentee Journey', path: '/mentor/mentee-journey' },
        { label: 'Discover', path: '/mentor/search' }
    ];

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const showToast = (message: string) => {
        setToastMessage(message);
    };

    const handleAction = (action: (item: MentorSearchItem) => void, item: MentorSearchItem) => {
        setSelectedProgram(item);
        action(item);
    };

    // Modified to open modal instead of navigate
    const handleSendRequestClick = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = () => {
        setIsRequestModalOpen(false);
        setSelectedMentor(null);
        navigate('/mentor/mentee-journey', { state: { successMessage: `Request sent to ${selectedMentor?.name} successfully!` } });
    };

    const filteredItems = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();

        if (filter === 'program') {
            let programs = mockSearchItems.filter(item => item.type === 'program' && (item.title.toLowerCase().includes(lowercasedQuery) || item.description.toLowerCase().includes(lowercasedQuery)));
            
            const isAvailable = programStatusFilter === 'available';
            programs = programs.filter(item => item.isAvailable === isAvailable);

            if (selectedLocation !== 'All') {
                programs = programs.filter(item => item.location === selectedLocation);
            }

            return programs;
        }
        if (filter === 'topic') {
            return mockSearchItems.filter(item => item.type === 'topic' && (item.title.toLowerCase().includes(lowercasedQuery) || item.description.toLowerCase().includes(lowercasedQuery)));
        }
        if (filter === 'mentors') {
            let mentors = flatMentors.filter(mentor => mentor.name.toLowerCase().includes(lowercasedQuery) || mentor.title.toLowerCase().includes(lowercasedQuery) || mentor.expertise.some(e => e.toLowerCase().includes(lowercasedQuery)));
            const isAvailable = mentorAvailabilityFilter === 'available';
            mentors = mentors.filter(mentor => mentor.isAvailable === isAvailable);
            return mentors;
        }
        return [];
    }, [filter, programStatusFilter, mentorAvailabilityFilter, searchQuery, flatMentors, selectedLocation]);

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                <h2 className="text-2xl font-heading font-bold text-r-gray-900 mb-6">Discover mentors and programs</h2>

                <div className="mb-8 relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-r-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for Topics, Programs, or Mentors..."
                        className="w-full text-lg pl-12 pr-4 py-3 border border-r-gray-300 rounded-full bg-white text-r-gray-800 placeholder-r-gray-500 focus:outline-none focus:ring-2 focus:ring-r-blue transition-all"
                    />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col items-start mb-6 gap-4">
                         <div className="flex items-center space-x-2">
                             <FilterButton label="Programs" isActive={filter === 'program'} onClick={() => setFilter('program')} />
                             <FilterButton label="Topics" isActive={filter === 'topic'} onClick={() => setFilter('topic')} />
                             <FilterButton label="Mentors" isActive={filter === 'mentors'} onClick={() => setFilter('mentors')} />
                         </div>
                    </div>
                    
                    {filter === 'program' && (
                        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <SubFilterButton label="Available" isActive={programStatusFilter === 'available'} onClick={() => setProgramStatusFilter('available')} />
                                <SubFilterButton label="Unavailable" isActive={programStatusFilter === 'unavailable'} onClick={() => setProgramStatusFilter('unavailable')} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FilterDropdown label="Location" options={locationOptions} selectedValue={selectedLocation} onValueChange={setSelectedLocation} />
                            </div>
                        </div>
                    )}

                    {filter === 'mentors' && (
                        <div className="mb-4 flex items-center space-x-2">
                            <SubFilterButton label="Available" isActive={mentorAvailabilityFilter === 'available'} onClick={() => setMentorAvailabilityFilter('available')} />
                            <SubFilterButton label="Unavailable" isActive={mentorAvailabilityFilter === 'unavailable'} onClick={() => setMentorAvailabilityFilter('unavailable')} />
                        </div>
                    )}

                    {filter === 'topic' ? (
                        <div className="flex flex-wrap gap-3">
                            {(filteredItems as MentorSearchItem[]).map(item => (
                                <Link to={`/mentor/topic/${item.id}`} key={item.id} className="px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 bg-r-blue-50 text-r-blue-dark hover:bg-r-blue-100">
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    ) : filter === 'program' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(filteredItems as MentorSearchItem[]).map(item => (
                                <SearchCard key={item.id} item={item} onAssignToMe={() => showToast(`Assigned "${item.title}" to you.`)} onAssignToTeam={() => handleAction(() => setIsAssignTeamModalOpen(true), item)} onApplyAsMentor={() => handleAction(() => setIsApplyMentorModalOpen(true), item)} onSave={() => showToast(`Saved "${item.title}".`)} onShare={() => handleAction(() => setIsShareModalOpen(true), item)} userRole="mentee" />
                            ))}
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {(filteredItems as Mentor[]).map(mentor => (
                                <MentorCard key={mentor.id} mentor={mentor} onSendRequest={handleSendRequestClick} />
                            ))}
                        </div>
                    )}
                    
                    {filteredItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-r-gray-500">No items found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
            {toastMessage && (
                 <div className="fixed bottom-5 right-5 bg-r-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50">
                    {toastMessage}
                </div>
            )}
            {selectedProgram && (
                <>
                    <AssignToTeamModal isOpen={isAssignTeamModalOpen} onClose={() => setIsAssignTeamModalOpen(false)} onSubmit={() => { setIsAssignTeamModalOpen(false); showToast('Assigned to team.'); }} program={selectedProgram}/>
                    <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onSubmit={() => { setIsShareModalOpen(false); showToast('Program shared.'); }} program={selectedProgram}/>
                    <ApplyAsMentorModal isOpen={isApplyMentorModalOpen} onClose={() => setIsApplyMentorModalOpen(false)} onSubmit={() => { setIsApplyMentorModalOpen(false); showToast('Application submitted.'); }} program={selectedProgram}/>
                </>
            )}
            {selectedMentor && (
                <SendRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    onSubmit={handleRequestSubmit}
                    mentor={selectedMentor}
                />
            )}
        </div>
    );
};

export default MentorSearchPage;
