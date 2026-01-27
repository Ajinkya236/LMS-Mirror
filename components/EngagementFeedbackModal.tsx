import React, { useState } from 'react';
import type { EngagementFeedback, MentorshipParticipant } from '../types';
import { XIcon, StarIcon, CheckCircleIcon } from './Icons';

interface EngagementFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: EngagementFeedback) => void;
  participant: MentorshipParticipant;
  topic: string;
}

const EngagementFeedbackModal: React.FC<EngagementFeedbackModalProps> = ({ isOpen, onClose, onConfirm, participant, topic }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0 || text.trim() === '') {
      alert('Please provide a rating and your suggestions.');
      return;
    }
    const feedback: EngagementFeedback = { rating, text };
    onConfirm(feedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-r-gray-400 hover:text-r-gray-600 z-10">
            <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8 sm:p-12 overflow-y-auto">
            <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="mt-4 text-3xl font-heading font-bold text-r-gray-900">Congratulations!</h2>
                <p className="mt-2 text-r-gray-600">Congratulations on successfully completing your mentoring journey!</p>
                <p className="text-sm text-r-gray-500">Kindly enter your feedback and Click on End Engagement to download the certificate.</p>
            </div>

            <div className="mt-8 py-4 border-y">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src={participant.imageUrl} alt={participant.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h3 className="text-xl font-bold font-heading">{participant.name}</h3>
                            <p className="text-r-gray-500">{participant.title || participant.grade}</p>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-r-gray-500">Skills Being Developed</p>
                        <p className="font-semibold text-r-gray-800">{topic}</p>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-r-gray-500">End Date</p>
                        <p className="font-semibold text-r-gray-800">{new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8">
                <h4 className="text-lg font-semibold">How satisfied were you with the mentorship experience?</h4>
                <p className="text-sm text-r-gray-500">Rate on a scale of 1 to 5 your mentorship experience.</p>
                <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          onClick={() => setRating(i + 1)}
                          className={`w-10 h-10 cursor-pointer ${rating > i ? 'text-yellow-400 fill-current' : 'text-r-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-semibold">Suggestions and remarks.</h4>
                <textarea
                  id="feedback-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2 block w-full bg-transparent border-0 border-b border-r-gray-400 focus:outline-none focus:ring-0 focus:border-r-blue sm:text-sm p-2"
                  placeholder="Provide feedback related to the mentee, platform, overall process or any other remarks"
                  rows={2}
                />
            </div>

            <div className="mt-8 text-center">
                 <p className="text-sm text-r-gray-500">Note: By ending this engagement, no further sessions can be scheduled for this mentoring journey.</p>
                 <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-6 inline-flex justify-center py-3 px-12 border border-transparent shadow-sm text-lg font-medium rounded-full text-white bg-[#9d8fbf] hover:bg-[#8d7eb0]"
                 >
                    End Engagement
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementFeedbackModal;