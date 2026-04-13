import React from 'react';
import type { MentorMenteePair, AssignedCourse } from '../types';
import { XIcon } from './Icons';
import CourseCard from './CourseCard';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: MentorMenteePair | null;
}

const mockSessionAttendance = [
    { session: 'Kick-off and Introductions', status: 'Present' },
    { session: 'Workshop: System Design', status: 'Present' },
    { session: 'Mentee Project Presentations', status: 'Absent' },
    { session: 'Final Review', status: 'Upcoming' },
];

const mockCourses: AssignedCourse[] = [
    { id: 1, title: 'Leadership Principles', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1497032205566-5089c1a73938?w=400&h=225&fit=crop&q=80', tags: ['Leadership'], status: 'In Progress' },
    { id: 2, title: 'Advanced System Design', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop&q=80', tags: ['Online'], status: 'Completed' },
    { id: 3, title: 'Agile for Product Managers', provider: 'LinkedIn Learning', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&q=80', tags: ['Agile'], status: 'Not Started' },
];

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    let style = '';
    switch (status) {
        case 'Present':
            style = 'bg-green-100 text-green-800';
            break;
        case 'Absent':
            style = 'bg-red-100 text-red-800';
            break;
        case 'Upcoming':
            style = 'bg-yellow-100 text-yellow-800';
            break;
        default:
            style = 'bg-gray-100 text-gray-800';
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{status}</span>;
};

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({ isOpen, onClose, pair }) => {
  if (!isOpen || !pair) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Progress for {pair.mentee}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-8">
            {/* Session Attendance Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Attendance</h3>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white uppercase bg-r-blue">
                            <tr>
                                <th className="px-6 py-3">Session</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockSessionAttendance.map((item, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50 font-medium text-gray-700">
                                    <td className="px-6 py-4">{item.session}</td>
                                    <td className="px-6 py-4"><StatusPill status={item.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Course Progress Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Progress</h3>
                {mockCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockCourses.map(course => <CourseCard key={course.id} course={course} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">No courses assigned to this mentee.</p>
                )}
            </div>
        </div>
         <div className="p-4 border-t bg-r-gray-50 flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
