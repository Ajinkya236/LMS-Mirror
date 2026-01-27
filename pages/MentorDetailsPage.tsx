import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon } from '../components/Icons';

// Mock data, in a real app this would be fetched based on mentorId
const mockMentorDetails = {
    id: '101',
    name: 'Sachin Kumar',
    title: 'UI/UX Designer',
    imageUrl: 'https://i.pravatar.cc/150?u=sachin',
    rating: 3.7,
    mentees: {
        completed: 2,
        active: 2,
        upcoming: 2,
        pending: 1,
    },
    acceptedPrograms: {
        total: 24,
        completed: 18,
        ongoing: 6,
    },
    experience: {
        interestExpressed: true,
        previousMentoring: true,
        mentoringExperience: true,
    },
    mentorInfo: {
        preferredMode: 'Hybrid',
        experience: '20 yrs',
        location: 'Mumbai'
    },
    topics: ['UI/UX Design', 'User Research', 'Prototyping', 'Design Thinking'],
    programs: {
        ongoing: ['Leading with Impact', 'Design Thinking Workshop'],
        completed: ['UI/UX Fundamentals', 'Agile for Designers', 'Intro to Figma']
    }
};

const DonutChart: React.FC<{ completed: number, ongoing: number, total: number }> = ({ completed, ongoing, total }) => {
    const completedPercent = (completed / total) * 100;
    const ongoingPercent = (ongoing / total) * 100;
    const circumference = 2 * Math.PI * 45;
    const completedStroke = (completedPercent / 100) * circumference;
    const ongoingStroke = (ongoingPercent / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className="text-green-500"
                    strokeWidth="10"
                    strokeDasharray={`${completedStroke}, ${circumference}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
                <circle
                    className="text-yellow-500"
                    strokeWidth="10"
                    strokeDasharray={`${ongoingStroke}, ${circumference}`}
                    strokeDashoffset={-completedStroke}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{total}</span>
            </div>
        </div>
    );
};


const MentorDetailsPage: React.FC = () => {
    const { mentorId } = useParams<{ mentorId: string }>();
    const navigate = useNavigate();
    const mentor = mockMentorDetails; // Use mock data

    if (!mentor) {
        return <div>Mentor not found</div>;
    }

    return (
        <div className="bg-r-gray-100 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center space-x-4 h-16">
                         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Mentor Details</h1>
                    </div>
                </div>
            </header>
            
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                        <img src={mentor.imageUrl} alt={mentor.name} className="w-32 h-32 rounded-full border-4 border-gray-200" />
                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold">{mentor.name}</h2>
                            <p className="text-gray-600">{mentor.title}</p>
                            <div className="flex items-center justify-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(mentor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-2 font-bold">{mentor.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full border-t sm:border-t-0 sm:border-l pl-8 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg flex justify-between items-center">Mentees</h3>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div><p className="text-gray-500">Completed</p><p className="text-3xl font-bold">{mentor.mentees.completed}</p></div>
                                <div><p className="text-gray-500">Active</p><p className="text-3xl font-bold">{mentor.mentees.active}</p></div>
                                <div><p className="text-gray-500">Upcoming</p><p className="text-3xl font-bold">{mentor.mentees.upcoming}</p></div>
                                <div><p className="text-gray-500">Pending</p><p className="text-3xl font-bold text-orange-500">{mentor.mentees.pending}</p></div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg">Accepted Programs</h3>
                            <div className="mt-4 flex items-center gap-6">
                                <DonutChart total={mentor.acceptedPrograms.total} completed={mentor.acceptedPrograms.completed} ongoing={mentor.acceptedPrograms.ongoing} />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><div><p className="text-gray-500 text-sm">Completed</p><p className="font-bold">{mentor.acceptedPrograms.completed}</p></div></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div><p className="text-gray-500 text-sm">Ongoing</p><p className="font-bold">{mentor.acceptedPrograms.ongoing}</p></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center"><span className="font-medium">Interest expressed by Mentor</span> <CheckCircleIcon className="w-6 h-6 text-green-500" /></div>
                        <div className="flex justify-between items-center"><span className="font-medium">Previous Mentoring Experience</span> <CheckCircleIcon className="w-6 h-6 text-green-500" /></div>
                        <div className="flex justify-between items-center"><span className="font-medium">Mentoring Experience</span> <CheckCircleIcon className="w-6 h-6 text-green-500" /></div>
                    </div>
                     <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold border-b pb-2">Mentor Information</h3>
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <div><p className="text-sm text-gray-500">Preferred Mentoring Mode</p><p className="font-medium">{mentor.mentorInfo.preferredMode}</p></div>
                            <div><p className="text-sm text-gray-500">Experience</p><p className="font-medium">{mentor.mentorInfo.experience}</p></div>
                            <div><p className="text-sm text-gray-500">Current Location</p><p className="font-medium">{mentor.mentorInfo.location}</p></div>
                        </div>
                        <h3 className="text-lg font-semibold border-b pb-2 mt-8">Topics Covered</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {mentor.topics.map(topic => (
                                <span key={topic} className="bg-r-blue-50 text-r-blue-dark text-sm font-medium px-3 py-1 rounded-full">{topic}</span>
                            ))}
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 mt-8">Programs</h3>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700">Ongoing ({mentor.programs.ongoing.length})</h4>
                                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                                    {mentor.programs.ongoing.map(p => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-700">Completed ({mentor.programs.completed.length})</h4>
                                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                                    {mentor.programs.completed.map(p => <li key={p}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MentorDetailsPage;