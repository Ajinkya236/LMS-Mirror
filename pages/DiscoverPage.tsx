import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import CourseCard from '../components/CourseCard';
import CollectionCard from '../components/CollectionCard';
import ShareCollectionModal from '../components/ShareCollectionModal';
import AssignToContextModal from '../components/AssignToContextModal';
import { collectionsService, LearningCollection } from '../services/collectionsService';
import { Search, ChevronDown, Layers, BookOpen, Share2, Play, ArrowLeft, ArrowUpDown, SlidersHorizontal, Plus, X } from 'lucide-react';

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
    tags: ['Video', 'Online'],
}));

// Mock Data for active contexts
const activeMentees = [
    { id: 'active1', label: 'Sandeep Gupta', subLabel: 'Leadership' },
    { id: 'active2', label: 'Rahul Verma', subLabel: 'Product Management' },
    { id: 'completed2', label: 'Anika Singh', subLabel: 'Onboarding (Completed)' }
];

const activePrograms = [
    { id: 'tech-mentoring', label: 'Tech Mentoring Program', subLabel: 'Group Mentoring' },
    { id: 'active_prog_1', label: 'Data Science for All', subLabel: 'One-on-One' },
];

const DiscoverPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [selectedSource, setSelectedSource] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');
    
    // Category dropdown toggle
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    
    // Modals
    const [isAssignMenteeModalOpen, setIsAssignMenteeModalOpen] = useState(false);
    const [isAssignProgramModalOpen, setIsAssignProgramModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Selected Public Collection Detail Modal or View
    const [selectedPublicCollection, setSelectedPublicCollection] = useState<LearningCollection | null>(null);
    const [shareModalCollection, setShareModalCollection] = useState<LearningCollection | null>(null);

    // Fetch Public Collections
    const allCollections = collectionsService.getCollections();
    const publicCollections = useMemo(() => {
        return allCollections.filter(c => c.isPublic !== false);
    }, [allCollections]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
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
        setIsAssignMenteeModalOpen(false);
        showToast(`Course successfully assigned to ${selectedIds.length} mentee(s).`);
    };

    const handleProgramAssignmentSubmit = (selectedIds: string[]) => {
        setIsAssignProgramModalOpen(false);
        showToast(`Course successfully assigned to ${selectedIds.length} program(s).`);
    };

    // Filtered Collections
    const filteredCollections = useMemo(() => {
        if (!searchQuery.trim()) return publicCollections;
        const q = searchQuery.toLowerCase();
        return publicCollections.filter(c => 
            c.title.toLowerCase().includes(q) || 
            c.description.toLowerCase().includes(q)
        );
    }, [publicCollections, searchQuery]);

    // Filtered Courses
    const filteredCourses = useMemo(() => {
        if (selectedCategory === 'Collections') return [];
        return discoverCourses.filter(course => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!course.title.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [selectedCategory, searchQuery]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Header & Search Bar */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-heading font-black text-gray-900 tracking-tight">
                            Discover Learning
                        </h1>
                        <p className="text-xs text-gray-500">
                            Explore thousands of online courses, videos, programs, and curated learning collections.
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={selectedCategory === 'Collections' ? 'Search public collections...' : 'Search courses, skills, topics...'}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-full text-xs sm:text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                    
                    {/* Category Filter Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className={`flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-left rounded-xl border transition-all ${
                                selectedCategory === 'Collections' 
                                    ? 'bg-[#002B7F] text-white border-[#002B7F]' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className="truncate">Category: {selectedCategory}</span>
                            <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0" />
                        </button>

                        {isCategoryDropdownOpen && (
                            <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-scale-up">
                                {[
                                    { id: 'All', label: 'All Categories' },
                                    { id: 'Collections', label: '📚 Collections / Playlists' },
                                    { id: 'Technical', label: 'Technical & Engineering' },
                                    { id: 'Leadership', label: 'Leadership & Strategy' },
                                    { id: 'Marketing', label: 'Marketing & Product' },
                                    { id: 'ESG', label: 'ESG & Sustainability' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setIsCategoryDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                            selectedCategory === cat.id ? 'bg-blue-50 text-[#0a47d0]' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        {selectedCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0a47d0]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span>Language</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span>Source</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span>Topics</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span>Skill</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-between">
                        <span>Duration</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => {
                            setSelectedCategory('All');
                            setSearchQuery('');
                            showToast('Filters reset');
                        }}
                        className="px-3.5 py-2 text-xs font-bold text-[#002B7F] border border-[#002B7F]/30 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* VIEW A: CATEGORY = COLLECTIONS (DISCOVER PUBLIC COLLECTIONS)        */}
            {/* ------------------------------------------------------------------- */}
            {selectedCategory === 'Collections' ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[#002B7F]" />
                            <h2 className="text-lg font-bold text-gray-900">
                                Public Learning Collections ({filteredCollections.length})
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate('/my-learning?tab=saved-collections')}
                            className="text-xs font-bold text-[#0a47d0] hover:underline"
                        >
                            View My Collections →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCollections.map(col => (
                            <CollectionCard
                                key={col.id}
                                collection={col}
                                onExplore={() => setSelectedPublicCollection(col)}
                                onShare={(c) => setShareModalCollection(c)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* ------------------------------------------------------------------- */
                /* VIEW B: GENERAL COURSES SEARCH & DISCOVER                           */
                /* ------------------------------------------------------------------- */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">
                            Showing {filteredCourses.length} learning modules
                        </p>

                        <button
                            onClick={() => setSelectedCategory('Collections')}
                            className="text-xs font-bold text-[#002B7F] hover:text-[#0a47d0] flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Browse Public Collections</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                onAssignToMentee={handleAssignToMentee}
                                onAssignToProgram={handleAssignToProgram}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Public Collection Detail Modal */}
            {selectedPublicCollection && (
                <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedPublicCollection(null)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-gray-100 space-y-5 animate-scale-up max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                            <div>
                                <span className="text-[10px] font-bold text-[#002B7F] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                                    Public Collection
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">
                                    {selectedPublicCollection.title}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {selectedPublicCollection.description}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedPublicCollection(null)}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List of Courses inside collection */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Included Learning Modules ({selectedPublicCollection.items.length})
                            </h4>

                            {selectedPublicCollection.items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedPublicCollection(null);
                                        navigate(`/course/${item.id}`);
                                    }}
                                    className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition-colors border border-gray-100"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">{item.type || 'Course'}</div>
                                            <div className="text-xs font-bold text-gray-900 group-hover:text-[#0a47d0] truncate">{item.title}</div>
                                            <div className="text-[10px] text-gray-500">{item.provider}</div>
                                        </div>
                                    </div>

                                    <button 
                                        type="button" 
                                        className="px-3 py-1.5 bg-[#002B7F] group-hover:bg-[#0a47d0] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                                    >
                                        <Play className="w-3 h-3 fill-white" />
                                        <span>Start</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    collectionsService.saveCollections([
                                        ...allCollections,
                                        {
                                            ...selectedPublicCollection,
                                            id: `col_copied_${Date.now()}`,
                                            title: `Copy of ${selectedPublicCollection.title}`,
                                            author: 'You'
                                        }
                                    ]);
                                    setSelectedPublicCollection(null);
                                    showToast(`Added "${selectedPublicCollection.title}" to your Saved Collections!`);
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                            >
                                Save Copy to My Learning
                            </button>
                            <button
                                onClick={() => setSelectedPublicCollection(null)}
                                className="px-5 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Collection Modal */}
            {shareModalCollection && (
                <ShareCollectionModal
                    isOpen={!!shareModalCollection}
                    onClose={() => setShareModalCollection(null)}
                    collection={shareModalCollection}
                    onToast={showToast}
                />
            )}

            {/* Context Assignment Modals */}
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

export default DiscoverPage;
