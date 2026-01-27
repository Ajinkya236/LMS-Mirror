
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import SendRequestModal from '../components/SendRequestModal';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons';
import type { Mentor } from '../types';
import MentorCard from '../components/MentorCard';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

const allMentors: { [topicId: string]: Mentor[] } = {
  leadership: [
    { 
        id: 1, 
        name: 'Priya Sharma', 
        title: 'Director of Engineering', 
        imageUrl: 'https://picsum.photos/seed/mentor1/200/200', 
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
        imageUrl: 'https://picsum.photos/seed/mentor2/200/200', 
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
        imageUrl: 'https://picsum.photos/seed/mentor3/200/200', 
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
     { id: 4, name: 'Vikram Singh', title: 'Agile Coach', imageUrl: 'https://picsum.photos/seed/mentor4/200/200', isAvailable: true, expertise: ['Project Management', 'Agile'], mentoringMeaning: 'Empowering teams to deliver value effectively.', idealMentee: 'Someone open to new methodologies.', business: 'Reliance Retail', vertical: 'Agile COE', employeeCode: '5003456', email: 'vikram.singh@ril.com', grade: 'L6', location: 'Bangalore', experience: '9 Years', segment: 'Agile', function: 'Coaching' },
     { id: 5, name: 'Sameer Khan', title: 'Program Manager', imageUrl: 'https://picsum.photos/seed/mentor5/200/200', isAvailable: true, expertise: ['Project Management', 'Risk Management'], mentoringMeaning: 'Navigating complexity to achieve strategic goals.', idealMentee: 'A detail-oriented and proactive planner.', business: 'Jio Platforms', vertical: 'Program Mgmt', employeeCode: '5007890', email: 'sameer.khan@ril.com', grade: 'L5', location: 'Delhi', experience: '7 Years', segment: 'PMO', function: 'Program Management' },
  ],
  'communication': [
     { id: 6, name: 'Isha Verma', title: 'Corporate Trainer', imageUrl: 'https://picsum.photos/seed/mentor6/200/200', isAvailable: false, expertise: ['Communication'], mentoringMeaning: 'Helping others find their voice and communicate with impact.', idealMentee: 'An active listener and dedicated practitioner.', business: 'Reliance Foundation', vertical: 'Training', employeeCode: '5002345', email: 'isha.verma@ril.com', grade: 'L5', location: 'Mumbai', experience: '6 Years', segment: 'L&D', function: 'Training' },
  ],
  'career-growth': [
      { id: 7, name: 'Aditya Rao', title: 'HR Business Partner', imageUrl: 'https://picsum.photos/seed/mentor7/200/200', isAvailable: true, expertise: ['Career Growth'], mentoringMeaning: 'Partnering with individuals to build fulfilling careers.', idealMentee: 'Someone with a clear vision and drive.', business: 'Reliance Retail', vertical: 'HR', employeeCode: '5006789', email: 'aditya.rao@ril.com', grade: 'L6', location: 'Hyderabad', experience: '8 Years', segment: 'Retail HR', function: 'HR' },
      { id: 8, name: 'Neha Reddy', title: 'Talent Development Head', imageUrl: 'https://picsum.photos/seed/mentor8/200/200', isAvailable: true, expertise: ['Career Growth'], mentoringMeaning: 'Creating pathways for professional development.', idealMentee: 'A lifelong learner.', business: 'Jio Platforms', vertical: 'Talent', employeeCode: '5001122', email: 'neha.reddy@ril.com', grade: 'L8', location: 'Mumbai', experience: '15 Years', segment: 'Corporate', function: 'Talent' },
  ]
};

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200";
    const activeClasses = "bg-r-blue-100 text-r-blue-dark";
    const inactiveClasses = "bg-white border border-r-gray-300 text-r-gray-700 hover:bg-r-gray-100";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>
}

const MentorListPage: React.FC = () => {
    const { topicId } = useParams<{topicId: string}>();
    const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const topicName = topicId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Selected Topic';
    const mentorsForTopic = topicId ? allMentors[topicId] || [] : [];
    
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentee Journey', path: '/mentor/mentee-journey' },
        { label: 'Discover', path: '/mentor/search' },
        { label: topicName, path: `/mentor/topic/${topicId}` },
    ];

    const filteredMentors = useMemo(() => {
        let mentors = mentorsForTopic;
        if (filter !== 'all') {
            const isAvailable = filter === 'available';
            mentors = mentors.filter(mentor => mentor.isAvailable === isAvailable);
        }
        if (searchQuery.trim() !== '') {
            mentors = mentors.filter(mentor => mentor.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return mentors;
    }, [filter, mentorsForTopic, searchQuery]);

    const handleSendRequestClick = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = () => {
        console.log(`Request sent to ${selectedMentor?.name}`);
        setIsRequestModalOpen(false);
        setSelectedMentor(null);
        navigate('/mentor/mentee-journey', { state: { successMessage: `Request sent to ${selectedMentor?.name} successfully!` } });
    };

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                         <h2 className="text-xl font-heading font-bold text-r-gray-900 capitalize flex-shrink-0">Mentors for {topicName}</h2>
                         <div className="relative w-full md:w-1/3">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-r-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mentors by name..."
                                className="w-full pl-10 pr-4 py-2 border rounded-full bg-white text-r-gray-800 focus:outline-none focus:ring-2 focus:ring-r-blue"
                            />
                        </div>
                    </div>
                     <div className="flex items-center space-x-2 mb-6">
                         <FilterButton label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                         <FilterButton label="Available" isActive={filter === 'available'} onClick={() => setFilter('available')} />
                         <FilterButton label="Unavailable" isActive={filter === 'unavailable'} onClick={() => setFilter('unavailable')} />
                     </div>
                    
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredMentors.map(mentor => (
                            <MentorCard key={mentor.id} mentor={mentor} onSendRequest={handleSendRequestClick} />
                        ))}
                    </div>
                    {filteredMentors.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-r-gray-500">No mentors found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>
            {selectedMentor && (
                <SendRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    onSubmit={handleRequestSubmit}
                    mentor={selectedMentor}
                    topic={topicName} // Pass topic name to pre-select it in the modal
                />
            )}
        </div>
    );
};

export default MentorListPage;
