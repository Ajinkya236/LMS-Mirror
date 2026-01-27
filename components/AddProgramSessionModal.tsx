import React, { useState, FormEvent, useEffect } from 'react';
import type { ProgramSession } from '../types';
import { XIcon } from './Icons';

interface AddProgramSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: Omit<ProgramSession, 'id' | 'status' | 'attendees' | 'notes'>) => void;
  initialData?: ProgramSession | null;
}

type SessionFormData = Omit<ProgramSession, 'id' | 'status' | 'startTime' | 'endTime' | 'attendees' | 'notes'> & {
  date: string;
  startTime: string;
  endTime: string;
};

const AddProgramSessionModal: React.FC<AddProgramSessionModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    category: 'Workshop',
    date: '',
    startTime: '',
    endTime: '',
    agenda: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const startDate = new Date(initialData.startTime);
        const endDate = new Date(initialData.endTime);
        setFormData({
          title: initialData.title,
          category: initialData.category,
          date: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().substring(0, 5),
          endTime: endDate.toTimeString().substring(0, 5),
          agenda: initialData.agenda,
        });
      } else {
        // Reset form
        setFormData({
          title: '',
          category: 'Workshop',
          date: '',
          startTime: '',
          endTime: '',
          agenda: '',
        });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
        alert("End time must be after start time.");
        return;
    }
    onSubmit({
        title: formData.title,
        category: formData.category,
        agenda: formData.agenda,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const isFormValid = formData.title && formData.date && formData.startTime && formData.endTime && formData.agenda;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">{initialData ? 'Edit Program Session' : 'Add New Program Session'}</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-r-gray-700">Session Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
            </div>
            <div>
                 <label htmlFor="category" className="block text-sm font-medium text-r-gray-700">Category <span className="text-red-500">*</span></label>
                 <select name="category" id="category" value={formData.category} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-r-gray-300 focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm rounded-md">
                    <option>Onboarding</option>
                    <option>Workshop</option>
                    <option>Q&amp;A Session</option>
                    <option>Group Project</option>
                    <option>Closing Session</option>
                 </select>
            </div>
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-r-gray-700">Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-r-gray-700">Start Time <span className="text-red-500">*</span></label>
                    <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-r-gray-700">End Time <span className="text-red-500">*</span></label>
                    <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
                </div>
            </div>
             <div>
                <label htmlFor="agenda" className="block text-sm font-medium text-r-gray-700">Agenda / Description <span className="text-red-500">*</span></label>
                <textarea name="agenda" id="agenda" value={formData.agenda} onChange={handleInputChange} required rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm" />
            </div>
          </div>
          <div className="p-4 border-t bg-r-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50">Cancel</button>
            <button
                type="submit"
                disabled={!isFormValid}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue disabled:bg-r-gray-400 disabled:cursor-not-allowed"
            >
              {initialData ? 'Save Changes' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgramSessionModal;
