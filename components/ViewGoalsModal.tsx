import React from 'react';
import { XIcon } from './Icons';

interface ViewGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: string[];
  menteeName: string;
}

const ViewGoalsModal: React.FC<ViewGoalsModalProps> = ({ isOpen, onClose, goals, menteeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Goals for {menteeName}</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {goals.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside text-r-gray-800">
              {goals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-r-gray-500">No goals have been set by the mentee.</p>
          )}
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGoalsModal;
