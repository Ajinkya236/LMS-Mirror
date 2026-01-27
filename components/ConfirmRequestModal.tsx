
import React, { useState } from 'react';
import { XIcon } from './Icons';

interface ConfirmRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mentorName: string;
}

const ConfirmRequestModal: React.FC<ConfirmRequestModalProps> = ({ isOpen, onClose, onConfirm, mentorName }) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Are you sure you would like to send request?</h2>
        
        <p className="text-gray-600 mb-6 text-lg">
            Your request will be sent to {mentorName}. On acceptance of request by the mentor, you will be able to begin engagement with the mentor.
        </p>

        <div className="flex items-start mb-8">
            <input 
                id="confirm-guidelines" 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="mt-1 h-5 w-5 text-r-blue border-gray-300 rounded focus:ring-r-blue cursor-pointer" 
            />
            <label htmlFor="confirm-guidelines" className="ml-3 text-gray-700 cursor-pointer select-none">
                I confirm that I have understood all mentoring guidelines and will follow the same.
            </label>
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={onClose} 
                className="px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm}
                disabled={!agreed}
                className="px-8 py-3 text-lg font-semibold text-white bg-r-blue rounded-full hover:bg-r-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRequestModal;
