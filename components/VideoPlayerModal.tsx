import React from 'react';
import { XIcon } from './Icons';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoSrc, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-heading font-semibold text-r-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 flex-grow flex justify-center items-center bg-black">
                    <video controls autoPlay className="max-w-full max-h-[75vh]">
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerModal;
