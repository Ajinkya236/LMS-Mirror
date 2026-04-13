import React, { useState } from 'react';
import { XIcon } from './Icons';
import SearchableDropdown from './SearchableDropdown';

interface AspiredRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onSave: (role: string) => void;
}

const ROLES = [
  'Senior Engineer',
  'Lead Engineer',
  'Engineering Manager',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Sales Director',
  'Marketing Lead',
  'HR Business Partner',
  'CTO',
  'CEO'
];

const AspiredRoleModal: React.FC<AspiredRoleModalProps> = ({ isOpen, onClose, currentRole, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Select Aspired Role</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Choose the role you aspire to reach next. We'll personalize your learning recommendations based on this role.
          </p>
          <SearchableDropdown
            label="Aspired Job Role"
            options={ROLES}
            selected={selectedRole}
            onSelect={setSelectedRole}
            placeholder="Search roles..."
          />
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(selectedRole);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-r-blue hover:bg-r-blue-dark rounded-lg transition-colors"
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default AspiredRoleModal;
