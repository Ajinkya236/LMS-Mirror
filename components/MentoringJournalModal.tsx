import React, { useState, FormEvent } from 'react';
import type { MenteeJournalEntry } from '../types';
import { XIcon } from './Icons';

interface MentoringJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newNote: string) => void;
  journalEntries: MenteeJournalEntry[];
}

const MentoringJournalModal: React.FC<MentoringJournalModalProps> = ({ isOpen, onClose, onSubmit, journalEntries }) => {
  const [newNote, setNewNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onSubmit(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-heading font-semibold text-r-gray-900">My Mentoring Journal</h2>
          <button onClick={onClose} className="text-r-gray-400 hover:text-r-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
            {journalEntries.length > 0 ? (
                journalEntries.map((entry, index) => (
                    <div key={index} className="bg-r-gray-50 p-3 rounded-md">
                        <p className="text-xs font-semibold text-r-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                        <p className="text-sm text-r-gray-800 mt-1 whitespace-pre-wrap">{entry.note}</p>
                    </div>
                ))
            ) : (
                <p className="text-r-gray-500 text-center py-4">Your journal is empty. Add your first note below.</p>
            )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t bg-r-gray-50">
            <label htmlFor="journal-note" className="sr-only">New Journal Entry</label>
            <textarea
                id="journal-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add your thoughts and reflections here..."
                rows={4}
                className="w-full px-3 py-2 bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue sm:text-sm"
            />
            <div className="text-right mt-2">
                <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-r-blue hover:bg-r-blue-dark disabled:bg-r-gray-400"
                >
                    Add Entry
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default MentoringJournalModal;