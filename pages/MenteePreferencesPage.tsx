
import React, { useState, KeyboardEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon, XIcon, PlusIcon, SearchIcon } from '../components/Icons';
import MentorSubHeader from '../components/MentorSubHeader';

const AVAILABLE_TOPICS = [
    'Leadership', 'Communication', 'Project Management', 'Agile Methodology', 'Time Management',
    'Public Speaking', 'Negotiation', 'Career Growth', 'Networking', 'Personal Branding',
    'Python', 'React', 'Data Science', 'Machine Learning', 'Cloud Computing', 'Cybersecurity',
    'UI/UX Design', 'Product Management', 'Financial Modeling', 'Digital Marketing'
];

const MenteePreferencesPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Mock user profile data matching the image request
    const userProfile = {
        name: 'Vedushi Sharma',
        title: 'UI/UX Designer',
        employeeCode: '5324456',
        email: 'vedushi.sharma@ril.com',
        grade: 'F',
        business: 'Reliance Retail',
        location: 'RCP, Navi Mumbai',
        segment: '---',
        experience: '3 years',
        function: '---'
    };

    const [mentoringNeeds, setMentoringNeeds] = useState('');
    const [idealMentor, setIdealMentor] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [topicInput, setTopicInput] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(true);
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);

    const filteredTopics = useMemo(() => {
        if (!topicInput) return AVAILABLE_TOPICS;
        return AVAILABLE_TOPICS.filter(t => 
            t.toLowerCase().includes(topicInput.toLowerCase()) && 
            !topics.includes(t)
        );
    }, [topicInput, topics]);

    const handleAddTopic = (topic: string) => {
        if (topics.length < 5 && !topics.includes(topic)) {
            setTopics([...topics, topic]);
            setTopicInput('');
            setShowTopicDropdown(false);
        }
    };

    const removeTopic = (topic: string) => {
        setTopics(topics.filter(t => t !== topic));
    };

    const handleSubmit = () => {
        if (!agreed) {
            alert("Please agree to the terms and conditions.");
            return;
        }
        // Save logic here
        navigate('/mentor/mentee-journey');
    };

    return (
        <div className="bg-white min-h-screen">
            <MentorSubHeader />
            {/* Header */}
            <div className="border-b border-gray-200 sticky top-[120px] bg-white z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-r-blue hover:text-r-blue-dark">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-heading font-bold text-gray-900">Add your Preferences</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 relative">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img src="https://i.pravatar.cc/150?u=vedushi" alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                                    <p className="text-gray-500">{userProfile.title}</p>
                                </div>
                                <button 
                                    onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                                    className="p-1 rounded-full hover:bg-gray-100 border border-gray-200"
                                >
                                    {isProfileExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-600"/> : <ChevronDownIcon className="w-5 h-5 text-gray-600"/>}
                                </button>
                            </div>
                            
                            <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm transition-all duration-300 ${isProfileExpanded ? 'block' : 'hidden'}`}>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Employee Code</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.employeeCode}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Email Id</span>
                                    <span className="col-span-2 font-semibold text-gray-900 break-all">{userProfile.email}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Grade</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.grade}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Business</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.business}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Location</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.location}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Segment</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.segment}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Experience</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.experience}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Function</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{userProfile.function}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Mentoring Needs</h3>
                        <textarea
                            value={mentoringNeeds}
                            onChange={(e) => setMentoringNeeds(e.target.value)}
                            placeholder="What you seek to gain from the mentoring relationship is"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-r-blue bg-white text-gray-900 placeholder-gray-400 resize-none"
                            rows={2}
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">My Ideal Mentor Is</h3>
                        <textarea
                            value={idealMentor}
                            onChange={(e) => setIdealMentor(e.target.value)}
                            placeholder="Describe ideal characteristics of a mentor"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-r-blue bg-white text-gray-900 placeholder-gray-400 resize-none"
                            rows={2}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Topics</h3>
                            <div className="relative w-64">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={topicInput}
                                        onChange={(e) => {
                                            setTopicInput(e.target.value);
                                            setShowTopicDropdown(true);
                                        }}
                                        onFocus={() => setShowTopicDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowTopicDropdown(false), 200)}
                                        placeholder="Search & Add Topic"
                                        className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-r-blue bg-white text-gray-900"
                                        disabled={topics.length >= 5}
                                    />
                                    <SearchIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                </div>
                                
                                {showTopicDropdown && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredTopics.length > 0 ? (
                                            filteredTopics.map((topic) => (
                                                <button
                                                    key={topic}
                                                    onClick={() => handleAddTopic(topic)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {topic}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-500">No matching topics found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {topics.map(topic => (
                                <span key={topic} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                    {topic}
                                    <button onClick={() => removeTopic(topic)} className="ml-2 text-gray-500 hover:text-red-500">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {topics.length === 0 && <p className="text-gray-400 text-sm">No topics added yet.</p>}
                        </div>
                        <div className="mt-2 border-b border-gray-300 w-full"></div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Terms and Conditions</h3>
                        <div className="bg-gray-100 p-6 rounded-lg text-sm text-gray-700 leading-relaxed mb-4">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Confidentiality: Keep all information shared by the mentor private and secure.</li>
                                <li>Active Participation: Be open, honest, and transparent about your goals and challenges.</li>
                                <li>Commitment: Attend scheduled sessions on time and provide advance notice for changes.</li>
                                <li>Preparedness: Come prepared with questions or updates to maximize the value of sessions.</li>
                                <li>Respectful Engagement: Treat the mentor with respect and maintain professional boundaries.</li>
                            </ol>
                        </div>
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-5 h-5 text-r-blue border-gray-300 rounded focus:ring-r-blue bg-white"
                            />
                            <label htmlFor="terms" className="ml-2 text-gray-700">I agree to the terms & conditions</label>
                        </div>
                    </div>

                    <div className="text-center pt-4 pb-12">
                        <button 
                            onClick={handleSubmit}
                            disabled={!agreed}
                            className="bg-[#9d8fbf] hover:bg-[#8d7eb0] text-white font-bold py-3 px-12 rounded-full shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteePreferencesPage;
