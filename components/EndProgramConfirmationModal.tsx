
import React from 'react';
import { XIcon } from './Icons';

interface EndProgramConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

const EndProgramConfirmationModal: React.FC<EndProgramConfirmationModalProps> = ({ isOpen, onClose, onConfirm, selectedCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">End Program</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-base text-r-gray-800">
                {selectedCount === 0 
                    ? "No mentees selected for certification. Are you sure you want to end the program?" 
                    : `You have selected ${selectedCount} mentees for certification. Are you sure you want to end the program?`
                }
            </p>
            <p className="text-sm text-gray-500 mt-3">This action cannot be undone.</p>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="button"
                onClick={onConfirm}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Confirm & End
            </button>
        </div>
      </div>
    </div>
  );
};

export default EndProgramConfirmationModal;
