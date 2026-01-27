
import React, { useState } from 'react';
import type { EngagementSession, MentorshipTask } from '../types';
import { ArrowLeftIcon, Edit2Icon, Trash2Icon, ChevronUpIcon, ChevronDownIcon, EyeIcon } from './Icons';
import TaskComponent from './TaskComponent';

interface SessionNotesTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: EngagementSession;
  userRole: 'mentor' | 'mentee';
  onNoteChange: (noteType: 'mentorNote' | 'menteeNote', value: string) => void;
  onTaskUpdate: (updatedTasks: MentorshipTask[]) => void;
  onEditSession?: () => void;
  onDeleteSession?: () => void;
}

const SessionNotesTasksModal: React.FC<SessionNotesTasksModalProps> = ({ 
    isOpen, 
    onClose, 
    session, 
    userRole, 
    onNoteChange, 
    onTaskUpdate,
    onEditSession,
    onDeleteSession
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);

  if (!isOpen) return null;

  // Mock link for display since it's not in the base type
  const sessionLink = "https://jiomeetpro.jio.com/guest?meetingId=5981493084&pwd=T2Vky&hostToken=5R3atUhdB6SD";

  const DetailRow: React.FC<{ label: string; value: string; isLink?: boolean }> = ({ label, value, isLink }) => (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1">
          <span className="text-sm font-medium text-gray-500">{label}:</span>
          <span className={`text-sm col-span-3 font-semibold ${isLink ? 'text-blue-600 break-all' : 'text-gray-900'}`}>
              {isLink ? <a href="#" onClick={e => e.preventDefault()}>{value}</a> : value}
          </span>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-heading font-bold text-gray-900">{session.title} - Notes and Tasks</h1>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Session Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                  <div className="flex items-center gap-4">
                      <h2 className="text-lg font-bold text-gray-900">Session Details</h2>
                      {(userRole === 'mentor' || userRole === 'mentee') && (
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              {onEditSession && (
                                <button onClick={onEditSession} className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit Session">
                                    <Edit2Icon className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteSession && (
                                <button onClick={onDeleteSession} className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100" title="Delete Session">
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                      )}
                  </div>
                  <button className="text-gray-500">
                      {isDetailsOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                  </button>
              </div>
              
              {isDetailsOpen && (
                  <div className="p-6 border-t border-gray-200 space-y-4 animate-fade-in-down">
                      <DetailRow label="Session Title" value={session.title} />
                      <DetailRow label="Session Description" value={session.agenda} />
                      <DetailRow label="Session Category" value={session.category} />
                      <DetailRow label="Date" value={new Date(session.startTime).toLocaleDateString('en-GB')} />
                      <DetailRow label="Time" value={`${new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} />
                      <DetailRow label="Session Link" value={sessionLink} isLink />
                  </div>
              )}
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsNotesOpen(!isNotesOpen)}
              >
                  <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                  <button className="text-gray-500">
                      {isNotesOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                  </button>
              </div>

              {isNotesOpen && (
                  <div className="p-6 border-t border-gray-200 space-y-8 animate-fade-in-down">
                      {/* Mentor Notes */}
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">Mentor Notes</h3>
                              <div className="group relative">
                                  <span className="text-xs bg-gray-200 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center cursor-help">i</span>
                                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-20">
                                      Notes will be visible to the mentee.
                                  </div>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">(Notes will be visible to the mentee.)</span>
                          </div>
                          
                          {userRole === 'mentor' ? (
                              <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Session Notes</p>
                                  <textarea
                                      value={session.notes?.mentorNote || ''}
                                      onChange={(e) => onNoteChange('mentorNote', e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                      rows={3}
                                      placeholder="Enter notes..."
                                  />
                              </div>
                          ) : (
                              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{session.notes?.mentorNote || 'No notes added by mentor.'}</p>
                              </div>
                          )}
                      </div>

                      {/* Mentee Notes */}
                      <div className="border-t pt-6">
                          <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900">Mentee Notes</h3>
                                  <div className="group relative">
                                      <span className="text-xs bg-gray-200 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center cursor-help">i</span>
                                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-20">
                                          Notes will be visible to the mentor.
                                      </div>
                                  </div>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">(Notes will be visible to the mentor.)</span>
                              </div>
                              {userRole === 'mentee' && (
                                  <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                                      <Edit2Icon className="w-4 h-4"/>
                                  </button>
                              )}
                          </div>

                          {userRole === 'mentee' ? (
                              <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Session Notes</p>
                                  <textarea
                                      value={session.notes?.menteeNote || ''}
                                      onChange={(e) => onNoteChange('menteeNote', e.target.value)}
                                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                      rows={3}
                                      placeholder="Enter notes..."
                                  />
                              </div>
                          ) : (
                              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{session.notes?.menteeNote || 'No notes added by mentee.'}</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>

          {/* Tasks Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsTasksOpen(!isTasksOpen)}
              >
                  <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
                  <button className="text-gray-500">
                      {isTasksOpen ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                  </button>
              </div>

              {isTasksOpen && (
                  <div className="p-6 border-t border-gray-200 animate-fade-in-down">
                      <TaskComponent tasks={session.tasks || []} onTaskUpdate={onTaskUpdate} userRole={userRole} />
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};
export default SessionNotesTasksModal;
