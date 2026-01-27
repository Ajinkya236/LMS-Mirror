
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ShareIcon, BookmarkIcon } from '../components/Icons';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

const mockCourseData = {
    id: 'course-123',
    title: 'Tapping into the Future and Demystifying Gen Z',
    description: 'Young people are being introduced to products and services on social media platforms, so you need to expand your brand’s marketing to those digital spaces. In this course, leading social media strategist helps you sort through platforms like TikTok, Instagram, Twitch, and Clubhouse to help you build a social media strategy to best promote your product.',
    progress: 0,
    skills: ['Repair', 'Documentation'],
    modules: [
        {
            title: 'Tapping into the Future and Demystifying Gen Z',
            items: [
                { id: 'v1', title: 'Tapping into the Future and Demystifying Gen Z', type: 'Video', status: 'In Progress', duration: '10:00' },
                { id: 'a1', title: 'Tapping into the Future and Demystifying Gen Z', type: 'Assessment', status: 'Not Started' },
                { id: 'v2', title: 'Using popular catchphrases and buzzwords', type: 'Video', status: 'Not Started', duration: '5:30' },
                { id: 'v3', title: 'Tapping into viral moments', type: 'Video', status: 'Not Started', duration: '8:45' },
                { id: 'v4', title: 'Measuring your success', type: 'Video', status: 'Not Started', duration: '12:15' }
            ]
        }
    ],
    relatedCourses: [
        { id: 'rel1', title: 'Operating Systems and You: Becoming a Power User', provider: 'LinkedIn Learning', duration: '40m', image: 'https://picsum.photos/seed/os/300/200' },
        { id: 'rel2', title: 'Clean Data in SQL using MySQL Workbench', provider: 'LinkedIn Learning', duration: '40m', image: 'https://picsum.photos/seed/sql/300/200' }
    ]
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    
    // In a real app, fetch course data by ID
    const course = mockCourseData; 

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', path: '/' },
        { label: 'My Learning', path: '#' },
        { label: course.title, path: '#' },
    ];

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-heading font-bold text-gray-900 truncate max-w-2xl">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Progress Tracker Removed */}
                    </div>
                </div>
            </div>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Course Contents (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Course Contents</h3>
                            </div>
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {course.modules.map((module, idx) => (
                                    <div key={idx}>
                                        {/* Module Header (if multiple modules, visually distinguish) */}
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Module {idx + 1}
                                        </div>
                                        
                                        {/* Module Items */}
                                        <div>
                                            {module.items.map((item, itemIdx) => (
                                                <div 
                                                    key={item.id} 
                                                    className={`p-4 border-b border-gray-100 flex gap-3 hover:bg-gray-50 cursor-pointer ${item.status === 'In Progress' ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <div className="mt-1">
                                                        {item.status === 'Completed' ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.status === 'In Progress' ? 'border-r-blue' : 'border-gray-300'}`}>
                                                                {item.status === 'In Progress' && <div className="w-2.5 h-2.5 bg-r-blue rounded-full"></div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold uppercase mb-0.5 ${item.status === 'In Progress' ? 'text-r-blue' : 'text-gray-500'}`}>
                                                            {item.type} {item.status === 'In Progress' && <span className="bg-r-blue text-white px-1.5 py-0.5 rounded ml-2 text-[9px]">ON GOING</span>}
                                                            {item.status === 'Not Started' && <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-2 text-[9px]">NOT STARTED</span>}
                                                        </p>
                                                        <p className={`text-sm font-medium ${item.status === 'In Progress' ? 'text-r-blue-dark' : 'text-gray-800'}`}>
                                                            {item.title}
                                                        </p>
                                                        {item.duration && <p className="text-xs text-gray-500 mt-1">{item.duration}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Video Player & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Player Container */}
                        <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Video Placeholder" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer border-2 border-white">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                            </div>
                            
                            {/* Player Controls Mock */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                                <div className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress">
                                    <div className="h-full bg-r-blue w-1/3 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <button className="hover:text-r-blue">❚❚</button>
                                        <button className="hover:text-r-blue">⏭</button>
                                        <div className="flex items-center gap-2">
                                            <span>🔊</span>
                                            <span className="text-xs">0:00 / 10:00</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-sm bg-white/10 px-2 py-0.5 rounded hover:bg-white/20">CC</button>
                                        <button>⚙️</button>
                                        <button>⛶</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Tapping into the Future and Demystifying Gen Z</h2>
                            
                            {/* Skills */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Skills Covered</h3>
                                <div className="flex gap-2">
                                    {course.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">{skill}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600 text-sm leading-relaxed border-t pt-4">
                                <p>{course.description}</p>
                            </div>
                        </div>

                        {/* Related Courses */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Related Courses</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {course.relatedCourses.map(rel => (
                                    <div key={rel.id} className="bg-white p-3 rounded-lg border flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="relative w-32 h-20 flex-shrink-0">
                                            <img src={rel.image} className="w-full h-full object-cover rounded" alt={rel.title} />
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{rel.duration}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">{rel.provider}</p>
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mt-1">{rel.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CoursePlayerPage;
