import React, { useState, useEffect } from 'react';
import { XIcon, SearchIcon, PlusIcon, CheckCircleIcon, ArrowLeftIcon } from './Icons';

interface SkillsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { skills: string[]; jobDescription: string }) => void;
  initialSkills?: string[];
}

const SkillsSelectionModal: React.FC<SkillsSelectionModalProps> = ({ isOpen, onClose, onSubmit, initialSkills = [] }) => {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSelectedSkills(initialSkills.length > 0 ? initialSkills : []);
        setStep(1);
        setSkillInput('');
    }
  }, [isOpen, initialSkills]);

  if (!isOpen) return null;

  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
        setSelectedSkills([...selectedSkills, trimmed]);
        setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (selectedSkills.length === 0) {
        alert("Please add at least one skill to proceed.");
        return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
      // Step 2 is now non-mandatory, so no validation alert here
      onSubmit({ skills: selectedSkills, jobDescription });
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-heading font-bold text-r-gray-900">Personalize your learning</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-r-blue' : 'bg-r-gray-200'}`}></span>
                <span className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-r-blue' : 'bg-r-gray-200'}`}></span>
                <p className="text-xs text-r-gray-500 font-bold ml-2 uppercase tracking-wider">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600 p-2 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-grow bg-r-gray-50">
            {step === 1 ? (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold text-r-gray-800 mb-2">What skills are you interested in?</h3>
                    <p className="text-sm text-r-gray-600 leading-relaxed mb-6 italic">
                        Please add skills applicable in your Job role, day-to-day tasks, and skills you'd like to learn.
                    </p>
                    
                    <form onSubmit={handleAddSkill} className="flex gap-3 mb-8">
                        <div className="relative flex-grow">
                            <PlusIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-r-gray-400" />
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="Enter a skill (e.g. Python, Leadership)..."
                                className="w-full pl-12 pr-4 py-3 border border-r-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-r-blue bg-white shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-r-blue text-white font-bold rounded-lg hover:bg-r-blue-dark transition-colors shadow-md active:scale-95"
                        >
                            Add
                        </button>
                    </form>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-r-gray-500 uppercase tracking-widest">Added Skills</h4>
                        <div className="flex flex-wrap gap-3">
                            {selectedSkills.map(skill => (
                                <div
                                    key={skill}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-r-blue-100 text-r-blue-dark shadow-sm group hover:border-r-blue-200 transition-all"
                                >
                                    <CheckCircleIcon className="w-4 h-4 text-r-blue" />
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className="ml-1 text-r-gray-300 hover:text-red-500 transition-colors"
                                        title="Remove skill"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {selectedSkills.length === 0 && (
                                <p className="text-r-gray-400 text-sm italic">No skills added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-r-gray-800">Tell us about your role</h3>
                        <span className="text-xs font-bold text-r-gray-400 uppercase bg-r-gray-200 px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <p className="text-sm text-r-gray-600 leading-relaxed mb-6">
                        Please describe your day-to-day job responsibilities and tasks, along with the topics or skills you use most often in your role—write freely in your own words, there is no right or wrong answer.
                    </p>
                    
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="e.g. I manage a team of developers, conduct code reviews, and focus on system architecture for our retail platform..."
                        rows={8}
                        className="w-full p-4 border border-r-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-r-blue bg-white shadow-inner text-r-gray-800 leading-relaxed resize-none"
                    />
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-between items-center">
            {step === 2 ? (
                <button 
                    onClick={() => setStep(1)} 
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-r-gray-700 bg-white border border-r-gray-300 rounded-lg hover:bg-r-gray-50 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>
            ) : (
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-r-gray-700 bg-white hover:text-r-blue transition-colors">Skip for now</button>
            )}

            <div className="flex gap-3">
                {step === 1 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-2.5 text-sm font-bold text-white bg-r-blue rounded-lg hover:bg-r-blue-dark shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={selectedSkills.length === 0}
                    >
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2.5 text-sm font-bold text-white bg-r-blue rounded-lg hover:bg-r-blue-dark shadow-md transition-all active:scale-95"
                    >
                        Save & Continue
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSelectionModal;