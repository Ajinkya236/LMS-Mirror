import React from 'react';
import type { Course } from '../types';
import { XIcon } from './Icons';

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  course: Course;
  menteeName: string;
}

const AssignCourseModal: React.FC<AssignCourseModalProps> = ({ isOpen, onClose, onSubmit, course, menteeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Assign Course</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-sm text-r-gray-700">You are about to assign the following course:</p>
            <div className="mt-2 p-3 bg-r-gray-50 rounded-md border">
                <p className="font-semibold text-r-gray-800">{course.title}</p>
                <p className="text-xs text-r-gray-500">{course.provider}</p>
            </div>
             <p className="mt-4 text-sm text-r-gray-700">To mentee:</p>
            <div className="mt-2 p-3 bg-r-gray-50 rounded-md border">
                <p className="font-semibold text-r-gray-800">{menteeName}</p>
            </div>
             <p className="mt-4 text-sm text-r-gray-600">The mentee will be notified and this course will be added to their active mentorship engagement.</p>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark"
            >
              Confirm & Assign
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCourseModal;