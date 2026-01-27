import React from 'react';

interface NotesComponentProps {
  note?: string;
  onNoteChange: (note: string) => void;
  userRole: 'mentor' | 'mentee';
}

const NotesComponent: React.FC<NotesComponentProps> = ({ note, onNoteChange, userRole }) => {
  const placeholder = userRole === 'mentor'
    ? "Add your private notes for this session..."
    : "Add your private notes for this session...";

  return (
    <div className="bg-r-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-r-gray-800 mb-2">{userRole === 'mentor' ? 'Mentor Notes' : 'My Notes'}</h4>
      <textarea
        value={note || ''}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 text-sm bg-white border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue"
      />
      <p className="text-xs text-r-gray-500 mt-1">These notes are only visible to you.</p>
    </div>
  );
};

export default NotesComponent;