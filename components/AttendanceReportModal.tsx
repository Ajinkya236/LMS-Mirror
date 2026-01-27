import React, { useState, useEffect } from 'react';
import type { EngagementSession, ProgramParticipant } from '../types';
import { XIcon } from './Icons';

interface AttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participants: ProgramParticipant[]) => void;
  session: EngagementSession;
  participants: ProgramParticipant[];
}

const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ isOpen, onClose, onSave, session, participants }) => {
  const [attendance, setAttendance] = useState<ProgramParticipant[]>([]);

  useEffect(() => {
    if (isOpen) {
        setAttendance([...participants]);
    }
  }, [isOpen, participants]);
  
  if (!isOpen) return null;

  const handleStatusChange = (participantId: string, status: ProgramParticipant['attendance']) => {
    setAttendance(prev => prev.map(p => p.id === participantId ? { ...p, attendance: status } : p));
  };
  
  const handleSave = () => {
    onSave(attendance);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-heading font-semibold text-r-gray-900">Attendance Report</h2>
            <p className="text-sm text-r-gray-600">{session.title} - {new Date(session.startTime).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
            <table className="w-full text-sm text-left text-r-gray-500">
                <thead className="text-xs text-r-gray-700 uppercase bg-r-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Participant Name</th>
                        <th scope="col" className="px-6 py-3">Grade</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance.map(participant => (
                        <tr key={participant.id} className="bg-white border-b">
                            <th scope="row" className="px-6 py-4 font-medium text-r-gray-900 whitespace-nowrap">
                                {participant.name}
                            </th>
                            <td className="px-6 py-4">{participant.grade}</td>
                            <td className="px-6 py-4">
                               <select 
                                    value={participant.attendance}
                                    onChange={(e) => handleStatusChange(participant.id, e.target.value as ProgramParticipant['attendance'])}
                                    className="text-xs p-1 border rounded-md"
                               >
                                   <option value="pending">Pending</option>
                                   <option value="present">Present</option>
                                   <option value="absent">Absent</option>
                               </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="button"
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark"
            >
              Save Attendance
            </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportModal;
