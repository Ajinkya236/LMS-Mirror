
import React, { useState, FormEvent, ChangeEvent } from 'react';
import type { MentorshipTask } from '../types';
import { PlusIcon, UploadIcon, StarIcon, CheckCircleIcon, HourglassIcon, Edit2Icon, Trash2Icon, EyeIcon } from './Icons';

interface TaskComponentProps {
  tasks: MentorshipTask[];
  onTaskUpdate: (updatedTasks: MentorshipTask[]) => void;
  userRole: 'mentor' | 'mentee';
}

const TaskComponent: React.FC<TaskComponentProps> = ({ tasks, onTaskUpdate, userRole }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [isNewTaskRequired, setIsNewTaskRequired] = useState(true);
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submissionNote, setSubmissionNote] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [activeActionId, setActiveActionId] = useState<string | null>(null); // To toggle submission/feedback view in table

    const handleAddTask = (e: FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            const newTask: MentorshipTask = { 
                id: `task-${Date.now()}`, 
                text: newTaskText.trim(), 
                status: 'pending',
                isRequired: isNewTaskRequired,
                dueDate: newTaskDueDate || new Date().toISOString().split('T')[0] // Default to today if not set
            };
            onTaskUpdate([...tasks, newTask]);
            setNewTaskText('');
            setNewTaskDueDate('');
            setIsNewTaskRequired(true); // Reset to default
        }
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onTaskUpdate(tasks.filter(t => t.id !== taskId));
        }
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSubmissionFile(e.target.files[0]);
        }
    };

    const handleSubmission = (taskId: string) => {
        if (!submissionFile) {
            alert("Please select a file to submit.");
            return;
        }
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: 'submitted' as const, submission: { file: submissionFile, note: submissionNote } } : task
        );
        onTaskUpdate(updatedTasks);
        setSubmissionFile(null);
        setSubmissionNote('');
        setActiveActionId(null);
    };

    const handleFeedback = (taskId: string) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: 'completed' as const, feedback: { rating: feedbackRating, text: feedbackText } } : task
        );
        onTaskUpdate(updatedTasks);
        setFeedbackRating(0);
        setFeedbackText('');
        setActiveActionId(null);
    };

    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const styles = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'submitted': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles[status as keyof typeof styles]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="w-full">
            {/* Add Task Form (Mentor Only) */}
            {userRole === 'mentor' && (
                <form onSubmit={handleAddTask} className="mb-4 flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow px-3 py-2 text-sm bg-white text-r-gray-900 border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue"
                    />
                    <input 
                        type="date" 
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="px-3 py-2 text-sm bg-white text-r-gray-900 border border-r-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-r-blue focus:border-r-blue"
                    />
                    <div className="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            id="new-task-req"
                            checked={isNewTaskRequired} 
                            onChange={(e) => setIsNewTaskRequired(e.target.checked)}
                            className="h-4 w-4 text-r-blue border-gray-300 rounded focus:ring-r-blue"
                        />
                        <label htmlFor="new-task-req" className="text-sm text-gray-700 whitespace-nowrap">Mandatory</label>
                    </div>
                    <button type="submit" className="px-3 py-2 text-sm text-white bg-r-blue rounded-md hover:bg-r-blue-dark">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </form>
            )}

            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="text-white uppercase bg-r-blue">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Task</th>
                            <th className="px-4 py-3 font-semibold">Due Date</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map(task => (
                            <React.Fragment key={task.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {task.text}
                                        {task.isRequired && <span className="ml-2 text-xs text-red-500 font-normal">(Mandatory)</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={task.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            {/* Action to View Details/Submit/Grade */}
                                            <button 
                                                onClick={() => setActiveActionId(activeActionId === task.id ? null : task.id)} 
                                                className="text-r-blue hover:text-r-blue-dark"
                                                title="View Details"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Delete (Mentor Only) */}
                                            {userRole === 'mentor' && (
                                                <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title="Delete">
                                                    <Trash2Icon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {activeActionId === task.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={4} className="px-4 py-3">
                                            <div className="p-2 border rounded-md bg-white">
                                                {/* Mentee Pending: Submit Form */}
                                                {task.status === 'pending' && userRole === 'mentee' && (
                                                    <div className="space-y-3">
                                                        <h5 className="font-semibold text-gray-800">Submit Task</h5>
                                                        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-r-blue hover:file:bg-blue-100"/>
                                                        <textarea value={submissionNote} onChange={(e) => setSubmissionNote(e.target.value)} placeholder="Add a note..." rows={2} className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md"/>
                                                        <div className="flex justify-end">
                                                            <button onClick={() => handleSubmission(task.id)} disabled={!submissionFile} className="px-4 py-2 text-xs font-medium text-white bg-r-blue rounded-md hover:bg-r-blue-dark disabled:bg-gray-300">Submit</button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Mentor Pending: View status */}
                                                {task.status === 'pending' && userRole === 'mentor' && (
                                                    <p className="text-sm text-gray-500 italic">Waiting for mentee submission.</p>
                                                )}

                                                {/* Submitted: View & Grade */}
                                                {task.status === 'submitted' && (
                                                    <div className="space-y-3">
                                                        <div className="text-sm">
                                                            <p className="font-semibold text-gray-800">Submission:</p>
                                                            <p>File: <span className="text-r-blue underline cursor-pointer">{task.submission?.file.name}</span></p>
                                                            <p className="text-gray-600 bg-gray-100 p-2 rounded mt-1 italic">"{task.submission?.note}"</p>
                                                        </div>
                                                        {userRole === 'mentor' && (
                                                            <div className="border-t pt-2 mt-2">
                                                                <p className="font-semibold text-gray-800 mb-2">Provide Feedback:</p>
                                                                <div className="flex items-center mb-2">
                                                                    {[...Array(5)].map((_, i) => <StarIcon key={i} onClick={() => setFeedbackRating(i+1)} className={`w-5 h-5 cursor-pointer ${feedbackRating > i ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}/>)}
                                                                </div>
                                                                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Add feedback..." rows={2} className="w-full px-3 py-2 text-sm border rounded-md"/>
                                                                <div className="flex justify-end mt-2">
                                                                    <button onClick={() => handleFeedback(task.id)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Mark Complete</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {userRole === 'mentee' && <p className="text-sm text-blue-600 italic">Submitted. Waiting for mentor review.</p>}
                                                    </div>
                                                )}

                                                {/* Completed: View Feedback */}
                                                {task.status === 'completed' && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                            <span className="font-semibold text-green-700">Task Completed</span>
                                                        </div>
                                                        <div className="bg-gray-100 p-3 rounded-md">
                                                            <p className="font-semibold text-xs text-gray-500 uppercase">Feedback</p>
                                                            <div className="flex items-center mt-1 mb-2">
                                                                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${task.feedback && task.feedback.rating > i ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}/>)}
                                                            </div>
                                                            <p className="text-sm text-gray-800 italic">"{task.feedback?.text}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No tasks assigned.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskComponent;
