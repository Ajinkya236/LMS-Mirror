
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '../components/Icons';
import MentorSubHeader from '../components/MentorSubHeader';
import EndProgramConfirmationModal from '../components/EndProgramConfirmationModal';

// Mock data needed for the wizard
const mockMenteesForEnd = [
    { id: 'm1', name: 'Virat Kumar', empId: 'E101', mentorName: 'Tony Roy', mentorId: 'MEN01', sessionsCompleted: 3, totalSessions: 12, attendance: 60, mandatoryAttendance: 75, tasksCompleted: 8, totalTasks: 10, coursesCompleted: 2, coursesAssigned: 3 },
    { id: 'm2', name: 'Niraj Shah', empId: 'E102', mentorName: 'Rakesh Yadav', mentorId: 'MEN02', sessionsCompleted: 2, totalSessions: 12, attendance: 50, mandatoryAttendance: 75, tasksCompleted: 5, totalTasks: 10, coursesCompleted: 1, coursesAssigned: 3 },
    { id: 'm3', name: 'Benny Joe', empId: 'E103', mentorName: 'Aaron Smith', mentorId: 'MEN03', sessionsCompleted: 4, totalSessions: 12, attendance: 67, mandatoryAttendance: 75, tasksCompleted: 9, totalTasks: 10, coursesCompleted: 3, coursesAssigned: 3 },
    { id: 'm4', name: 'Monika Riya', empId: 'E104', mentorName: 'Vineet Kumar', mentorId: 'MEN04', sessionsCompleted: 3, totalSessions: 12, attendance: 100, mandatoryAttendance: 75, tasksCompleted: 10, totalTasks: 10, coursesCompleted: 2, coursesAssigned: 2 },
    { id: 'm5', name: 'Priyanka Singh', empId: 'E105', mentorName: 'Priya Pradeep', mentorId: 'MEN06', sessionsCompleted: 5, totalSessions: 12, attendance: 100, mandatoryAttendance: 75, tasksCompleted: 10, totalTasks: 10, coursesCompleted: 3, coursesAssigned: 3 },
];

const EndProgramPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const program = location.state?.program;

    // State for selections
    const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleMenteeToggle = (id: string) => {
        const newSelected = new Set(selectedMentees);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedMentees(newSelected);
    };

    const handleSelectAllMentees = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedMentees(new Set(mockMenteesForEnd.map(m => m.id)));
        } else {
            setSelectedMentees(new Set());
        }
    };

    const handleEndProgram = () => {
        setIsConfirmModalOpen(true);
    };

    const confirmEndProgram = () => {
        setIsConfirmModalOpen(false);
        // Logic to actually end program would go here
        // Navigate back to tracking page with 'Completed' status
        navigate(`/mentor/program-manager/track/${programId}`, { 
            state: { 
                program, 
                updatedStatus: 'Completed' 
            } 
        });
    };

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                                <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">End Program: {program?.title || 'Program'}</h1>
                                <p className="text-sm text-gray-500">Select mentees eligible for certification.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mentees Table */}
                    <div>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-white uppercase bg-r-blue">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input type="checkbox" onChange={handleSelectAllMentees} checked={selectedMentees.size === mockMenteesForEnd.length && mockMenteesForEnd.length > 0} className="rounded text-r-blue-dark focus:ring-r-blue-dark" />
                                        </th>
                                        <th className="px-4 py-3">Mentee Name</th>
                                        <th className="px-4 py-3">Emp ID</th>
                                        <th className="px-4 py-3">Mentor Name</th>
                                        <th className="px-4 py-3">Mentor ID</th>
                                        <th className="px-4 py-3">Sessions (Comp/Total)</th>
                                        <th className="px-4 py-3">Attendance %</th>
                                        <th className="px-4 py-3">Mandatory %</th>
                                        <th className="px-4 py-3">Tasks (Comp/Total)</th>
                                        <th className="px-4 py-3">Courses (Comp/Assigned)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockMenteesForEnd.map((mentee) => (
                                        <tr key={mentee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedMentees.has(mentee.id)} 
                                                    onChange={() => handleMenteeToggle(mentee.id)}
                                                    className="rounded text-r-blue focus:ring-r-blue" 
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{mentee.name}</td>
                                            <td className="px-4 py-3">{mentee.empId}</td>
                                            <td className="px-4 py-3">{mentee.mentorName}</td>
                                            <td className="px-4 py-3">{mentee.mentorId}</td>
                                            <td className="px-4 py-3">{mentee.sessionsCompleted}/{mentee.totalSessions}</td>
                                            <td className={`px-4 py-3 font-bold ${mentee.attendance >= mentee.mandatoryAttendance ? 'text-green-600' : 'text-red-600'}`}>
                                                {mentee.attendance}%
                                            </td>
                                            <td className="px-4 py-3">{mentee.mandatoryAttendance}%</td>
                                            <td className="px-4 py-3">{mentee.tasksCompleted}/{mentee.totalTasks}</td>
                                            <td className="px-4 py-3">{mentee.coursesCompleted}/{mentee.coursesAssigned}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50">Cancel</button>
                            <button 
                                onClick={handleEndProgram} 
                                className="px-6 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                End Program
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <EndProgramConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmEndProgram}
                selectedCount={selectedMentees.size}
            />
        </div>
    );
};

export default EndProgramPage;
