export interface FeedbackResponses {
  q1: number; // Application to job role (1-5)
  q2: number; // Relevance & comprehension (1-5)
  q3: number; // Course objectives met (1-5)
  q4: number; // Instructor explanation & support (1-5)
  q5: number; // Interactive & engaging environment (1-5)
  overallRating: number; // 1-5
  keyTakeaways: string;
  trainerFeedback: string;
  additionalComments: string;
}

export interface SessionParticipant {
  id: string;
  name: string;
  empCode: string;
  department: string;
  attendanceStatus: 'Present' | 'Late' | 'Absent';
  attendanceTime: string;
  assessmentScore: string;
  feedbackSubmitted: boolean;
  submittedAt?: string;
  feedbackResponses?: FeedbackResponses;
}

export interface ILTSession {
  id: string;
  title: string;
  courseName: string;
  facilitator: string;
  type: string;
  venue: string;
  mode: 'Virtual' | 'In-Person' | 'Hybrid';
  date: string;
  time: string;
  status: 'Completed' | 'Live' | 'Upcoming';
  academy: string;
  location: string;
  totalEnrolled: number;
  participants: SessionParticipant[];
}

export const mockILTSessions: ILTSession[] = [
  {
    id: 'session-comp-101',
    title: 'CSD_OneJio_NHT_Day 14 - OJCE011',
    courseName: 'CSD_OneJio_NHT_Day 14',
    facilitator: 'Chaudhari Sabina',
    type: 'Classroom Training with Assessment',
    venue: 'NHQ - Reliance Corporate Park, Navi Mumbai',
    mode: 'Hybrid',
    date: '22 Jan 2026',
    time: '08:47 AM - 05:40 PM',
    status: 'Completed',
    academy: 'CSD Academy',
    location: 'Mumbai',
    totalEnrolled: 5,
    participants: [
      {
        id: 'p-101',
        name: 'Ananya Sharma',
        empCode: 'EMP-84920',
        department: 'Customer Success & Experience',
        attendanceStatus: 'Present',
        attendanceTime: '08:52 AM - 05:42 PM',
        assessmentScore: '94 / 100',
        feedbackSubmitted: true,
        submittedAt: '22 Jan 2026, 05:48 PM',
        feedbackResponses: {
          q1: 5,
          q2: 5,
          q3: 5,
          q4: 5,
          q5: 4,
          overallRating: 5,
          keyTakeaways: 'Mastered OneJio NHT escalation workflows, SLA response matrix, and live diagnostic tools for rapid customer query resolution.',
          trainerFeedback: 'Chaudhari Sabina explained complex diagnostic tools clearly and answered every practical edge-case scenario with great patience.',
          additionalComments: 'Very practical session. Hands-on simulated tickets were extremely beneficial for our daily support operations.'
        }
      },
      {
        id: 'p-102',
        name: 'Rohan Kulkarni',
        empCode: 'EMP-73019',
        department: 'Network Operations Center',
        attendanceStatus: 'Present',
        attendanceTime: '08:50 AM - 05:40 PM',
        assessmentScore: '88 / 100',
        feedbackSubmitted: true,
        submittedAt: '22 Jan 2026, 05:52 PM',
        feedbackResponses: {
          q1: 4,
          q2: 5,
          q3: 4,
          q4: 5,
          q5: 4,
          overallRating: 4,
          keyTakeaways: 'Deep understanding of tier-2 incident escalation paths and cross-functional handoffs between NOC and Field Engineering.',
          trainerFeedback: 'Instructor was very knowledgeable and kept the session interactive throughout.',
          additionalComments: 'Would love an advanced follow-up session on automated alert handling.'
        }
      },
      {
        id: 'p-103',
        name: 'Priya Nair',
        empCode: 'EMP-61048',
        department: 'Quality & Compliance',
        attendanceStatus: 'Present',
        attendanceTime: '09:05 AM - 05:35 PM',
        assessmentScore: '91 / 100',
        feedbackSubmitted: false,
        submittedAt: undefined,
        feedbackResponses: undefined
      },
      {
        id: 'p-104',
        name: 'Vikramaditya Deshmukh',
        empCode: 'EMP-92811',
        department: 'Service Engineering',
        attendanceStatus: 'Present',
        attendanceTime: '08:58 AM - 05:40 PM',
        assessmentScore: '78 / 100',
        feedbackSubmitted: true,
        submittedAt: '22 Jan 2026, 06:10 PM',
        feedbackResponses: {
          q1: 4,
          q2: 4,
          q3: 4,
          q4: 4,
          q5: 3,
          overallRating: 4,
          keyTakeaways: 'Good refresher on system architecture, service delivery standards, and customer communication protocols.',
          trainerFeedback: 'Clear presentation style and solid domain expertise.',
          additionalComments: 'More time allocated for hands-on lab exercises would improve retention.'
        }
      },
      {
        id: 'p-105',
        name: 'Siddharth Verma',
        empCode: 'EMP-55102',
        department: 'Telecom Operations',
        attendanceStatus: 'Absent',
        attendanceTime: 'Not Attended',
        assessmentScore: 'N/A',
        feedbackSubmitted: false,
        submittedAt: undefined,
        feedbackResponses: undefined
      }
    ]
  },
  {
    id: 'session-comp-102',
    title: 'Home_DailyBriefing_5th Jan 2026 - Session 1',
    courseName: 'Home_DailyBriefing_5th Jan 2026',
    facilitator: 'AMIT MOHANTA',
    type: 'Classroom With Assessment',
    venue: 'NHQ Conference Room B',
    mode: 'Virtual',
    date: '05 Jan 2026',
    time: '06:00 AM - 02:30 PM',
    status: 'Completed',
    academy: 'Home Academy',
    location: 'Delhi',
    totalEnrolled: 4,
    participants: [
      {
        id: 'p-201',
        name: 'Kavya Patel',
        empCode: 'EMP-40192',
        department: 'JioFiber Home Operations',
        attendanceStatus: 'Present',
        attendanceTime: '06:00 AM - 02:30 PM',
        assessmentScore: '96 / 100',
        feedbackSubmitted: true,
        submittedAt: '05 Jan 2026, 02:45 PM',
        feedbackResponses: {
          q1: 5,
          q2: 5,
          q3: 5,
          q4: 5,
          q5: 5,
          overallRating: 5,
          keyTakeaways: 'Thorough insight into new home connection activation targets and customer onboarding checklists.',
          trainerFeedback: 'AMIT MOHANTA conducted an energetic briefing and addressed operational bottlenecks head-on.',
          additionalComments: 'Excellent start to the month.'
        }
      },
      {
        id: 'p-202',
        name: 'Aman Deep Singh',
        empCode: 'EMP-31204',
        department: 'Field Operations',
        attendanceStatus: 'Present',
        attendanceTime: '06:15 AM - 02:30 PM',
        assessmentScore: '82 / 100',
        feedbackSubmitted: false,
        submittedAt: undefined,
        feedbackResponses: undefined
      },
      {
        id: 'p-203',
        name: 'Sandeep Gupta',
        empCode: 'EMP-19482',
        department: 'Customer Relations',
        attendanceStatus: 'Present',
        attendanceTime: '06:05 AM - 02:25 PM',
        assessmentScore: '90 / 100',
        feedbackSubmitted: true,
        submittedAt: '05 Jan 2026, 03:00 PM',
        feedbackResponses: {
          q1: 5,
          q2: 4,
          q3: 5,
          q4: 4,
          q5: 4,
          overallRating: 4,
          keyTakeaways: 'Standardized messaging guidelines for daily subscriber updates.',
          trainerFeedback: 'Great communication and well paced.',
          additionalComments: 'Appreciated the concise slides.'
        }
      },
      {
        id: 'p-204',
        name: 'Sneha Reddy',
        empCode: 'EMP-28401',
        department: 'Quality Assurance',
        attendanceStatus: 'Absent',
        attendanceTime: 'Not Attended',
        assessmentScore: 'N/A',
        feedbackSubmitted: false,
        submittedAt: undefined,
        feedbackResponses: undefined
      }
    ]
  },
  {
    id: 'session-comp-103',
    title: 'CSD_OneJio_NHT_Day 9 - OJCE008',
    courseName: 'CSD_OneJio_NHT_Day 9',
    facilitator: 'Stefy Mathew',
    type: 'Classroom Training',
    venue: 'Bangalore Learning Hub',
    mode: 'Virtual',
    date: '12 Jan 2026',
    time: '09:00 AM - 06:00 PM',
    status: 'Completed',
    academy: 'CSD Academy',
    location: 'Bangalore',
    totalEnrolled: 3,
    participants: [
      {
        id: 'p-301',
        name: 'Rajesh Kumar',
        empCode: 'EMP-10293',
        department: 'Technical Support',
        attendanceStatus: 'Present',
        attendanceTime: '09:00 AM - 06:00 PM',
        assessmentScore: '89 / 100',
        feedbackSubmitted: true,
        submittedAt: '12 Jan 2026, 06:15 PM',
        feedbackResponses: {
          q1: 5,
          q2: 5,
          q3: 5,
          q4: 5,
          q5: 4,
          overallRating: 5,
          keyTakeaways: 'Effective resolution methods for broadband connectivity issues.',
          trainerFeedback: 'Stefy was interactive and provided real diagnostic scenarios.',
          additionalComments: 'Very informative course.'
        }
      },
      {
        id: 'p-302',
        name: 'Meera Menon',
        empCode: 'EMP-44821',
        department: 'Customer Care',
        attendanceStatus: 'Present',
        attendanceTime: '09:02 AM - 05:55 PM',
        assessmentScore: '95 / 100',
        feedbackSubmitted: false,
        submittedAt: undefined,
        feedbackResponses: undefined
      },
      {
        id: 'p-303',
        name: 'Arjun Das',
        empCode: 'EMP-30291',
        department: 'Technical Operations',
        attendanceStatus: 'Present',
        attendanceTime: '08:55 AM - 06:00 PM',
        assessmentScore: '87 / 100',
        feedbackSubmitted: true,
        submittedAt: '12 Jan 2026, 06:20 PM',
        feedbackResponses: {
          q1: 4,
          q2: 4,
          q3: 4,
          q4: 5,
          q5: 4,
          overallRating: 4,
          keyTakeaways: 'Troubleshooting techniques for 5G network latency.',
          trainerFeedback: 'Engaging session with clear slides.',
          additionalComments: 'Thank you for the detailed material.'
        }
      }
    ]
  }
];

export function getILTSessionById(id: string): ILTSession | undefined {
  return mockILTSessions.find(s => s.id === id);
}

export function getParticipantFeedback(sessionId: string, participantId: string): { session: ILTSession; participant: SessionParticipant } | undefined {
  const session = getILTSessionById(sessionId);
  if (!session) return undefined;
  const participant = session.participants.find(p => p.id === participantId);
  if (!participant) return undefined;
  return { session, participant };
}
