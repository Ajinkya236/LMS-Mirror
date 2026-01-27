
import React from 'react';

interface TopicButtonProps {
  topic: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

const TopicButton: React.FC<TopicButtonProps> = ({ topic, isPrimary = false, onClick }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200";
  const primaryClasses = "bg-r-blue-50 text-r-blue-dark hover:bg-r-blue-100";
  const secondaryClasses = "bg-white border border-r-gray-300 text-r-gray-700 hover:bg-r-gray-100 hover:border-r-gray-400";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses}`}>
      {topic}
    </button>
  );
};

export default TopicButton;
