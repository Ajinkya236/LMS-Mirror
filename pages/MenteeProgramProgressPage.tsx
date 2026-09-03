
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MentorSubHeader from '../components/MentorSubHeader';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, HourglassIcon, PlusIcon, CalendarIcon, MoreHorizontalIcon, Edit2Icon, Trash2Icon, EyeIcon, SettingsIcon } from '../components/Icons';
import type { ProgramEngagement, ProgramSession } from '../types';
import CourseCard from '../components/CourseCard';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Breadcrumbs';
import AddProgramSessionModal from '../components/AddProgramSessionModal';
import ProfileDossierModal from '../components/ProfileDossierModal';

const mockProgramData: { [id: string]: ProgramEngagement } = {
    'tech-mentoring': {
        id: 'tech-mentoring',
        title: 'Tech Mentoring Program',
        mentor: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Mentoring', 'Leadership', 'System Design'],
        mentoringType: 'Group',
        sessions: [
            { 
                id: 'ps1', 
                title: 'Kick-off and Introductions', 
                category: 'Onboarding', 
                startTime: '2024-08-10T10:00:00Z', 
                endTime: '2024-08-10T11:00:00Z', 
                status: 'completed', 
                agenda: 'Program overview and goal setting.', 
                attendees: [{menteeId: 'mentee1', status: 'present', joinTime: '10:01 AM', leaveTime: '11:00 AM'}, {menteeId: 'mentee2', status: 'present', joinTime: '10:00 AM', leaveTime: '10:59 AM'}, {menteeId: 'mentee3', status: 'absent'}], 
                notes: {mentorNote: 'Good kickoff session.', menteeNote: ''},
                tasks: [
                    { id: 't1', text: 'Pre-read: Program Guidelines', description: 'Read the program handbook and guidelines document.', isRequired: true, status: 'completed' },
                    { id: 't2', text: 'Setup Profile', description: 'Complete your mentee profile with relevant skills.', isRequired: true, status: 'completed' }
                ]
            },
            { 
                id: 'ps2', 
                title: 'Workshop: System Design', 
                category: 'Workshop', 
                startTime: '2024-08-17T10:00:00Z', 
                endTime: '2024-08-17T12:00:00Z', 
                status: 'upcoming', 
                agenda: 'Deep dive into scalable system design.', 
                attendees: [{menteeId: 'mentee1', status: 'pending'}, {menteeId: 'mentee2', status: 'pending'}, {menteeId: 'mentee3', status: 'pending'}], 
                notes: {mentorNote: 'Important session for all.', menteeNote: ''},
                tasks: [
                    { id: 't3', text: 'System Design Case Study', description: 'Prepare a high-level design for a URL shortener.', isRequired: true, status: 'pending' }
                ]
            },
        ],
        mentees: [
            { 
                id: 'mentee1', 
                name: 'Ravi Kumar', 
                grade: 'Software Engineer II', 
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [{id: 1, title: 'System Design 101', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'In Progress'}],
                dossier: { employeeCode: 'EMP101', email: 'ravi.kumar@ril.com', grade: 'L4', location: 'Bangalore', experience: '4 Years', business: 'Jio', segment: 'Engineering', function: 'Technology' }
            },
            { 
                id: 'mentee2', 
                name: 'Sunita Singh', 
                grade: 'Data Analyst', 
                imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [{id: 1, title: 'System Design 101', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'Completed'}],
                dossier: { employeeCode: 'EMP102', email: 'sunita.singh@ril.com', grade: 'L3', location: 'Mumbai', experience: '3 Years', business: 'Retail', segment: 'Analytics', function: 'Data' }
            },
            { 
                id: 'mentee3', 
                name: 'Amit Patel', 
                grade: 'Intern', 
                imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [{id: 1, title: 'System Design 101', provider: 'Internal', imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'Not Started'}],
                dossier: { employeeCode: 'EMP103', email: 'amit.patel@ril.com', grade: 'Intern', location: 'Pune', experience: '0 Years', business: 'Jio', segment: 'Engineering', function: 'Technology' }
            },
        ],
        goals: ['Master System Design', 'Improve code review skills'],
    },
    'active_prog_1': {
        id: 'active_prog_1',
        title: 'Data Science for All',
        mentor: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Machine Learning', 'Python', 'Data Visualization'],
        mentoringType: 'One-on-One',
        sessions: [
            { 
                id: 'ds1', 
                title: 'Intro to Data Science', 
                category: 'Onboarding', 
                startTime: '2024-08-01T10:00:00Z', 
                endTime: '2024-08-01T11:00:00Z', 
                status: 'completed', 
                agenda: 'Program overview and tools setup.', 
                attendees: [{ menteeId: 'mentee_ajinkya', status: 'present', joinTime: '10:00 AM', leaveTime: '11:00 AM' }, { menteeId: 'mentee_rahul', status: 'present', joinTime: '10:05 AM', leaveTime: '11:00 AM' }], 
                notes: {mentorNote: 'Good attendance.', menteeNote: ''},
                tasks: [
                    { id: 'ds_t1', text: 'Install Anaconda', description: 'Set up Python environment using Anaconda distribution.', isRequired: true, status: 'completed' },
                    { id: 'ds_t2', text: 'Complete Python Basics Quiz', description: 'Take the pre-assessment quiz on LMS.', isRequired: false, status: 'pending' }
                ]
            },
            { 
                id: 'ds2', 
                title: 'Python for Data Science', 
                category: 'Workshop', 
                startTime: '2024-09-01T10:00:00Z', 
                endTime: '2024-09-01T11:00:00Z', 
                status: 'upcoming', 
                agenda: 'Learn the basics of Pandas and NumPy.', 
                attendees: [{ menteeId: 'mentee_ajinkya', status: 'pending' }, { menteeId: 'mentee_rahul', status: 'pending' }], 
                notes: {mentorNote: '', menteeNote: ''},
                tasks: [
                    { id: 'ds_t3', text: 'Pandas Exercise', description: 'Complete the data manipulation exercise sheet.', isRequired: true, status: 'pending' }
                ]
            },
        ],
        mentees: [
            { 
                id: 'mentee_sandeep', 
                name: 'Sandeep Gupta', 
                grade: 'Senior Engineer', 
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [
                    {id: 3, title: 'Machine Learning A-Z', provider: 'Udemy', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'In Progress'}
                ],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            },
            { 
                id: 'mentee_rahul', 
                name: 'Rahul Verma', 
                grade: 'Associate Product Manager', 
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [
                    {id: 4, title: 'Python for Beginners', provider: 'Coursera', imageUrl: 'https://images.unsplash.com/photo-1513258496099-48162023ac90?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'In Progress'}
                ], 
                attendance: 'present',
                dossier: { employeeCode: 'E20045', email: 'rahul.verma@ril.com', grade: 'L4', location: 'Bangalore', experience: '3 Years', business: 'Reliance Retail', segment: 'Product', function: 'Product Management' }
            },
        ],
        goals: ['Master Python for data analysis', 'Build a predictive model'],
    },
    'completed_prog_1': {
        id: 'completed_prog_1',
        title: 'Tech Mentoring Program (Completed)',
        mentor: { name: 'Priya Sharma', title: 'Director of Engineering', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Leadership', 'Project Management'],
        mentoringType: 'Group',
        sessions: [
            { 
                id: 'cps1', 
                title: 'Program Conclusion', 
                category: 'Closing Session', 
                startTime: '2023-12-15T10:00:00Z', 
                endTime: '2023-12-15T11:00:00Z', 
                status: 'completed', 
                agenda: 'Final review and feedback.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'present', joinTime: '10:00 AM', leaveTime: '11:00 AM'}], 
                notes: {mentorNote: 'Program complete.', menteeNote: ''},
                tasks: [
                    { id: 'cp_t1', text: 'Submit Final Report', description: 'Upload the final project report.', isRequired: true, status: 'completed' },
                    { id: 'cp_t2', text: 'Program Feedback', description: 'Complete the feedback form.', isRequired: true, status: 'completed' }
                ]
            }
        ],
        mentees: [
            { 
                id: 'mentee_sandeep', 
                name: 'Sandeep Gupta', 
                grade: 'Senior Engineer', 
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80', 
                assignedCourses: [
                    {id: 5, title: 'Agile Leadership', provider: 'LinkedIn Learning', imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=225&fit=crop&q=80', tags:['Online'], status: 'Completed'}
                ],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            },
        ],
        goals: ['Complete all leadership modules', 'Lead a team project'],
    },
    'prog_1o1_closed': {
        id: 'prog_1o1_closed',
        title: 'Executive Leadership',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Leadership', 'Strategy'],
        mentoringType: 'One-on-One',
        sessions: [
            { 
                id: 's1', 
                title: 'Goal Setting', 
                category: 'Goal Setting', 
                startTime: '2024-08-05T10:00:00Z', 
                endTime: '2024-08-05T11:00:00Z', 
                status: 'completed', 
                agenda: 'Define goals.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'present', joinTime: '10:00 AM', leaveTime: '11:00 AM' }], 
                notes: {mentorNote: 'Goals defined.', menteeNote: ''},
                tasks: [
                    { id: 't1_cl', text: 'Define 3-Month Strategy', description: 'Outline strategic goals for the quarter.', isRequired: true, status: 'completed' }
                ]
            },
            { 
                id: 's2', 
                title: 'Strategic Review', 
                category: 'Review', 
                startTime: '2024-08-20T10:00:00Z', 
                endTime: '2024-08-20T11:00:00Z', 
                status: 'upcoming', 
                agenda: 'Review strategic plans.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'pending' }],
                tasks: [
                    { id: 't2_cl', text: 'Prepare Presentation', description: 'Prepare slides for the review meeting.', isRequired: true, status: 'pending' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_sandeep',
                name: 'Sandeep Gupta',
                grade: 'Senior Engineer',
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            }
        ],
        goals: ['Improve executive presence'],
    },
    'prog_1o1_open': {
        id: 'prog_1o1_open',
        title: 'Tech Leads Rising',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['System Design', 'Team Management'],
        mentoringType: 'One-on-One',
        sessions: [
            { 
                id: 's1', 
                title: 'Intro', 
                category: 'Intro', 
                startTime: '2024-08-08T10:00:00Z', 
                endTime: '2024-08-08T11:00:00Z', 
                status: 'completed', 
                agenda: 'Intro.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'present', joinTime: '10:00 AM', leaveTime: '11:00 AM' }],
                tasks: [
                    { id: 't1_op', text: 'Self Assessment', description: 'Complete the leadership self-assessment.', isRequired: true, status: 'completed' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_sandeep',
                name: 'Sandeep Gupta',
                grade: 'Senior Engineer',
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            }
        ],
        goals: ['Become a Tech Lead'],
    },
    'prog_group_open': {
        id: 'prog_group_open',
        title: 'Data Science for All',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Machine Learning', 'Data Analysis'],
        mentoringType: 'Group',
        sessions: [
            { 
                id: 's1', 
                title: 'Python Basics', 
                category: 'Workshop', 
                startTime: '2024-08-12T10:00:00Z', 
                endTime: '2024-08-12T12:00:00Z', 
                status: 'completed', 
                agenda: 'Python setup.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'present', joinTime: '10:00 AM', leaveTime: '12:00 PM' }],
                tasks: [
                    { id: 't1_go', text: 'Install Python', description: 'Install Python and IDE.', isRequired: true, status: 'completed' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_sandeep',
                name: 'Sandeep Gupta',
                grade: 'Senior Engineer',
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            }
        ],
        goals: ['Learn Python'],
    },
    'prog_group_closed': {
        id: 'prog_group_closed',
        title: 'Women in Tech Cohort 5',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Career Growth', 'Networking'],
        mentoringType: 'Group',
        sessions: [
            { 
                id: 's1', 
                title: 'Networking 101', 
                category: 'Workshop', 
                startTime: '2024-08-15T14:00:00Z', 
                endTime: '2024-08-15T16:00:00Z', 
                status: 'upcoming', 
                agenda: 'Networking skills.', 
                attendees: [{ menteeId: 'mentee_sandeep', status: 'pending' }],
                tasks: [
                    { id: 't1_gc', text: 'LinkedIn Profile Update', description: 'Update your LinkedIn profile with current role.', isRequired: true, status: 'pending' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_sandeep',
                name: 'Sandeep Gupta',
                grade: 'Senior Engineer',
                imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP12345', email: 'sandeep.gupta@ril.com', grade: 'L5', location: 'Mumbai', experience: '5 Years', business: 'Jio Platforms', segment: 'Engineering', function: 'Technology' }
            }
        ],
        goals: ['Build a network'],
    },
    'mentor_prog_1o1_closed': {
        id: 'mentor_prog_1o1_closed',
        title: 'Senior Mgmt Fast Track',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Strategic Leadership'],
        mentoringType: 'One-on-One',
        sessions: [
            { 
                id: 's1', 
                title: 'Strategy', 
                category: 'Discussion', 
                startTime: '2024-07-20T10:00:00Z', 
                endTime: '2024-07-20T11:00:00Z', 
                status: 'completed', 
                agenda: 'Strategy discussion.', 
                attendees: [{ menteeId: 'mentee_rahul', status: 'present', joinTime: '10:00 AM', leaveTime: '11:00 AM' }],
                tasks: [
                    { id: 't1_mc', text: 'Read Strategy Book', description: 'Read "Good Strategy Bad Strategy".', isRequired: true, status: 'completed' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_rahul',
                name: 'Rahul Verma',
                grade: 'Senior Manager',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'E20045', email: 'rahul.verma@ril.com', grade: 'L4', location: 'Bangalore', experience: '3 Years', business: 'Reliance Retail', segment: 'Product', function: 'Product Management' }
            }
        ],
        goals: ['Learn Strategy'],
    },
    'mentor_prog_1o1_open': {
        id: 'mentor_prog_1o1_open',
        title: 'Cloud Architecture',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Cloud Native'],
        mentoringType: 'One-on-One',
        sessions: [
             { 
                id: 's1_mo', 
                title: 'Cloud Basics', 
                category: 'Discussion', 
                startTime: '2024-08-25T10:00:00Z', 
                endTime: '2024-08-25T11:00:00Z', 
                status: 'upcoming', 
                agenda: 'Intro to cloud.', 
                attendees: [{ menteeId: 'mentee_sunita', status: 'pending' }],
                tasks: [
                    { id: 't1_mo', text: 'AWS Account Setup', description: 'Create a free tier AWS account.', isRequired: true, status: 'pending' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_sunita',
                name: 'Sunita Singh',
                grade: 'Architect',
                imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP102', email: 'sunita.singh@ril.com', grade: 'L3', location: 'Mumbai', experience: '3 Years', business: 'Retail', segment: 'Analytics', function: 'Data' }
            }
        ],
        goals: ['Master Cloud'],
    },
    'mentor_prog_group_open': {
        id: 'mentor_prog_group_open',
        title: 'Agile Transformation',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Agile'],
        mentoringType: 'Group',
        sessions: [
            { 
                id: 's1', 
                title: 'Scrum Basics', 
                category: 'Workshop', 
                startTime: '2024-08-05T10:00:00Z', 
                endTime: '2024-08-05T12:00:00Z', 
                status: 'upcoming', 
                agenda: 'Intro to Scrum.', 
                attendees: [{ menteeId: 'mentee1', status: 'pending' }, { menteeId: 'mentee2', status: 'pending' }],
                tasks: [
                    { id: 't1_mgo', text: 'Read Agile Manifesto', description: 'Read and understand the agile manifesto.', isRequired: true, status: 'pending' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee1',
                name: 'Dev 1',
                grade: 'Dev',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP201', email: 'dev1@ril.com', grade: 'L2', location: 'Remote', experience: '1 Year', business: 'Jio', segment: 'Engineering', function: 'Dev' }
            },
            {
                id: 'mentee2',
                name: 'Dev 2',
                grade: 'Dev',
                imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP202', email: 'dev2@ril.com', grade: 'L2', location: 'Remote', experience: '1.5 Years', business: 'Jio', segment: 'Engineering', function: 'Dev' }
            }
        ],
        goals: ['Learn Agile'],
    },
    'mentor_prog_group_closed': {
        id: 'mentor_prog_group_closed',
        title: 'High Potential Leaders',
        mentor: { name: 'Priya Sharma', title: 'Director', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80' },
        skillsCovered: ['Organizational Change'],
        mentoringType: 'Group',
        sessions: [
             { 
                id: 's1_mgc', 
                title: 'Change Management', 
                category: 'Workshop', 
                startTime: '2024-08-30T10:00:00Z', 
                endTime: '2024-08-30T12:00:00Z', 
                status: 'upcoming', 
                agenda: 'Leading change.', 
                attendees: [{ menteeId: 'mentee_lead', status: 'pending' }],
                tasks: [
                    { id: 't1_mgc', text: 'Case Study Prep', description: 'Read the assigned case study.', isRequired: true, status: 'pending' }
                ]
            }
        ],
        mentees: [
            {
                id: 'mentee_lead',
                name: 'Lead 1',
                grade: 'Lead',
                imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
                assignedCourses: [],
                dossier: { employeeCode: 'EMP301', email: 'lead1@ril.com', grade: 'L5', location: 'Delhi', experience: '7 Years', business: 'Jio', segment: 'Sales', function: 'Leadership' }
            }
        ],
        goals: ['Be a leader'],
    }
};

const MenteeProgramProgressPage: React.FC = () => {
    const { programId, menteeId } = useParams<{ programId: string, menteeId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State management for program data to allow adding sessions
    const [program, setProgram] = useState<ProgramEngagement | null>(null);
    const [mentee, setMentee] = useState<any>(null);

    useEffect(() => {
        if (programId && mockProgramData[programId]) {
            const prog = JSON.parse(JSON.stringify(mockProgramData[programId]));
            setProgram(prog);
            const foundMentee = prog.mentees.find((m: any) => m.id === menteeId);
            setMentee(foundMentee);
        }
    }, [programId, menteeId]);
    
    const userRole = location.state?.userRole || 'mentor';

    // Dynamic Tabs logic: "Sessions" tab only for One-on-One
    const TABS = useMemo(() => {
        const tabs = ['Session Attendance', 'Courses', 'Task Status'];
        if (program?.mentoringType === 'One-on-One') {
            tabs.unshift('Sessions');
        }
        return tabs;
    }, [program?.mentoringType]);

    const [activeTab, setActiveTab] = useState('');
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<ProgramSession | null>(null);
    const [isDossierOpen, setIsDossierOpen] = useState(false);

    useEffect(() => {
        if (TABS.length > 0 && !activeTab) {
            setActiveTab(TABS[0]);
        }
    }, [TABS, activeTab]);

    const handleSessionSubmit = (sessionData: any) => {
        setProgram(prev => {
            if (!prev) return prev;
            
            const newSession = {
                id: editingSession ? editingSession.id : `session-${Date.now()}`,
                ...sessionData,
                status: 'upcoming',
                attendees: prev.mentees.map((m: any) => ({ menteeId: m.id, status: 'pending' }))
            };

            let updatedSessions;
            if (editingSession) {
                updatedSessions = prev.sessions.map(s => s.id === editingSession.id ? { ...s, ...sessionData } : s);
            } else {
                updatedSessions = [...prev.sessions, newSession];
            }
            
            return { ...prev, sessions: updatedSessions };
        });
        setIsSessionModalOpen(false);
        setEditingSession(null);
    };

    if (!program || !mentee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-r-gray-50">
                <p className="text-xl text-r-gray-700">Data not found for this mentee in the selected program.</p>
                <button onClick={() => navigate(-1)} className="mt-4 flex items-center text-sm font-medium text-r-blue hover:underline">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Go Back
                </button>
            </div>
        );
    }

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Mentoring', path: '/mentor' },
        { label: 'Mentor Journey', path: '/mentor/mentor-journey' },
        { label: program.title, path: `/program-engagement/${programId}`, state: { userRole: 'mentor' } },
        { label: mentee.name, path: `/program-engagement/${programId}/mentee/${menteeId}` },
    ];

    const AttendanceStatusIcon: React.FC<{status?: string}> = ({status}) => {
        if (status === 'present') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'absent') return <XCircleIcon className="w-5 h-5 text-red-500" />;
        return <HourglassIcon className="w-5 h-5 text-r-gray-400" />;
    };

    const totalSessions = program.sessions.length;
    const attendedSessions = program.sessions.filter(s => 
        s.status === 'completed' && s.attendees?.some(a => a.menteeId === menteeId && a.status === 'present')
    ).length;
    const pendingCourses = mentee.assignedCourses.filter((c: any) => c.status === 'In Progress' || c.status === 'Not Started').length;
    const completedCourses = mentee.assignedCourses.filter((c: any) => c.status === 'Completed').length;
    
    const upcomingSession = program.sessions?.filter(s => s.status === 'upcoming').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
    
    return (
        <div className="bg-r-gray-50 min-h-screen">
            <MentorSubHeader />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
                
                {/* Dashboard Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <div className="flex items-center gap-4">
                        <img className="h-16 w-16 rounded-full" src={mentee.imageUrl} alt={mentee.name} />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-heading font-bold text-r-gray-900">{mentee.name}</h1>
                                <button onClick={() => setIsDossierOpen(true)} className="text-r-gray-400 hover:text-r-blue p-0.5 rounded-full hover:bg-r-blue-50 transition-colors">
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-r-gray-600">{mentee.grade}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-50 p-3 rounded-lg"><p className="text-2xl font-bold text-blue-800">{totalSessions}</p><p className="text-xs font-medium text-blue-700">Total Sessions</p></div>
                        <div className="bg-green-50 p-3 rounded-lg"><p className="text-2xl font-bold text-green-800">{attendedSessions}</p><p className="text-xs font-medium text-green-700">Attended</p></div>
                        <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-2xl font-bold text-yellow-800">{pendingCourses}</p><p className="text-xs font-medium text-yellow-700">Pending Courses</p></div>
                        <div className="bg-gray-100 p-3 rounded-lg"><p className="text-2xl font-bold text-gray-800">{completedCourses}</p><p className="text-xs font-medium text-gray-700">Completed Courses</p></div>
                    </div>
                </div>

                 <div className="border-b border-r-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab ? 'border-r-blue text-r-blue' : 'border-transparent text-r-gray-500 hover:text-r-gray-700 hover:border-r-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {activeTab === 'Sessions' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">Program Goals</h3>
                                    <div className="p-3 bg-blue-50/50 rounded-lg space-y-2">
                                        {(program.goals || []).map((goal, i) => (
                                            <div key={i} className="text-sm text-gray-700">{goal}</div>
                                        ))}
                                        {(!program.goals || program.goals.length === 0) && <p className="text-sm text-gray-500 italic">No specific goals set.</p>}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">Upcoming Session</h3>
                                    {upcomingSession ? (
                                        <div>
                                            <p className="font-semibold">{upcomingSession.title}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                {new Date(upcomingSession.startTime).toLocaleDateString()}, {new Date(upcomingSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No upcoming sessions.</p>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">Mentoring Sessions</h2>
                                        {/* Add Session button only visible if program is active */}
                                        {program.status === 'active' && (
                                            <button onClick={() => { setEditingSession(null); setIsSessionModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark">
                                                <PlusIcon className="w-4 h-4"/> Add Session
                                            </button>
                                        )}
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-r-blue text-white">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Session Title</th>
                                                    <th className="p-3 text-left font-semibold">Date &amp; Time</th>
                                                    <th className="p-3 text-left font-semibold">Action</th>
                                                    <th className="p-3 text-left font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {program.sessions.map(session => {
                                                    const attendance = session.attendees?.find(a => a.menteeId === menteeId);
                                                    return (
                                                        <tr key={session.id} className="border-b last:border-b-0">
                                                            <td className="p-3 font-medium text-r-gray-900">{session.title}</td>
                                                            <td className="p-3 text-r-gray-600">{new Date(session.startTime).toLocaleDateString('en-GB')} | {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    {program.status === 'active' && (
                                                                        <>
                                                                            <button onClick={() => { setEditingSession(session); setIsSessionModalOpen(true); }} className="p-1 rounded-full hover:bg-gray-200" title="Edit Session"><Edit2Icon className="w-4 h-4 text-gray-600"/></button>
                                                                            <button 
                                                                                onClick={() => navigate(`/session/${session.id}/notes`, { 
                                                                                    state: { 
                                                                                        session: session, 
                                                                                        userRole: userRole,
                                                                                        contextTitle: program.title
                                                                                    } 
                                                                                })} 
                                                                                className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                                                                                title="Manage Tasks & Notes"
                                                                            >
                                                                                <SettingsIcon className="w-4 h-4"/>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                    attendance?.status === 'present' ? 'bg-green-100 text-green-800' :
                                                                    attendance?.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {attendance?.status ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1) : 'Pending'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Session Attendance' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Session Attendance Log</h2>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-r-blue">
                                        <tr>
                                            <th scope="col" className="p-3 font-semibold">Session</th>
                                            <th scope="col" className="p-3 font-semibold">Date</th>
                                            <th scope="col" className="p-3 font-semibold">Status</th>
                                            <th scope="col" className="p-3 font-semibold">Timestamps</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {program.sessions.map(session => {
                                            const attendance = session.attendees?.find(a => a.menteeId === menteeId);
                                            return (
                                                <tr key={session.id} className="border-b last:border-b-0">
                                                    <td className="p-3 font-medium text-r-gray-900">{session.title}</td>
                                                    <td className="p-3 text-r-gray-600">{new Date(session.startTime).toLocaleDateString('en-GB')}</td>
                                                    <td className="p-3">
                                                        <span className="flex items-center gap-2 capitalize">
                                                            <AttendanceStatusIcon status={attendance?.status || 'pending'} />
                                                            {attendance?.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs text-r-gray-600">
                                                        {attendance?.joinTime && attendance?.leaveTime ? `${attendance.joinTime} - ${attendance.leaveTime}` : 'N/A'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Courses' && (
                         <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Assigned Courses ({mentee.assignedCourses.length})</h2>
                                <button onClick={() => navigate('/discover')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-r-blue rounded-full hover:bg-r-blue-dark">
                                    <PlusIcon className="w-4 h-4"/> Assign Course
                                </button>
                            </div>
                            {mentee.assignedCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {mentee.assignedCourses.map((course: any) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-r-gray-500">No courses assigned to this mentee.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'Task Status' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Mentee Task Status</h2>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-r-blue">
                                        <tr>
                                            <th className="p-3 font-semibold">Task Title</th>
                                            <th className="p-3 font-semibold">Description</th>
                                            <th className="p-3 font-semibold">Type</th>
                                            <th className="p-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {program.sessions.flatMap(session => session.tasks || []).length > 0 ? (
                                            program.sessions.flatMap(session => session.tasks || []).map((task, index) => (
                                                <tr key={task.id || index} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-900">{task.text}</td>
                                                    <td className="p-3 text-gray-600 max-w-xs">{task.description || '-'}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.isRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {task.isRequired ? 'Mandatory' : 'Optional'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                                            task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                            task.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-500">No tasks assigned in this program yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                 <AddProgramSessionModal 
                    isOpen={isSessionModalOpen} 
                    onClose={() => setIsSessionModalOpen(false)} 
                    onSubmit={handleSessionSubmit} 
                    initialData={editingSession} 
                />
                
                <ProfileDossierModal
                    isOpen={isDossierOpen}
                    onClose={() => setIsDossierOpen(false)}
                    participant={mentee}
                />
            </div>
        </div>
    );
};

export default MenteeProgramProgressPage;
