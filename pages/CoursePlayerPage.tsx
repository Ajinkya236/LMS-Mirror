import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '../components/Icons';
import { Bookmark, Share2, Clock, Check, X, ThumbsUp, MessageSquare } from 'lucide-react';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import SelectCollectionModal from '../components/SelectCollectionModal';
import { collectionsService } from '../services/collectionsService';

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
        { id: 'rel1', title: 'Operating Systems and You: Becoming a Power User', provider: 'LinkedIn Learning', duration: '40m', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=300&h=200&fit=crop&q=80' },
        { id: 'rel2', title: 'Clean Data in SQL using MySQL Workbench', provider: 'LinkedIn Learning', duration: '40m', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&q=80' }
    ]
};

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const course = mockCourseData;

    const [isSelectCollectionOpen, setIsSelectCollectionOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSaveToWatchLater = () => {
        const added = collectionsService.addToWatchLater(courseId || course.id);
        showToast(added ? 'Added to Watch Later' : 'Removed from Watch Later');
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast('Course link copied to clipboard!');
        } else {
            showToast('Ready to share course link');
        }
    };

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <div className="bg-white shadow-xs sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-base sm:text-lg font-heading font-bold text-gray-900 truncate max-w-2xl">{course.title}</h1>
                    </div>
                    
                    {/* Actions: Save to Collection, Watch Later, Share */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setIsSelectCollectionOpen(true)}
                            className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#002B7F] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save to Collection</span>
                        </button>

                        <button
                            onClick={handleSaveToWatchLater}
                            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            title="Save to Watch Later"
                        >
                            <Clock className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Course Contents (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden sticky top-24">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Course Contents</h3>
                            </div>
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {course.modules.map((module, idx) => (
                                    <div key={idx}>
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Module {idx + 1}
                                        </div>
                                        
                                        <div>
                                            {module.items.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className={`p-4 border-b border-gray-100 flex gap-3 hover:bg-gray-50 cursor-pointer ${item.status === 'In Progress' ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <div className="mt-1">
                                                        {item.status === 'Completed' ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.status === 'In Progress' ? 'border-[#002B7F]' : 'border-gray-300'}`}>
                                                                {item.status === 'In Progress' && <div className="w-2.5 h-2.5 bg-[#002B7F] rounded-full"></div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold uppercase mb-0.5 ${item.status === 'In Progress' ? 'text-[#002B7F]' : 'text-gray-500'}`}>
                                                            {item.type} {item.status === 'In Progress' && <span className="bg-[#002B7F] text-white px-1.5 py-0.5 rounded ml-2 text-[9px]">ON GOING</span>}
                                                            {item.status === 'Not Started' && <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-2 text-[9px]">NOT STARTED</span>}
                                                        </p>
                                                        <p className={`text-sm font-medium ${item.status === 'In Progress' ? 'text-[#002B7F]' : 'text-gray-800'}`}>
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
                            
                            {/* Player Controls */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                                <div className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress">
                                    <div className="h-full bg-[#0052cc] w-1/3 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <button className="hover:text-blue-400">❚❚</button>
                                        <button className="hover:text-blue-400">⏭</button>
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

                        {/* Title & Description & Quick Interactive Bar */}
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Internal • ID: 182</div>
                                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mt-1">
                                        {course.title}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4 text-sm font-semibold text-gray-600">
                                    <button 
                                        onClick={() => showToast('Liked this course')} 
                                        className="flex items-center gap-1.5 hover:text-[#002B7F]"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>Like</span>
                                    </button>
                                    <button 
                                        onClick={() => setIsSelectCollectionOpen(true)} 
                                        className="flex items-center gap-1.5 hover:text-[#002B7F]"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                        <span>Save</span>
                                    </button>
                                    <button 
                                        onClick={handleShare} 
                                        className="flex items-center gap-1.5 hover:text-[#002B7F]"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Skills */}
                            <div className="my-5">
                                <h3 className="text-xs font-bold text-gray-900 uppercase mb-2">Skills Covered</h3>
                                <div className="flex gap-2">
                                    {course.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-semibold text-gray-700">{skill}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600 text-sm leading-relaxed border-t pt-4">
                                <p>{course.description}</p>
                            </div>
                        </div>

                        {/* Related Courses */}
                        <div className="border-t pt-6">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Related Courses</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {course.relatedCourses.map(rel => (
                                    <div key={rel.id} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3 hover:shadow-md transition-all cursor-pointer">
                                        <div className="relative w-32 h-20 flex-shrink-0">
                                            <img src={rel.image} className="w-full h-full object-cover rounded-lg" alt={rel.title} />
                                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{rel.duration}</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 uppercase font-semibold">{rel.provider}</p>
                                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 mt-1">{rel.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Select Collection Modal */}
            <SelectCollectionModal
                isOpen={isSelectCollectionOpen}
                onClose={() => setIsSelectCollectionOpen(false)}
                course={{
                    id: courseId || course.id,
                    title: course.title,
                    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
                    provider: 'Internal'
                }}
                onToast={showToast}
            />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-fade-in-up">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoursePlayerPage;
