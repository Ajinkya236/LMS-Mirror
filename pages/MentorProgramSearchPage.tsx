
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons';
import type { MentorSearchItem } from '../types';
import SearchCard from '../components/SearchCard';
import AssignToTeamModal from '../components/AssignToTeamModal';
import ShareModal from '../components/ShareModal';
import ApplyAsMentorModal from '../components/ApplyAsMentorModal';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import FilterDropdown from '../components/FilterDropdown';

const mockPrograms: MentorSearchItem[] = [
    { id: 'tech-mentoring', title: 'Tech Mentoring Program', type: 'program', imageUrl: 'https://picsum.photos/seed/techprog/400/225', description: 'A structured program for aspiring tech leaders.', isAvailable: true, proficiencyLevel: 'Level 1 - Awareness', duration: '2 Hour(s)', creditHours: '2 Hour(s)', contactPerson: { name: 'Program Manager', email: 'learningoperations@ril.com'}, academy: 'HR Academy', location: 'Mumbai', assignedOn: '26-06-2025', learningObjectives: ['Objective 1', 'Objective 2'], skillsCovered: ['Mentoring', 'Leadership'], isShareable: true },
    { id: 'future-leaders', title: 'Future Leaders Program', type: 'program', imageUrl: 'https://picsum.photos/seed/future/400/225', description: 'Accelerated development for high-potential individuals.', isAvailable: false, proficiencyLevel: 'Level 3 - Expert', duration: '6 Month(s)', creditHours: '40 Hour(s)', contactPerson: { name: 'Program Lead', email: 'leaders@ril.com'}, academy: 'Leadership Academy', location: 'Bangalore', assignedOn: 'N/A', learningObjectives: ['Strategic Thinking', 'Change Management'], skillsCovered: ['Strategy', 'Communication'], isShareable: false },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `program-${i}`, title: `Growth Program ${i + 1}`, type: 'program' as const, imageUrl: `https://picsum.photos/seed/gprog${i}/400/225`, description: `Description for growth program ${i+1}.`, isAvailable: i % 2 === 0, academy: i % 3 === 0 ? 'HR Academy' : 'Tech Academy', location: i % 2 === 0 ? 'Mumbai' : 'Delhi', isShareable: true })),
];


const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200";
    const activeClasses = "bg-r-blue-100 text-r-blue-dark";
    const inactiveClasses = "bg-white border border-r-gray-300 text-r-gray-700 hover:bg-r-gray-100";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>
}

const locationOptions = ['Mumbai', 'Bangalore', 'Delhi', 'Remote'];
const ACADEMY_OPTIONS = ['HR Academy', 'Tech Academy', 'Leadership Academy', 'Sales Academy', 'Marketing Academy', 'Finance Academy', 'Operations Academy'];

const MentorProgramSearchPage: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const [selectedLocation, setSelectedLocation] = useState('All');
    const [selectedAcademy, setSelectedAcademy] = useState('All');

    const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isApplyMentorModalOpen, setIsApplyMentorModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<MentorSearchItem | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentor Journey', path: '/mentor/mentor-journey' },
        { label: 'Discover Programs', path: '/mentor/program-search' },
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

    const handleAction = (action: (item: MentorSearchItem) => void, item: MentorSearchItem) => {
        setSelectedProgram(item);
        action(item);
    };

    const searchedItems = useMemo(() => {
        let programs = mockPrograms;
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            programs = programs.filter(item => 
                item.title.toLowerCase().includes(lowercasedQuery) ||
                item.description.toLowerCase().includes(lowercasedQuery)
            );
        }
        if (filter !== 'all') {
            const isAvailable = filter === 'available';
            programs = programs.filter(item => item.isAvailable === isAvailable);
        }
        if (selectedLocation !== 'All') {
            programs = programs.filter(item => item.location === selectedLocation);
        }
        if (selectedAcademy !== 'All') {
            programs = programs.filter(item => item.academy === selectedAcademy);
        }
        return programs;
    }, [searchQuery, filter, selectedLocation, selectedAcademy]);


    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <h2 className="text-2xl font-heading font-bold text-r-gray-900 mb-6">Discover Mentoring Programs</h2>

                <div className="mb-8 relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-r-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for Programs..."
                        className="w-full text-lg pl-12 pr-4 py-3 border border-r-gray-300 rounded-full bg-white text-r-gray-800 placeholder-r-gray-500 focus:outline-none focus:ring-2 focus:ring-r-blue transition-all"
                    />
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center space-x-2">
                            <FilterButton label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                            <FilterButton label="Available" isActive={filter === 'available'} onClick={() => setFilter('available')} />
                            <FilterButton label="Unavailable" isActive={filter === 'unavailable'} onClick={() => setFilter('unavailable')} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <FilterDropdown label="Location" options={locationOptions} selectedValue={selectedLocation} onValueChange={setSelectedLocation} />
                            <FilterDropdown label="Academy" options={ACADEMY_OPTIONS} selectedValue={selectedAcademy} onValueChange={setSelectedAcademy} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchedItems.map(item => (
                            <SearchCard key={item.id} item={item} onAssignToMe={() => showToast(`Assigned "${item.title}" to you.`)} onAssignToTeam={() => handleAction(() => setIsAssignTeamModalOpen(true), item)} onApplyAsMentor={() => handleAction(() => setIsApplyMentorModalOpen(true), item)} onSave={() => showToast(`Saved "${item.title}".`)} onShare={() => handleAction(() => setIsShareModalOpen(true), item)} userRole="mentor" />
                        ))}
                    </div>
                    
                    {searchedItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-r-gray-500">No programs found matching your criteria.</p>
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
        </div>
    );
};

export default MentorProgramSearchPage;
