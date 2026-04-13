
import React from 'react';
import type { Benefit } from '../types';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, HourglassIcon, BookOpenIcon, QuestionMarkCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import MentorSubHeader from '../components/MentorSubHeader';
import { useCarousel } from '../hooks/useCarousel';

const mentorBenefits: Benefit[] = [
    { title: 'Make an Impact', description: 'Shape the next generation by sharing your expertise and experiences.' },
    { title: 'Enhance Leadership Skills', description: 'Strengthen your coaching and communication abilities in a structured environment.' },
    { title: 'Expand Your Network', description: 'Build meaningful relationships across diverse roles.' },
    { title: 'Gain Fresh Perspectives', description: 'Learn from mentees\' innovative ideas and new-age approaches.' },
    { title: 'Earn Recognition', description: 'Be celebrated as a role model and leader.' },
];

const menteeBenefits: Benefit[] = [
    { title: 'Accelerate Career Growth', description: 'Gain insights and advice tailored to your professional journey.' },
    { title: 'Build Confidence', description: 'Learn to tackle challenges with the guidance of an experienced mentor.' },
    { title: 'Expand Your Skillset', description: 'Acquire practical knowledge and refine your competencies.' },
    { title: 'Access Valuable Networks', description: 'Connect with industry leaders and experts.' },
    { title: 'Achieve Your Goals', description: 'Work towards clearly defined objectives with the support of your mentor.' },
];

interface VideoItem {
    id: number;
    title: string;
    description: string;
    src: string;
    thumbnail: string;
}

const howItWorksVideos: VideoItem[] = [
    {
        id: 1,
        title: "Getting Started with Mentoring",
        description: "Learn how to set up your profile, define your preferences, and find the perfect mentor or mentee to kickstart your journey.",
        src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop&q=80"
    },
    {
        id: 2,
        title: "Scheduling & Conducting Sessions",
        description: "A step-by-step guide to proposing meeting times, setting agendas, and conducting effective mentorship sessions.",
        src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop&q=80"
    },
    {
        id: 3,
        title: "Tracking Goals & Progress",
        description: "Discover how to use the platform's tools to set SMART goals, track milestones, and provide meaningful feedback.",
        src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1513258496099-48162023ac90?w=800&h=450&fit=crop&q=80"
    }
];

const MentorPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        currentItem: currentVideo, 
        goToPrevious, 
        goToNext, 
        currentIndex,
        goToSlide 
    } = useCarousel(howItWorksVideos, 0); // 0 means no auto-play
    
    return (
        <div className="bg-white">
            <MentorSubHeader />
            
            {/* Merged Welcome and Program/Open Mentoring Section */}
            <div className="relative bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')"}}>
                <div className="absolute inset-0 bg-black opacity-60"></div> {/* Neutral dark overlay for readability */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    {/* Welcome Text */}
                    <h2 className="text-4xl font-heading font-bold text-white">Welcome to Mentoring</h2>
                    <p className="mt-4 text-lg text-r-gray-200 max-w-3xl mx-auto">
                        Embark on a transformative journey of growth and development. Whether you're looking to accelerate your career, build new skills, or share your own expertise, our platform connects you with the right opportunities.
                    </p>
                    
                    {/* Program/Open Mentoring Content */}
                    <div className="mt-16 grid md:grid-cols-2 gap-16 items-center">
                        {/* Program Mentoring Side */}
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white">Program Mentoring</h3>
                            <p className="mt-4 text-lg text-r-gray-200">Find structured programs to accelerate your growth.</p>
                            <button 
                                onClick={() => navigate('/mentor/search', { state: { initialFilter: 'program' } })}
                                className="mt-8 bg-white text-r-blue-dark font-semibold px-8 py-3 rounded-full hover:bg-r-gray-100 transition-colors duration-300 shadow-md text-lg">
                                Discover Programs
                            </button>
                        </div>
                        {/* Democratized Mentoring Side */}
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white">Democratized Mentoring</h3>
                            <p className="mt-4 text-lg text-r-gray-200">Find a mentor based on topics and expertise.</p>
                            <button
                                onClick={() => navigate('/mentor/search', { state: { initialFilter: 'topic' } })}
                                className="mt-8 bg-white text-r-blue-dark font-semibold px-8 py-3 rounded-full hover:bg-r-gray-100 transition-colors duration-300 shadow-md text-lg">
                                Discover Mentors
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Video Section */}
            {currentVideo && (
                <div className="py-20 bg-white border-b border-r-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-heading font-bold text-r-gray-900 mb-10">How It Works</h2>
                        
                        <div className="relative group max-w-4xl mx-auto">
                            {/* Video Player Tile */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black mx-auto">
                                <video 
                                    key={currentVideo.src} 
                                    controls 
                                    className="w-full h-full object-cover"
                                    poster={currentVideo.thumbnail}
                                >
                                    <source src={currentVideo.src} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Overlay Navigation Buttons */}
                                <button 
                                    onClick={goToPrevious} 
                                    className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white shadow-lg text-r-gray-800 focus:outline-none transition-transform hover:scale-110 z-20 backdrop-blur-sm"
                                    aria-label="Previous video"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={goToNext} 
                                    className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white shadow-lg text-r-gray-800 focus:outline-none transition-transform hover:scale-110 z-20 backdrop-blur-sm"
                                    aria-label="Next video"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

             {/* Benefits Section */}
            <div className="py-24 bg-r-blue-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                         <h2 className="text-4xl font-heading font-bold text-r-gray-900">Know your benefits</h2>
                         <p className="mt-4 text-lg text-r-gray-600">Understand the perks and opportunities gained through a mentor-mentee relationship.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                        <div>
                            <div className="flex items-center mb-6">
                                <UsersIcon className="w-8 h-8 text-r-blue" />
                                <h3 className="text-2xl font-heading font-semibold text-r-gray-800 ml-4">Mentor Benefits</h3>
                            </div>
                            <div className="space-y-6">
                                {mentorBenefits.map(benefit => (
                                    <div key={benefit.title}>
                                        <h4 className="font-heading font-semibold text-r-gray-900">{benefit.title}</h4>
                                        <p className="text-r-gray-600 mt-1">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <div className="flex items-center mb-6">
                                <HourglassIcon className="w-8 h-8 text-r-blue" />
                                <h3 className="text-2xl font-heading font-semibold text-r-gray-800 ml-4">Mentee Benefits</h3>
                            </div>
                            <div className="space-y-6">
                                {menteeBenefits.map(benefit => (
                                    <div key={benefit.title}>
                                        <h4 className="font-heading font-semibold text-r-gray-900">{benefit.title}</h4>
                                        <p className="text-r-gray-600 mt-1">{benefit.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queries Section */}
            <div className="py-24 bg-white">
                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-heading font-bold text-r-gray-900">Got queries? Get answers here</h2>
                    <p className="mt-4 text-lg text-r-gray-600">you'll find all frequently asked questions and how-to use document here.</p>
                    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-8">
                        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 w-full sm:w-64 border">
                            <div className="w-20 h-20 bg-r-blue-100 rounded-full flex items-center justify-center">
                                <BookOpenIcon className="w-10 h-10 text-r-blue" />
                            </div>
                            <h3 className="mt-4 text-xl font-heading font-semibold">Success Guide</h3>
                        </div>
                        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 w-full sm:w-64 border">
                             <div className="w-20 h-20 bg-r-blue-100 rounded-full flex items-center justify-center">
                                <QuestionMarkCircleIcon className="w-10 h-10 text-r-blue" />
                            </div>
                            <h3 className="mt-4 text-xl font-heading font-semibold">FAQ</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorPage;
