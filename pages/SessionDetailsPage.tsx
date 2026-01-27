
import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/Icons';
import MentorSubHeader from '../components/MentorSubHeader';
import type { MentorMenteePair } from '../types';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';

// Mock data for Session Attendance
const mockSessionAttendance = [
    { session: 'Kick-off and Introductions', status: 'Present', inTime: '10:00 AM', outTime: '11:00 AM' },
    { session: 'Workshop: System Design', status: 'Present', inTime: '02:05 PM', outTime: '04:00 PM' },
    { session: 'Mentee Project Presentations', status: 'Absent', inTime: null, outTime: null },
    { session: 'Final Review', status: 'Upcoming', inTime: null, outTime: null },
];

// Mock data for Tasks
const mockTasks = [
    { id: 1, name: 'Pre-read: Leadership Styles', description: 'Read the provided PDF on leadership styles.', type: 'Mandatory', status: 'Completed' },
    { id: 2, name: 'System Design Architecture Diagram', description: 'Submit the architecture diagram for your project.', type: 'Mandatory', status: 'Pending' },
    { id: 3, name: 'Feedback Survey', description: 'Complete the mid-program feedback survey.', type: 'Non-Mandatory', status: 'Not Started' },
    { id: 4, name: 'Code Review Checklist', description: 'Create a checklist for code reviews.', type: 'Mandatory', status: 'Completed' },
];

// Mock data for Courses
const mockCourses = [
    { id: 'C101', title: 'Leadership Principles', provider: 'Internal', status: 'In Progress' },
    { id: 'C102', title: 'Advanced System Design', provider: 'Internal', status: 'Completed' },
    { id: 'C103', title: 'Agile for Product Managers', provider: 'LinkedIn Learning', status: 'Not Started' },
    { id: 'C104', title: 'Effective Communication', provider: 'Coursera', status: 'Not Started' },
];

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    let style = '';
    switch (status) {
        case 'Present':
        case 'Completed':
            style = 'bg-green-100 text-green-800';
            break;
        case 'Absent':
            style = 'bg-red-100 text-red-800';
            break;
        case 'Upcoming':
        case 'Pending':
        case 'In Progress':
            style = 'bg-blue-100 text-blue-800';
            break;
        case 'Not Started':
            style = 'bg-yellow-100 text-yellow-800';
            break;
        default:
            style = 'bg-gray-100 text-gray-800';
    }
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style}`}>{status}</span>;
};

const StatCard: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className={`p-4 rounded-lg border ${colorClass}`}>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
    </div>
);

const SessionDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { programId } = useParams<{ programId: string }>();
    
    const pair = location.state?.pair as MentorMenteePair | undefined;
    const programTitle = location.state?.programTitle || 'Program';

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Program Manager', path: '/mentor/program-manager' },
        { label: 'Tracking', path: `/mentor/program-manager/track/${programId}` },
        { label: 'Progress Details', path: '#' },
    ];

    if (!pair) {
        return (
            <div className="p-8 flex flex-col items-center bg-r-gray-50 min-h-screen">
                <p className="text-gray-600">Data not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-r-blue hover:underline">Go Back</button>
            </div>
        );
    }

    const courseSummary = {
        total: mockCourses.length,
        notStarted: mockCourses.filter(c => c.status === 'Not Started').length,
        inProgress: mockCourses.filter(c => c.status === 'In Progress').length,
        completed: mockCourses.filter(c => c.status === 'Completed').length,
    };

    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-r-gray-900">Progress Details</h1>
                            <p className="text-sm text-r-gray-600 mt-1">Program: <span className="font-semibold">{programTitle}</span></p>
                        </div>
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-r-gray-600 hover:text-r-blue-dark">
                            <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-r-blue shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">Mentor</p>
                            <p className="text-lg font-semibold text-r-gray-900">{pair.mentor}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-green-500 shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">Mentee</p>
                            <p className="text-lg font-semibold text-r-gray-900">{pair.mentee}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Session Attendance Table */}
                        <div>
                            <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Session Attendance</h3>
                            <div className="overflow-hidden border rounded-lg shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-r-blue">
                                        <tr>
                                            <th className="px-4 py-3">Session Title</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Time Log</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockSessionAttendance.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{item.session}</td>
                                                <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                    {item.status === 'Present' 
                                                        ? `In: ${item.inTime} - Out: ${item.outTime}` 
                                                        : item.status === 'Absent' ? 'Absent' : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Task Completion Table */}
                        <div>
                            <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Task Completion Status</h3>
                            <div className="overflow-hidden border rounded-lg shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-r-blue">
                                        <tr>
                                            <th className="px-4 py-3">Task Name</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockTasks.map((task, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{task.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${task.type === 'Mandatory' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {task.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3"><StatusPill status={task.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Course Progress Section */}
                    <div>
                        <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4">Course Progress</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard label="Total Assigned" value={courseSummary.total} colorClass="bg-blue-50 text-blue-800 border-blue-100" />
                            <StatCard label="Not Started" value={courseSummary.notStarted} colorClass="bg-yellow-50 text-yellow-800 border-yellow-100" />
                            <StatCard label="In Progress" value={courseSummary.inProgress} colorClass="bg-indigo-50 text-indigo-800 border-indigo-100" />
                            <StatCard label="Completed" value={courseSummary.completed} colorClass="bg-green-50 text-green-800 border-green-100" />
                        </div>

                        {mockCourses.length > 0 ? (
                            <div className="overflow-hidden border rounded-lg shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-r-blue">
                                        <tr>
                                            <th className="px-4 py-3">Course ID</th>
                                            <th className="px-4 py-3">Course Title</th>
                                            <th className="px-4 py-3">Source</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockCourses.map((course, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{course.id}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{course.title}</td>
                                                <td className="px-4 py-3 text-gray-600">{course.provider}</td>
                                                <td className="px-4 py-3"><StatusPill status={course.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No courses assigned to this mentee.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsPage;
