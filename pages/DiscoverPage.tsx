
import React, { useState } from 'react';
import type { Course } from '../types';
import CourseCard from '../components/CourseCard';
import AssignToContextModal from '../components/AssignToContextModal';

const discoverCourses: Course[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: [
        'Environmental, social, and governance concerns',
        'What is ESG?',
        'The demand for ESG',
        'Sustainable investing',
        'Benefits of a strong ESG program',
        'ESG risks',
        'Sustainable investing approaches',
        'The S of ESG',
        'ESG reporting frameworks',
        'Integrating ESG into corporate strategy',
        'The future of ESG',
        'ESG and shareholder value'
    ][i % 12],
    provider: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=225&fit=crop&q=80',
    tags: ['Video'],
}));

// Mock Data for active contexts
const activeMentees = [
    { id: 'active1', label: 'Sandeep Gupta', subLabel: 'Leadership' },
    { id: 'active2', label: 'Rahul Verma', subLabel: 'Product Management' },
    { id: 'completed2', label: 'Anika Singh', subLabel: 'Onboarding (Completed)' } // Typically wouldn't assign to completed, but for demo
];

const activePrograms = [
    { id: 'tech-mentoring', label: 'Tech Mentoring Program', subLabel: 'Group Mentoring' },
    { id: 'active_prog_1', label: 'Data Science for All', subLabel: 'One-on-One' },
];

const FilterDropdown: React.FC<{ label: string }> = ({ label }) => (
    <button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-r-blue">
        <span>{label}</span>
        <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    </button>
);


const DiscoverPage: React.FC = () => {
    const [isAssignMenteeModalOpen, setIsAssignMenteeModalOpen] = useState(false);
    const [isAssignProgramModalOpen, setIsAssignProgramModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAssignToMentee = (course: Course) => {
        setSelectedCourse(course);
        setIsAssignMenteeModalOpen(true);
    };

    const handleAssignToProgram = (course: Course) => {
        setSelectedCourse(course);
        setIsAssignProgramModalOpen(true);
    };

    const handleMenteeAssignmentSubmit = (selectedIds: string[]) => {
        console.log(`Assigning course ${selectedCourse?.title} to mentees:`, selectedIds);
        setIsAssignMenteeModalOpen(false);
        showToast(`Course successfully assigned to ${selectedIds.length} mentee(s).`);
    };

    const handleProgramAssignmentSubmit = (selectedIds: string[]) => {
        console.log(`Assigning course ${selectedCourse?.title} to programs:`, selectedIds);
        setIsAssignProgramModalOpen(false);
        showToast(`Course successfully assigned to ${selectedIds.length} program(s).`);
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button className="flex items-center space-x-2 text-sm font-semibold text-r-gray-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M3 10h18M3 16h18"></path></svg>
                        <span>Filter by Academies</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-r-gray-600">Sort by:</span>
                        <FilterDropdown label="Date Added: Newest First (+)" />
                        <div className="flex border border-r-gray-300 rounded-md">
                            <button className="p-2 border-r border-r-gray-300">
                                <svg className="w-5 h-5 text-r-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                             <button className="p-2 bg-r-blue text-white rounded-r-md">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V2z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <FilterDropdown label="Category" />
                    <FilterDropdown label="Language" />
                    <FilterDropdown label="Source" />
                    <FilterDropdown label="Topics" />
                    <FilterDropdown label="Skill" />
                    <FilterDropdown label="Duration" />
                    <FilterDropdown label="Proficiency Level" />
                    <button className="px-4 py-2 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50 justify-self-end col-span-full">Reset</button>
                </div>
            </div>

            {/* Results Section */}
            <div className="mt-8">
                <p className="text-sm text-r-gray-600 mb-4">Total search result: 360116</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {discoverCourses.map(course => (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            onAssignToMentee={handleAssignToMentee}
                            onAssignToProgram={handleAssignToProgram}
                        />
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AssignToContextModal
                isOpen={isAssignMenteeModalOpen}
                onClose={() => setIsAssignMenteeModalOpen(false)}
                onSubmit={handleMenteeAssignmentSubmit}
                title="Assign to Mentee"
                options={activeMentees}
                contextName="Mentee"
            />
            <AssignToContextModal
                isOpen={isAssignProgramModalOpen}
                onClose={() => setIsAssignProgramModalOpen(false)}
                onSubmit={handleProgramAssignmentSubmit}
                title="Assign to Program"
                options={activePrograms}
                contextName="Program"
            />

            {/* Toast */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-r-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default DiscoverPage;
