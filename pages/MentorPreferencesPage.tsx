
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon } from '../components/Icons';
import MentorSubHeader from '../components/MentorSubHeader';

const MentorPreferencesPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Mock mentor profile data
    const userProfile = {
        name: 'Priya Sharma',
        title: 'Director of Engineering',
        employeeCode: 'E100100',
        email: 'priya.sharma@ril.com',
        grade: 'L8',
        business: 'Jio Platforms',
        location: 'RCP, Navi Mumbai',
        segment: 'Engineering',
        experience: '12 years',
        function: 'Technology'
    };

    const [idealMentee, setIdealMentee] = useState('');
    const [mentoringMeaning, setMentoringMeaning] = useState('');
    const [maxMentees, setMaxMentees] = useState(2);
    const [agreed, setAgreed] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false); // Default collapsed as per requirement hint "open arrow to open"

    const handleSubmit = () => {
        if (!agreed) {
            alert("Please agree to the terms and conditions.");
            return;
        }
        // Save logic here
        navigate('/mentor/mentor-journey');
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
                    <h1 className="text-xl font-heading font-bold text-gray-900">Set Mentor Preferences</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Card with Dossier Toggle */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img src="https://picsum.photos/seed/mentor1/150/150" alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                                    <p className="text-gray-500">{userProfile.title}</p>
                                </div>
                                <button 
                                    onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                                    className="flex items-center gap-2 text-sm font-medium text-r-blue hover:bg-r-blue-50 px-3 py-1 rounded-full transition-colors"
                                >
                                    {isProfileExpanded ? 'Hide Dossier Details' : 'View Dossier Details'}
                                    {isProfileExpanded ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
                                </button>
                            </div>
                            
                            {isProfileExpanded && (
                                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm animate-fade-in-down">
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">My Ideal Mentee Is</h3>
                        <textarea
                            value={idealMentee}
                            onChange={(e) => setIdealMentee(e.target.value)}
                            placeholder="Describe the qualities and aspirations of your ideal mentee"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-r-blue bg-white text-gray-900 placeholder-gray-400 resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">What Mentoring Means to Me</h3>
                        <textarea
                            value={mentoringMeaning}
                            onChange={(e) => setMentoringMeaning(e.target.value)}
                            placeholder="Share your philosophy and approach to mentoring"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-r-blue bg-white text-gray-900 placeholder-gray-400 resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Maximum Mentees</h3>
                        <p className="text-sm text-gray-500 mb-2">Select the maximum number of mentees you can support at one time.</p>
                        <select
                            value={maxMentees}
                            onChange={(e) => setMaxMentees(parseInt(e.target.value))}
                            className="w-full sm:w-1/3 border-b border-gray-300 py-2 focus:outline-none focus:border-r-blue bg-white text-gray-900"
                        >
                            <option value={1}>1 Mentee</option>
                            <option value={2}>2 Mentees</option>
                            <option value={3}>3 Mentees</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Terms and Conditions</h3>
                        <div className="bg-gray-100 p-6 rounded-lg text-sm text-gray-700 leading-relaxed mb-4">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Commitment: Dedicate the agreed-upon time for mentoring sessions.</li>
                                <li>Confidentiality: Maintain strict confidentiality regarding all discussions with mentees.</li>
                                <li>Professionalism: Interact with mentees in a respectful and professional manner.</li>
                                <li>Feedback: Provide constructive and actionable feedback to help mentees grow.</li>
                                <li>Support: Share knowledge, experiences, and networks to support the mentee's development.</li>
                            </ol>
                        </div>
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="mentor-terms" 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-5 h-5 text-r-blue border-gray-300 rounded focus:ring-r-blue bg-white"
                            />
                            <label htmlFor="mentor-terms" className="ml-2 text-gray-700">I agree to the terms & conditions</label>
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

export default MentorPreferencesPage;
