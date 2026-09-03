import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, EyeIcon, ChevronDownIcon } from '../components/Icons';

const FilterField: React.FC<{ label: string; placeholder: string }> = ({ label, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-r-gray-900">{label}</label>
        <div className="relative">
            <input 
                type="text" 
                placeholder={placeholder} 
                className="w-full px-4 py-2.5 border border-r-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-r-blue/20 transition-all pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-4 h-4 rounded-full border-2 border-r-gray-300"></div>
            </div>
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (val: string) => void; options: { label: string; value: string }[] }> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-r-gray-900">{label}</label>
        <div className="relative">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-r-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-r-blue/20 transition-all appearance-none cursor-pointer pr-10"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDownIcon className="w-4 h-4 text-r-gray-500" />
            </div>
        </div>
    </div>
);

const EvaluatorDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [dashboardType, setDashboardType] = useState<'evaluator' | 'proctoring'>('evaluator');
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [durationFilter, setDurationFilter] = useState('All');

    const mockData = [
        { id: 1, state: 'Mumbai', joType: 'NHQ', empCode: '55077420', empName: 'Sandeep Gupta', courseName: 'Service Foundations', courseId: 'C-2041', lessonName: 'Video Assessment (28489)', status: 'Pending', activityName: 'OJT ACTIVITY TEST (25288)', redFlags: 24 },
        { id: 2, state: 'Mumbai', joType: 'NHQ', empCode: '55077420', empName: 'Sandeep Gupta', courseName: 'Safety Protocols', courseId: 'C-9901', lessonName: 'OJT module (28409)', status: 'Pending', activityName: 'OJT ACTIVITY TEST (25288)', redFlags: 12 },
        { id: 3, state: 'Delhi', joType: 'Field', empCode: '52219081', empName: 'Ravi Verma', courseName: 'Advanced Retail', courseId: 'C-3112', lessonName: 'Final Quiz (11029)', status: 'Pending', activityName: 'QUIZ LEVEL 2 (9901)', redFlags: 5 },
    ];

    const menuButtonClasses = (type: 'evaluator' | 'proctoring') => 
        `px-6 py-2 font-bold rounded-full shadow-md text-sm transition-all ${
            dashboardType === type 
            ? 'bg-r-blue text-white' 
            : 'bg-r-gray-100 text-r-gray-600 hover:bg-r-gray-200'
        }`;

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-r-blue" />
                    </button>
                    <h1 className="text-2xl font-heading font-bold text-r-gray-900">
                        {dashboardType === 'evaluator' ? 'Evaluator Dashboard' : 'Proctoring Evaluation Dashboard'}
                    </h1>
                </div>

                <div className="mb-8 flex gap-4">
                    <button 
                        onClick={() => setDashboardType('evaluator')}
                        className={menuButtonClasses('evaluator')}
                    >
                        Evaluator
                    </button>
                    <button 
                        onClick={() => setDashboardType('proctoring')}
                        className={menuButtonClasses('proctoring')}
                    >
                        Proctoring Evaluation
                    </button>
                </div>

                <div className="bg-white rounded-xl mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-8 mb-6">
                        <FilterField label="Select User" placeholder="Search User" />
                        <FilterField label="Select Module" placeholder="Search Module" />
                        <FilterField label="Select Activity" placeholder="Search Activity" />
                        
                        {dashboardType === 'evaluator' ? (
                            <>
                                <FilterField label="Select Jio State" placeholder="Search Jio State" />
                                <FilterField label="Select JIO Type" placeholder="Search JIO Type" />
                            </>
                        ) : (
                            <>
                                <FilterField label="Select Course Name" placeholder="Search Course Name" />
                                <SelectField 
                                    label="Sort by Duration" 
                                    value={durationFilter}
                                    onChange={setDurationFilter}
                                    options={[
                                        { label: 'All Time', value: 'All' },
                                        { label: 'Last 3 Months', value: '3' },
                                        { label: 'Last 6 Months', value: '6' },
                                        { label: 'Last 9 Months', value: '9' },
                                        { label: 'Last 12 Months', value: '12' },
                                    ]}
                                />
                            </>
                        )}
                        
                        <div className="flex items-end gap-4 h-full pt-1.5">
                            <button className="flex-1 px-6 py-2.5 bg-r-blue text-white font-bold rounded-full shadow-sm hover:bg-r-blue-dark transition-colors text-sm">
                                Apply Filters
                            </button>
                            <button 
                                onClick={() => setDurationFilter('All')}
                                className="flex-1 px-6 py-2.5 bg-white text-r-blue border border-r-blue font-bold rounded-full hover:bg-blue-50 transition-colors text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Tabs - Only show for Evaluator Dashboard */}
                {dashboardType === 'evaluator' && (
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-r-blue text-white shadow-md' : 'bg-r-gray-100 text-r-gray-600 hover:bg-r-gray-200'}`}
                        >
                            Pending
                        </button>
                        <button 
                            onClick={() => setActiveTab('completed')}
                            className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-r-blue text-white shadow-md' : 'bg-r-gray-100 text-r-gray-600 hover:bg-r-gray-200'}`}
                        >
                            Completed
                        </button>
                    </div>
                )}

                <div className="border border-r-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-r-blue text-white">
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">ID</th>
                                {dashboardType === 'evaluator' && <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">State</th>}
                                {dashboardType === 'evaluator' && <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">JO - Type</th>}
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Employee Code</th>
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Employee Name</th>
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Course Name (id)</th>
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Lesson Name (id)</th>
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Lesson Status</th>
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Activity Name (id)</th>
                                {dashboardType === 'proctoring' && <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Number of Red flags</th>}
                                <th className="px-4 py-4 font-bold border-r border-white/20 last:border-r-0">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {mockData.map(row => (
                                <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors text-black">
                                    <td className="px-4 py-4 border-r text-black">{row.id}</td>
                                    {dashboardType === 'evaluator' && <td className="px-4 py-4 border-r text-black">{row.state}</td>}
                                    {dashboardType === 'evaluator' && <td className="px-4 py-4 border-r text-black">{row.joType}</td>}
                                    <td className="px-4 py-4 border-r font-medium text-black">{row.empCode}</td>
                                    <td className="px-4 py-4 border-r font-medium text-black">{row.empName}</td>
                                    <td className="px-4 py-4 border-r text-black">{`${row.courseName} (${row.courseId})`}</td>
                                    <td className="px-4 py-4 border-r text-black">{row.lessonName}</td>
                                    <td className="px-4 py-4 border-r text-black">
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{row.status}</span>
                                    </td>
                                    <td className="px-4 py-4 border-r text-black">{row.activityName}</td>
                                    {dashboardType === 'proctoring' && <td className="px-4 py-4 border-r text-center font-black text-red-600">{row.redFlags}</td>}
                                    <td className="px-4 py-4">
                                        {dashboardType === 'evaluator' ? (
                                            <button className="px-4 py-1.5 bg-white text-r-blue border border-r-blue font-bold rounded-full hover:bg-blue-50 transition-colors text-xs">
                                                Evaluate
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => navigate(`/evaluation/proctoring-report/${row.id}`, { state: { reportData: row } })}
                                                className="px-4 py-1.5 bg-r-blue text-white font-bold rounded-full hover:bg-r-blue-dark transition-colors text-xs flex items-center gap-1.5"
                                            >
                                                <EyeIcon className="w-3.5 h-3.5" /> View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EvaluatorDashboardPage;