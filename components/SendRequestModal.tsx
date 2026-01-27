
import React, { useState, FormEvent, useEffect } from 'react';
import type { Mentor } from '../types';
import { XIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from './Icons';
import ConfirmRequestModal from './ConfirmRequestModal';

interface SendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  mentor: Mentor;
  topic?: string; // Optional now as it can be selected inside
}

const MENTORING_TOPICS = [
    'Goal Setting', 'Time Management', 'Building Resilience & Stress Management',
    'Public Speaking', 'Creative Thinking & Brainstorming Techniques',
    'Critical Thinking & Analytical Skills', 'Adaptability', 'Personal Branding',
    'Internal Networking Strategies', 'Collaboration & Team Dynamics',
    'Influencing Without Authority', 'Industry Trends & Emerging Technologies',
    'Project Management Skills', 'Digital Literacy & Tool Mastery', 'Agile Methodologies'
];

const SendRequestModal: React.FC<SendRequestModalProps> = ({ isOpen, onClose, onSubmit, mentor, topic: initialTopic }) => {
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || '');
  const [note, setNote] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
      if (isOpen && initialTopic) {
          // Try to match the initial topic to the list, or add it if not present
          const normalizedTopic = initialTopic.toLowerCase();
          const match = MENTORING_TOPICS.find(t => t.toLowerCase() === normalizedTopic);
          setSelectedTopic(match || initialTopic);
      } else {
          setSelectedTopic('');
      }
      setNote('');
      setIsDetailsOpen(true);
      setIsConfirmModalOpen(false);
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;
  
  const handlePreSubmit = (e: FormEvent) => {
      e.preventDefault();
      if(selectedTopic && note) {
          setIsConfirmModalOpen(true);
      }
  }

  const handleFinalConfirm = () => {
      setIsConfirmModalOpen(false);
      onSubmit();
  }

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-heading font-bold text-gray-900">Request Mentor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handlePreSubmit} className="overflow-y-auto flex-grow p-8 bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-center gap-6">
                        <img 
                            src={mentor.imageUrl} 
                            alt={mentor.name} 
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                        />
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                            <p className="text-gray-600">{mentor.title}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full border border-green-200">
                            <CheckCircleIcon className="w-4 h-4"/> Available
                        </span>
                        <button 
                            type="button"
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className="p-1 rounded-full border border-gray-200 hover:bg-gray-50"
                        >
                            {isDetailsOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium text-gray-500">Employee Code</span>
                        <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.employeeCode || '01076501'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-medium text-gray-500">Email-Id</span>
                        <span className="col-span-2 text-sm font-semibold text-gray-900 uppercase break-all">{mentor.email || `${mentor.name.replace(/\s+/g, '.')}@ril.com`}</span>
                    </div>
                </div>

                {isDetailsOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-4 pt-4 border-t border-gray-100 animate-fade-in-down">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Grade</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.grade || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Position</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.title || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Location</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.location || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Organisation Unit</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.business || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Experience(RIL)</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.experience || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Segment</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.segment || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium text-gray-500">Function</span>
                            <span className="col-span-2 text-sm font-semibold text-gray-900">{mentor.function || mentor.vertical || 'N/A'}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Mentoring to me:</h4>
                        <p className="text-gray-700 leading-relaxed">{mentor.mentoringMeaning || "Guru Dakshini To My Mentor Under Whose Guidance I Have Achieved What I Have Today"}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Ideal Mentee:</h4>
                        <p className="text-gray-700 leading-relaxed">{mentor.idealMentee || "Open to learn and unlearn and relearn"}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Mentoring Topics</h4>
                    <div className="flex flex-wrap gap-3">
                        {MENTORING_TOPICS.map(topic => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => setSelectedTopic(topic)}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                    selectedTopic === topic 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Note: Please select one option.</p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Add a note to your request</h4>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Relevent details related to the mentoring topics*"
                        rows={1}
                        className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-600 bg-transparent text-gray-900 placeholder-gray-400 resize-none transition-colors"
                        required
                    />
                </div>

                <div className="text-center pt-4">
                    <button
                        type="submit"
                        disabled={!selectedTopic || !note}
                        className="px-12 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-full shadow-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
    
    <ConfirmRequestModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalConfirm}
        mentorName={mentor.name}
    />
    </>
  );
};

export default SendRequestModal;
