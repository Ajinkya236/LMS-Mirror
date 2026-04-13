import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Course, ActiveMentorship, AssignedCourse } from '../types';
import CourseCard from '../components/CourseCard';
import AssignCourseModal from '../components/AssignCourseModal';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

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


const FilterDropdown: React.FC<{ label: string }> = ({ label }) => (
    <button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-r-blue">
        <span>{label}</span>
        <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    </button>
);


const AssignCoursesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // All hooks are called at the top level, unconditionally.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Effect to handle redirection if the required state is missing.
        // This runs after the component has rendered.
        if (!location.state) {
            navigate('/mentor/mentor-journey', { replace: true });
        }
    }, [location.state, navigate]);

    // Safely access state properties. They will be undefined on the initial render
    // if the state is missing, before the redirect happens.
    const mentee = location.state?.mentee as ActiveMentorship['participant'] | undefined;
    const engagementId = location.state?.engagementId as string | undefined;

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentor Journey', path: '/mentor/mentor-journey' },
        { label: 'Engagement', path: `/mentor/engagement/${engagementId}` },
        { label: 'Assign Courses', path: '/mentor/assign-courses' },
    ];

    const filteredCourses = useMemo(() => {
        if (!searchQuery) return discoverCourses;
        return discoverCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);


    const handleAssignClick = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleAssignSubmit = () => {
        if (selectedCourse && engagementId) {
            const assignedCourse: AssignedCourse = { ...selectedCourse, status: 'In Progress' };
            
            navigate(`/mentor/engagement/${engagementId}`, {
                replace: true,
                state: {
                    userRole: 'mentor',
                    newlyAssignedCourse: assignedCourse,
                },
            });
        }
    };

    // This structure avoids an early return. The component always renders the same structure,
    // with the main content being conditional. This is a more robust pattern against hook rule violations.
    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                {mentee && engagementId ? (
                    <>
                        <h1 className="text-2xl font-heading font-bold mb-2">Assign Course to {mentee.name}</h1>
                        <p className="text-r-gray-600 mb-6">Browse or search for courses to assign to your mentee.</p>
                        
                        <div className="mb-6 relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-r-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for courses to assign..."
                                className="w-full pl-12 pr-4 py-3 border border-r-gray-300 rounded-full bg-white text-r-gray-800 placeholder-r-gray-500 focus:outline-none focus:ring-2 focus:ring-r-blue transition-all"
                            />
                        </div>

                         <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredCourses.map(course => (
                                <CourseCard 
                                    key={course.id} 
                                    course={course}
                                    isAssignable={true}
                                    onAssign={handleAssignClick}
                                />
                            ))}
                        </div>

                        {filteredCourses.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-r-gray-500">No courses found matching your search.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-r-gray-500">Loading...</div>
                )}
            </div>
            {selectedCourse && mentee && (
                <AssignCourseModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAssignSubmit}
                    course={selectedCourse}
                    menteeName={mentee.name}
                />
            )}
        </div>
    );
};

export default AssignCoursesPage;