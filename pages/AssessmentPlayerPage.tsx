import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons';

const AssessmentPlayerPage: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Mock Timer Blocks
    const TimerBlock: React.FC<{ value: string }> = ({ value }) => (
        <div className="flex gap-0.5">
            {value.split('').map((char, i) => (
                <div key={i} className="w-8 h-10 bg-r-gray-800 text-white rounded flex items-center justify-center font-bold text-xl shadow-inner">
                    {char}
                </div>
            ))}
        </div>
    );

    const handleFinish = () => {
        if (!selectedOption) {
            alert("Please select an answer.");
            return;
        }

        if (selectedOption === 'Delhi') {
            // Simulate a passing score and redirect back to My Sessions
            navigate(`/mark-attendance?tab=sessions&assessmentStatus=passed&sessionId=${sessionId}`);
        } else {
            alert("Incorrect answer. Please try again.");
        }
    };

    const options = ["Mumbai", "Delhi", "Kolkata", "Hyderabad"];

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-50">
                <button 
                    onClick={() => navigate('/mark-attendance?tab=sessions')} 
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-r-blue" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 truncate">
                    General Knowledge Assessment
                </h1>
            </div>

            {/* Timer Bar */}
            <div className="bg-white px-4 py-4 flex items-center gap-2 border-b border-gray-100">
                <TimerBlock value="00" />
                <span className="text-2xl font-bold text-r-gray-800">:</span>
                <TimerBlock value="59" />
                <span className="text-2xl font-bold text-r-gray-800">:</span>
                <TimerBlock value="42" />
            </div>

            {/* Questions Container */}
            <div className="flex-grow overflow-y-auto px-6 py-12 space-y-12 max-w-2xl mx-auto w-full">
                
                {/* Single Question */}
                <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                        What is the capital of India?*
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {options.map((option) => (
                            <label 
                                key={option} 
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                                    selectedOption === option 
                                    ? 'border-r-blue bg-blue-50' 
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedOption === option ? 'border-r-blue' : 'border-gray-300'
                                }`}>
                                    {selectedOption === option && <div className="w-2.5 h-2.5 rounded-full bg-r-blue"></div>}
                                </div>
                                <input 
                                    type="radio" 
                                    name="capIndia" 
                                    className="hidden" 
                                    value={option}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                />
                                <span className={`font-bold text-lg ${
                                    selectedOption === option ? 'text-r-blue-dark' : 'text-gray-700'
                                }`}>
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-10 flex flex-col items-center">
                    <button 
                        onClick={handleFinish}
                        className="px-16 py-4 bg-nav-blue text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-r-blue-dark transition-all transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!selectedOption}
                    >
                        Finish Assessment
                    </button>
                    <p className="mt-4 text-xs text-gray-400 font-medium italic">Select the correct answer to complete and pass.</p>
                </div>
            </div>
        </div>
    );
};

export default AssessmentPlayerPage;