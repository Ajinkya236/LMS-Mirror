
import React, { useState } from 'react';
import { XIcon, StarIcon } from './Icons';

interface EndProgramFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: { rating: number; text: string }) => void;
  programTitle: string;
  title?: string;
  buttonText?: string;
}

const EndProgramFeedbackModal: React.FC<EndProgramFeedbackModalProps> = ({ isOpen, onClose, onConfirm, programTitle, title = "End Program & Provide Feedback", buttonText = "Submit & End Program" }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0 || text.trim() === '') {
      alert('Please provide a rating and feedback.');
      return;
    }
    onConfirm({ rating, text });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">{title}</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-r-gray-600">Please provide your feedback for the program: <span className="font-semibold">{programTitle}</span>. This will help us improve future programs.</p>
          <div>
            <label className="block text-sm font-medium text-r-gray-700">Overall Program Rating <span className="text-red-500">*</span></label>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className={`w-7 h-7 cursor-pointer ${rating > i ? 'text-yellow-400 fill-current' : 'text-r-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="feedback-text" className="block text-sm font-medium text-r-gray-700">Feedback <span className="text-red-500">*</span></label>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
              placeholder="What did you like about the program? What could be improved?"
            />
          </div>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndProgramFeedbackModal;
