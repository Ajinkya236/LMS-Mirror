
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Course } from '../types';
import CourseCard from '../components/CourseCard';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import { ArrowLeftIcon } from '../components/Icons';

const CategoryDetailsPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get title and initial courses from state, or fallback
    const title = location.state?.title || categoryId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category';
    const initialCourses = location.state?.courses as Course[] || [];

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    // Helper to generate mock data if accessed directly via URL
    const generateMockCourses = (count: number, prefix: string): Course[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: `${prefix.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${i}`,
            title: `${prefix} Topic ${i + 1}: Advanced Concepts`,
            provider: i % 2 === 0 ? 'Internal' : 'Coursera',
            imageUrl: `https://picsum.photos/seed/${prefix}${i}/400/225`,
            tags: ['Online']
        }));
    };

    // Simulate loading endless data
    useEffect(() => {
        // If we passed courses, start with them, otherwise generate some mock ones based on category
        const base = initialCourses.length > 0 ? initialCourses : generateMockCourses(12, title);
        
        // Duplicate to simulate endless scroll list
        const hugeList = [...base, ...generateMockCourses(20, title), ...generateMockCourses(20, title)];
        setCourses(hugeList);
    }, [initialCourses, title]);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', path: '/' },
        { label: title, path: '#' },
    ];

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-100 text-r-gray-600">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-heading font-bold text-r-gray-900">{title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {courses.map((course, idx) => (
                        <CourseCard key={`${course.id}-${idx}`} course={course} />
                    ))}
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-r-gray-500">Loading more courses...</p>
                    </div>
                )}
                
                {!loading && courses.length > 0 && (
                    <div className="text-center py-12">
                        <button 
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    setCourses(prev => [...prev, ...generateMockCourses(12, title)]);
                                    setLoading(false);
                                }, 1000);
                            }}
                            className="px-6 py-2 text-sm font-medium text-r-blue border border-r-blue rounded-full hover:bg-r-blue-50 transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}

                {courses.length === 0 && (
                    <div className="text-center py-20 text-r-gray-500">
                        No courses found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryDetailsPage;
