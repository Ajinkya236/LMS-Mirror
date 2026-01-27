import React from 'react';
import type { MentorSearchItem } from '../types';
import { XIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  program: MentorSearchItem;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onSubmit, program }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Share Program</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-sm text-r-gray-700 mb-1">Sharing program: <span className="font-semibold">{program.title}</span></p>
            <div>
                 <label htmlFor="share-id" className="block text-sm font-medium text-r-gray-700 mt-4">Enter Domain ID</label>
                <input type="text" name="share-id" id="share-id" placeholder="user.name@ril.com" className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
            </div>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark"
            >
              Share
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;