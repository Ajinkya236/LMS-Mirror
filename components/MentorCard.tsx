
import React from 'react';
import type { Mentor } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface MentorCardProps {
  mentor: Mentor;
  onSendRequest: (mentor: Mentor) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onSendRequest }) => {
    return (
        <div 
            onClick={() => mentor.isAvailable && onSendRequest(mentor)}
            className={`bg-white rounded-xl shadow-sm p-4 text-left flex flex-col border border-r-gray-200 transition-all h-full group relative ${mentor.isAvailable ? 'cursor-pointer hover:shadow-md hover:border-r-blue-light' : 'opacity-75 cursor-not-allowed'}`}
        >
            <div className="flex items-start justify-between mb-3">
                <img className="w-16 h-16 rounded-full object-cover border border-gray-100" src={mentor.imageUrl} alt={mentor.name} />
                {/* Status Badge */}
                {mentor.isAvailable ? (
                     <span className="flex items-center px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-full border border-green-200">
                        <CheckCircleIcon className="w-3 h-3 mr-1"/> Available
                     </span>
                ) : (
                     <span className="flex items-center px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wide rounded-full border border-orange-200">
                        <XCircleIcon className="w-3 h-3 mr-1"/> Unavailable
                     </span>
                )}
            </div>
            
            <div className="mb-2 flex-grow">
                <h3 className="text-lg font-heading font-bold text-r-gray-900 leading-tight mb-1 group-hover:text-r-blue-dark transition-colors">{mentor.name}</h3>
                {/* Display Business and Vertical instead of Title */}
                <p className="text-sm text-r-gray-600 font-medium">
                    {mentor.business || 'Business'} <span className="text-gray-300 mx-1">|</span> {mentor.vertical || 'Vertical'}
                </p>
            </div>
        </div>
    );
};

export default MentorCard;
