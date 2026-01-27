import React from 'react';
import { XIcon } from './Icons';

interface MarkAsCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    sessionTitle: string;
    hasPendingTasks: boolean;
}

const MarkAsCompleteModal: React.FC<MarkAsCompleteModalProps> = ({ isOpen, onClose, onConfirm, sessionTitle, hasPendingTasks }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                 <h2 className="text-2xl font-bold text-gray-800">Are you sure you would like to mark the session as complete?</h2>
                 
                 {hasPendingTasks && (
                    <p className="mt-4 text-gray-600">
                        <strong>Note:</strong> Tasks to be completed as a part of session <span className="font-semibold">"{sessionTitle}"</span> are pending.
                    </p>
                 )}

                 <p className="mt-4 text-gray-600">On confirmation, session will be marked as completed.</p>
                
                 <div className="mt-8 flex justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-8 py-3 text-lg font-semibold text-white bg-r-blue rounded-full hover:bg-r-blue-dark"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkAsCompleteModal;
