
import React, { useState } from 'react';
import { XIcon } from './Icons';

interface AssignToContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedIds: string[]) => void;
  title: string;
  options: { id: string; label: string; subLabel?: string }[];
  contextName: string; // e.g. "Mentee" or "Program"
}

const AssignToContextModal: React.FC<AssignToContextModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title, 
    options,
    contextName 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(new Set(options.map(o => o.id)));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSubmit = () => {
      onSubmit(Array.from(selectedIds));
      setSelectedIds(new Set());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">{title}</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            <p className="text-sm text-r-gray-600 mb-4">Select the {contextName.toLowerCase()}s you want to assign this course to:</p>
            
            <div className="flex items-center mb-2 px-2">
                <input 
                    id="select-all" 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.size === options.length && options.length > 0}
                    className="h-4 w-4 text-r-blue focus:ring-r-blue border-r-gray-300 rounded"
                />
                <label htmlFor="select-all" className="ml-3 block text-sm font-medium text-r-gray-700">Select All</label>
            </div>

            <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50">
                {options.length > 0 ? (
                    options.map(option => (
                        <div key={option.id} className="flex items-center p-2 hover:bg-white rounded-md transition-colors">
                            <input 
                                id={`opt-${option.id}`} 
                                type="checkbox" 
                                checked={selectedIds.has(option.id)}
                                onChange={() => handleToggle(option.id)}
                                className="h-4 w-4 text-r-blue focus:ring-r-blue border-r-gray-300 rounded"
                            />
                            <label htmlFor={`opt-${option.id}`} className="ml-3 block w-full cursor-pointer">
                                <span className="text-sm font-medium text-r-gray-900 block">{option.label}</span>
                                {option.subLabel && <span className="text-xs text-r-gray-500 block">{option.subLabel}</span>}
                            </label>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No active {contextName.toLowerCase()}s found.</p>
                )}
            </div>
        </div>
        <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Assign ({selectedIds.size})
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignToContextModal;
