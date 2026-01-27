import React, { useState, FormEvent, useEffect } from 'react';
import { XIcon, PlusIcon, Trash2Icon } from './Icons';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goals: string[]) => void;
  initialGoals?: string[];
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose, onSubmit, initialGoals = [] }) => {
  const [goals, setGoals] = useState<string[]>(initialGoals);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGoals(initialGoals);
      setNewGoal('');
    }
  }, [isOpen, initialGoals]);
  
  if (!isOpen) return null;

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (indexToRemove: number) => {
    setGoals(goals.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      onSubmit(goals);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Set Your Mentorship Goals</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-4">
            <p className="text-sm text-r-gray-600">Define what you want to achieve during this mentorship. These goals can be updated anytime.</p>
            <div className="space-y-2">
                {goals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between bg-r-gray-50 p-2 rounded-md">
                        <p className="text-sm text-r-gray-800 flex-grow">{goal}</p>
                        <button type="button" onClick={() => handleRemoveGoal(index)} className="text-red-500 hover:text-red-700 ml-2">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {goals.length === 0 && <p className="text-sm text-r-gray-400 text-center py-2">No goals set yet.</p>}
            </div>
             <div className="flex items-center gap-2 pt-2">
                <input 
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGoal(); } }}
                    placeholder="Add a new goal"
                    className="flex-grow px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
                />
                <button type="button" onClick={handleAddGoal} className="p-2 text-white bg-r-blue rounded-md hover:bg-r-blue-dark">
                    <PlusIcon className="w-5 h-5"/>
                </button>
            </div>
          </div>
          <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark"
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalSettingModal;