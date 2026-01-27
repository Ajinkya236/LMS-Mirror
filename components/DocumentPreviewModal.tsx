import React from 'react';
import { XIcon, DownloadIcon } from './Icons';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string;
  title: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, docUrl, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-heading font-semibold text-r-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow flex flex-col justify-center items-center text-center p-8 bg-gray-100">
                    <h3 className="text-xl font-semibold text-gray-700">Preview Not Available</h3>
                    <p className="text-gray-500 mt-2">A live preview for this document type is not supported in this demo.</p>
                    <a
                        href={docUrl}
                        download
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download {title}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
