import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons';

const SessionFeedbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    
    // Fallback if no state passed
    const sessionTitle = location.state?.title || "Live Session";

    const [ratings, setRatings] = useState<Record<string, number>>({});

    const questions = [
        "The learnings from this course can be applied to my job role*",
        "The course content was relevant and comprehensive*",
        "The objectives of the course were satisfactorily met, and the course was aligned to my learning needs*",
        "The course was easy to navigate *",
        "The course was interactive and engaging*"
    ];

    const handleRating = (q: string, val: number) => {
        setRatings(prev => ({ ...prev, [q]: val }));
    };

    const handleSubmit = () => {
        // In a real app, send feedback to API
        navigate('/mark-attendance?tab=sessions&feedbackStatus=completed&sessionId=' + sessionId);
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="border-b border-gray-200 sticky top-0 bg-white z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/mark-attendance?tab=sessions')} className="p-1 rounded-full hover:bg-gray-100">
                        <ArrowLeftIcon className="w-6 h-6 text-r-blue" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Session Feedback</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
                <p className="text-lg font-bold text-gray-900">Session Name : <span className="font-normal">{sessionTitle}</span></p>

                {questions.map((q, i) => (
                    <div key={i} className="space-y-4">
                        <p className="font-bold text-gray-800">{q}</p>
                        <div className="flex gap-6">
                            {[1, 2, 3, 4, 5].map(num => (
                                <label key={num} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${ratings[q] === num ? 'border-r-blue bg-r-blue' : 'border-gray-300'}`}>
                                        {ratings[q] === num && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                    </div>
                                    <input type="radio" className="hidden" name={q} onChange={() => handleRating(q, num)} />
                                    <span className="text-sm font-medium text-gray-700">{num}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-r-blue focus:ring-r-blue" />
                        <span className="text-gray-800 font-medium">example checkbox</span>
                    </label>
                    <p className="text-gray-600 text-sm italic">desc</p>
                </div>

                <div className="space-y-6">
                    <p className="font-bold text-gray-800">What is your feedback on product?</p>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button 
                                key={num}
                                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:border-r-blue hover:text-r-blue transition-all"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 pb-12">
                    <button 
                        onClick={handleSubmit}
                        className="px-12 py-3 bg-nav-blue text-white font-bold rounded-full shadow-lg hover:bg-r-blue-dark transition-all transform active:scale-95"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionFeedbackPage;