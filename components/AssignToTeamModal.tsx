import React from 'react';
import type { MentorSearchItem } from '../types';
import { XIcon } from './Icons';

interface AssignToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  program: MentorSearchItem;
}

const mockReportees = [
    { id: 1, name: 'Ravi Kumar', employeeCode: 'EMP111' },
    { id: 2, name: 'Sunita Singh', employeeCode: 'EMP222' },
    { id: 3, name: 'Anil Desai', employeeCode: 'EMP333' },
];

const AssignToTeamModal: React.FC<AssignToTeamModalProps> = ({ isOpen, onClose, onSubmit, program }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">Assign to Team</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-sm text-r-gray-700">Assigning program: <span className="font-semibold">{program.title}</span></p>
            <p className="text-sm text-r-gray-600 mt-4 mb-2">Select reportees to assign this program to:</p>
            <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                {mockReportees.map(reportee => (
                    <div key={reportee.id} className="flex items-center">
                        <input id={`reportee-${reportee.id}`} type="checkbox" className="h-4 w-4 text-r-blue focus:ring-r-blue border-r-gray-300 rounded"/>
                        <label htmlFor={`reportee-${reportee.id}`} className="ml-3 block text-sm text-r-gray-800">
                            {reportee.name} <span className="text-r-gray-500">({reportee.employeeCode})</span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="button"
                onClick={onSubmit}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark"
            >
              Assign
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignToTeamModal;