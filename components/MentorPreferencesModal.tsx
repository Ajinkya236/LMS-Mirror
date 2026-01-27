import React, { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import type { MenteePreferences } from '../types';
import { XIcon } from './Icons';

interface MentorPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: MenteePreferences) => void;
  initialPreferences?: MenteePreferences;
}

const defaultPreferences: MenteePreferences = {
  name: 'Ajinkya Patil',
  employeeCode: 'EMP12345',
  email: 'ajinkya.patil@new-lms.com',
  grade: 'Senior Engineer',
  location: 'Mumbai',
  experience: '5 Years',
  mentoringNeeds: 'Learn role-based skills, power skills, and business knowledge.',
  idealMentor: 'Someone humble with experiential knowledge.',
  preferredTopics: [],
};

const MentorPreferencesModal: React.FC<MentorPreferencesModalProps> = ({ isOpen, onClose, onSubmit, initialPreferences }) => {
  const [prefs, setPrefs] = useState<MenteePreferences>(initialPreferences || defaultPreferences);
  const [topicInput, setTopicInput] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setPrefs(initialPreferences);
    }
  }, [initialPreferences]);

  if (!isOpen) return null;

  const handleTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim() !== '' && prefs.preferredTopics.length < 5) {
      e.preventDefault();
      setPrefs(p => ({ ...p, preferredTopics: [...p.preferredTopics, topicInput.trim()] }));
      setTopicInput('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setPrefs(p => ({ ...p, preferredTopics: p.preferredTopics.filter(t => t !== topicToRemove) }));
  };
  
  const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if(agreed) {
          onSubmit(prefs);
      }
  }

  const FormRow: React.FC<{ label: string; value: string; isStatic?: boolean }> = ({ label, value, isStatic = true }) => (
    <div>
        <label className="block text-sm font-medium text-r-gray-700">{label}</label>
        {isStatic ? (
            <p className="mt-1 text-r-gray-900">{value}</p>
        ) : (
            <textarea
                value={value}
                onChange={(e) => setPrefs(p => ({ ...p, [label.toLowerCase().replace(/\s/g, '')]: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                rows={3}
            />
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Add your Mentee preferences</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Personal & Professional Details */}
            <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-4 text-r-gray-800">Personal & Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <FormRow label="Name" value={prefs.name} />
                    <FormRow label="Employee Code" value={prefs.employeeCode} />
                    <FormRow label="Email" value={prefs.email} />
                    <FormRow label="Grade" value={prefs.grade} />
                    <FormRow label="Location" value={prefs.location} />
                    <FormRow label="Experience at RIL" value={prefs.experience} />
                </div>
            </div>

            {/* Mentoring Needs */}
             <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">Mentoring Needs</h3>
                <textarea
                    value={prefs.mentoringNeeds}
                    onChange={(e) => setPrefs({ ...prefs, mentoringNeeds: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                    placeholder="E.g., Learn role-based skills, power skills..."
                    rows={3}
                />
            </div>
            
             {/* Ideal Mentor */}
             <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">My Ideal Mentor</h3>
                <textarea
                    value={prefs.idealMentor}
                    onChange={(e) => setPrefs({ ...prefs, idealMentor: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                    placeholder="E.g., Someone humble with experiential knowledge..."
                    rows={3}
                />
            </div>

            {/* Preferred topics */}
            <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">Preferred topics</h3>
                <p className="text-sm text-r-gray-500 mb-2">Select at max 5 topics.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                    {prefs.preferredTopics.map(topic => (
                        <span key={topic} className="flex items-center bg-r-blue-100 text-r-blue-dark text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {topic}
                            <button onClick={() => removeTopic(topic)} className="ml-1.5 text-r-blue-dark hover:text-r-blue">
                                <XIcon className="w-3 h-3"/>
                            </button>
                        </span>
                    ))}
                </div>
                 <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleTopicKeyDown}
                    placeholder={prefs.preferredTopics.length < 5 ? "Type a topic and press Enter" : "Maximum 5 topics reached"}
                    disabled={prefs.preferredTopics.length >= 5}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm disabled:bg-r-gray-50"
                />
            </div>
            
            {/* Terms and Conditions */}
            <div className="p-4 border rounded-md">
                 <h3 className="font-heading font-semibold mb-2 text-r-gray-800">Terms and Conditions</h3>
                 <div className="text-xs text-r-gray-600 space-y-1 max-h-24 overflow-y-auto pr-2">
                    <p>1. I commit to dedicating time for mentoring sessions.</p>
                    <p>2. I will maintain confidentiality regarding all discussions.</p>
                    <p>3. I will be respectful and professional in all interactions.</p>
                    <p>4. I will provide constructive feedback when appropriate.</p>
                 </div>
                 <div className="mt-4 flex items-center">
                    <input id="terms" name="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-r-blue focus:ring-r-blue border-r-gray-300 rounded" />
                    <label htmlFor="terms" className="ml-2 block text-sm text-r-gray-900">I agree to the terms and conditions</label>
                </div>
            </div>
          </div>
          <div className="p-4 border-t bg-r-gray-50 text-right">
            <button
                type="submit"
                disabled={!agreed}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue disabled:bg-r-gray-400 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorPreferencesModal;