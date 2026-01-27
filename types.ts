
// types.ts

export interface Course {
  id: number | string;
  title: string;
  provider: string;
  imageUrl: string;
  tags: string[];
}

export interface AssignedCourse extends Course {
  status: 'Completed' | 'In Progress' | 'Not Started';
}

export interface CarouselItem {
  id: number;
  badge: string;
  title: string;
  description: string;
  media: {
    type: 'image' | 'video';
    src: string;
    alt: string;
  };
  cta?: {
    text: string;
    link: string;
  };
}

export interface Benefit {
  title: string;
  description:string;
}

export interface MenteePreferences {
  name: string;
  employeeCode: string;
  email: string;
  grade: string;
  location: string;
  experience: string;
  mentoringNeeds: string;
  idealMentor: string;
  preferredTopics: string[];
}

export interface MentorPreferences {
    idealMentee: string;
    mentoringMeaning: string;
    maxMentees: number;
}

export interface MentorSearchItem {
    id: string;
    title: string;
    type: 'topic' | 'program';
    imageUrl: string;
    description: string;
    isAvailable?: boolean;
    proficiencyLevel?: string;
    duration?: string;
    creditHours?: string;
    contactPerson?: { name: string; email: string };
    academy?: string;
    location?: string;
    assignedOn?: string;
    learningObjectives?: string[];
    skillsCovered?: string[];
    mentoringType?: 'Group' | 'One-on-One' | 'Group Mentoring Program';
    maxMentees?: number;
    programDurationDays?: number;
    expectedSessions?: number;
    attendanceRequiredPercent?: number;
    sessionOutline?: { title: string; details: string; }[];
    videos?: { title: string; thumbnailUrl: string; videoSrc: string; }[];
    mentorApplicationStartDate?: string;
    mentorApplicationEndDate?: string;
    menteeEnrollmentStartDate?: string;
    menteeEnrollmentEndDate?: string;
    sessions?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    mentors?: number;
    mentees?: number;
    objective?: string;
    menteesPerMentor?: number;
    durationMin?: number;
    durationMax?: number;
    referenceDocs?: { title: string; url: string; uploadedBy: string; date: string; }[];
    aboutProgramDocs?: { title: string; url: string; uploadedBy: string; date: string; }[];
    programType?: 'Open' | 'Closed';
    isShareable?: boolean;
    // Step 2
    minMentorLevel?: string;
    menteeLevel?: string;
    levelDifference?: string;
    mentorCriteria?: any[];
    menteeCriteria?: any[];
    // Step 3
    notifications?: any;
    feedbackForms?: any;
    certificates?: { mentor: string; mentee: string; };
    mentorLocation?: string;
    mentorDepartment?: string;
    vertical?: string;
}

export interface Mentor {
    id: number;
    name: string;
    title: string;
    imageUrl: string;
    isAvailable: boolean;
    expertise: string[];
    mentoringMeaning: string;
    idealMentee: string;
    vertical?: string;
    business?: string;
    employeeCode?: string;
    email?: string;
    grade?: string;
    location?: string;
    experience?: string;
    segment?: string;
    function?: string;
}

export interface Dossier {
    employeeCode: string;
    email: string;
    grade: string;
    location: string;
    experience: string;
    business: string;
    segment: string;
    function: string;
}

export interface MentorshipParticipant {
    name: string;
    title?: string; // For mentor
    grade?: string; // For mentee
    imageUrl: string;
    dossier?: Dossier;
    // Extended fields for Request Card details
    idealMentee?: string;
    mentoringMeaning?: string;
    mentoringType?: 'Group' | 'One-on-One' | 'Group Mentoring' | 'One to One';
    programType?: 'Open' | 'Closed';
    description?: string;
}

export type MentorshipRequestStatus = 'pending_mentor' | 'pending_program' | 'rejected_mentor' | 'rejected_program' | 'accepted' | 'completed' | 'mentor_pending_program' | 'mentor_accepted_program' | 'mentor_rejected_program';

export interface MentorshipRequest {
    id: string;
    mentee: MentorshipParticipant;
    mentor: MentorshipParticipant;
    topic: string;
    status: MentorshipRequestStatus;
    submittedDate: string;
    noteToMentor?: string;
    goals?: string;
    rejectionReason?: string;
}

export interface MentorshipTask {
    id: string;
    text: string;
    status: 'pending' | 'submitted' | 'completed';
    isRequired?: boolean;
    dueDate?: string;
    submission?: {
        file: File;
        note: string;
    };
    feedback?: {
        rating: number;
        text: string;
    };
    description?: string;
}

export interface EngagementSession {
    id: string;
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    status: 'completed' | 'upcoming' | 'cancelled';
    agenda: string;
    notes?: {
        mentorNote?: string;
        menteeNote?: string;
    };
    tasks?: MentorshipTask[];
}

export interface MenteeJournalEntry {
    date: string;
    note: string;
}

export interface EngagementFeedback {
    rating: number;
    text: string;
    testimonial?: string;
}

export interface ActiveMentorship {
    id: string;
    participant: MentorshipParticipant;
    topic: string;
    startDate: string;
    status: 'active' | 'completed';
    sessions?: EngagementSession[];
    journal?: MenteeJournalEntry[];
    assignedCourses?: AssignedCourse[];
    goals?: string[];
    feedback?: EngagementFeedback;
    mentoringType?: 'Group' | 'One-on-One' | 'Group Mentoring Program';
    programType?: 'Open' | 'Closed';
}

export interface ProgramParticipant {
    id: string;
    name: string;
    grade: string;
    imageUrl: string;
    attendance?: 'present' | 'absent' | 'pending';
    dossier?: Dossier;
}

export interface ProgramMentee extends ProgramParticipant {
    assignedCourses: AssignedCourse[];
}

export interface ProgramSessionAttendee {
    menteeId: string;
    status: 'present' | 'absent' | 'pending';
    joinTime?: string;
    leaveTime?: string;
}

export interface ProgramSession {
    id: string;
    title: string;
    category: string;
    startTime: string;
    endTime: string;
    status: 'completed' | 'upcoming' | 'cancelled';
    agenda: string;
    attendees?: ProgramSessionAttendee[];
    notes?: {
        mentorNote?: string;
        menteeNote?: string;
    };
    tasks?: MentorshipTask[];
}

export interface ProgramEngagement {
    id: string;
    title: string;
    imageUrl?: string;
    mentor: MentorshipParticipant;
    skillsCovered: string[];
    sessions: ProgramSession[];
    mentees: ProgramMentee[];
    journal?: MenteeJournalEntry[];
    referenceDocs?: { title: string; url: string; uploadedBy: string; date: string; }[];
    expectedSessions?: number;
    attendanceRequiredPercent?: number;
    goals?: string[];
    sessionOutline?: { title: string; details: string; }[];
    mentoringType?: 'Group' | 'One-on-One';
    programType?: 'Open' | 'Closed';
    status?: 'active' | 'completed';
}

export interface MentorMenteePair {
  mentor: string;
  mentee: string;
  sessionsCreated: number;
  sessionsCompleted: number;
  totalSessions: number;
  attendancePercent: number;
  nextSessionDate: string;
}

export interface AppliedMentor {
    id: string;
    name: string;
    email: string;
    grade: string;
    location: string;
    department: string;
    certification: 'Yes' | 'No';
    rating: number;
    menteesMentored: number;
}

export interface AppliedMentee {
    id: string;
    name: string;
    email: string;
    grade: string;
    location: string;
    department: string;
    status: 'Applied' | 'Shortlisted' | 'Rejected';
}

export interface SessionAssignment {
    sessionNo: number;
    actionItem: string;
    assignmentDate: string;
    dueDate: string;
    status: 'Completed' | 'Incomplete';
}