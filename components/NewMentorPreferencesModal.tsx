import React, { useState, FormEvent } from 'react';
import type { MentorPreferences } from '../types';
import { XIcon } from './Icons';

interface NewMentorPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: MentorPreferences) => void;
}

const defaultPreferences: MentorPreferences = {
  idealMentee: '',
  mentoringMeaning: '',
  maxMentees: 1,
};

const NewMentorPreferencesModal: React.FC<NewMentorPreferencesModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [prefs, setPrefs] = useState<MentorPreferences>(defaultPreferences);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;
  
  const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if(agreed) {
          onSubmit(prefs);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Set your Mentor Preferences</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">Ideal Mentee</h3>
                <textarea
                    value={prefs.idealMentee}
                    onChange={(e) => setPrefs({ ...prefs, idealMentee: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                    placeholder="Describe the qualities and aspirations of your ideal mentee..."
                    rows={3}
                    required
                />
            </div>
            
            <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">What Mentoring Means to Me</h3>
                <textarea
                    value={prefs.mentoringMeaning}
                    onChange={(e) => setPrefs({ ...prefs, mentoringMeaning: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                    placeholder="Share your philosophy and approach to mentoring..."
                    rows={3}
                    required
                />
            </div>

            <div className="p-4 border rounded-md">
                <h3 className="font-heading font-semibold mb-2 text-r-gray-800">Maximum Mentees</h3>
                <p className="text-sm text-r-gray-500 mb-2">Select the maximum number of mentees you can support at one time (up to 3).</p>
                <select
                    value={prefs.maxMentees}
                    onChange={(e) => setPrefs({ ...prefs, maxMentees: parseInt(e.target.value, 10) })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-r-gray-300 focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm rounded-md"
                >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                </select>
            </div>
            
            <div className="mt-4 flex items-center">
                <input id="mentor-terms" name="mentor-terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-r-blue focus:ring-r-blue border-r-gray-300 rounded" />
                <label htmlFor="mentor-terms" className="ml-2 block text-sm text-r-gray-900">I agree to the mentor terms and conditions.</label>
            </div>
          </div>
          <div className="p-4 border-t bg-r-gray-50 text-right">
            <button
                type="submit"
                disabled={!agreed || !prefs.idealMentee || !prefs.mentoringMeaning}
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

export default NewMentorPreferencesModal;
