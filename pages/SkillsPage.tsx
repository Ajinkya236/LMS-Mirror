import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SkillsSubHeader, { SkillsTab } from '../components/SkillsSubHeader';
import { 
  UserIcon, 
  AwardIcon, 
  StarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  MapPinIcon, 
  BookOpenIcon, 
  ClockIcon, 
  CalendarIcon, 
  ChevronRightIcon,
  ChevronDownIcon,
  XIcon,
  PlusIcon,
  UploadIcon,
  FileTextIcon,
  SearchIcon,
  EyeIcon,
  InfoIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
  ExternalLinkIcon,
  BriefcaseIcon,
  AlertCircleIcon,
  FilterIcon,
  CompassIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '../components/Icons';
import { 
  AdditionalSkillItem, 
  EvidenceItem, 
  getStoredAdditionalSkills, 
  deleteAdditionalSkill,
  RoleSurveyState,
  getStoredRoleSurveyState,
  saveRoleSurveyDraft,
  submitRoleSurvey,
  getStoredRoleSkills,
  saveStoredRoleSkills,
  TeamMemberProfile,
  ManagerSurveyRecord,
  ManagerSurveyStatus,
  getStoredTeamMembers,
  getStoredManagerSurveys,
  saveManagerSurveyDraft,
  submitManagerSurvey,
  getStoredManagerValidations,
  updateManagerValidationDecision,
  ManagerSkillValidationItem,
  SkillEvidenceDoc
} from '../utils/skillsData';
import { RoleSkillSelfSurveyModal } from '../components/skills/RoleSkillSelfSurveyModal';
import { ManagerRoleSkillSurveyModal } from '../components/skills/ManagerRoleSkillSurveyModal';
import { EmployeeSkillProfileView } from '../components/skills/EmployeeSkillProfileView';
import { ManagerSkillValidationReviewModal } from '../components/skills/ManagerSkillValidationReviewModal';
import { EvidenceDocumentModal } from '../components/skills/EvidenceDocumentModal';

// --- Types ---
interface SkillLevelDetail {
  level: number;
  name: string;
  description: string;
}

interface SkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category: string;
  criticality: 'High' | 'Medium' | 'Low';
  staleText?: string;
  targetLevel: number; // e.g. 3
  currentLevel: number; // Final current level (e.g. 3)
  selfRating?: number;
  managerRating?: number;
  status: 'Met' | 'Not Met' | '1 level short';
  skillMeaning: string;
  levels: SkillLevelDetail[];
  recommendedCourses: { title: string; provider: string; duration: string }[];
}

export type ValidationStatus = 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  points: number;
  skillsMastered: number;
  isCurrentUser?: boolean;
}

// Mock User Profile Data
const USER_PROFILE = {
  name: 'Sandeep Gupta',
  empId: 'EMP104928',
  photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
  jobRole: 'Software Development & Platform Engineering',
  jobPosition: 'Senior Platform Architect',
  businessUnit: 'Cloud & Digital Platforms',
  jobGrade: 'Grade E4',
  grade: 'Grade E4',
  cohort: '2024 Tech Leadership Cohort',
  reportsTo: 'Rajesh Sharma (VP Engineering)',
  location: 'Mumbai - Reliance Corporate Park',
  jobSubFamily: 'Software Development & Platform Engineering',
  variant: 'Full-Stack & Cloud Architecture',
  careerLevel: 'Senior Level II',
  coreSkillsCount: 12,
  variantMappedSkillsCount: 18,
  relevantExperience: '6.5 Years',
  totalExperience: '8.2 Years',
  joinedJioDate: '15 March 2020',
};

// Available Skills Library for "Add Additional Skill" & Skills Library View
const SKILL_LIBRARY = [
  { id: 'lib-1', name: 'Kubernetes & Container Orchestration', type: 'Technical', category: 'DevOps & Infrastructure', criticality: 'High' as const, demand: 'High Demand', description: 'Container deployment, cluster scaling, and production orchestration using Helm & K8s.' },
  { id: 'lib-2', name: 'Cloud Architecture (AWS / GCP / Azure)', type: 'Technical', category: 'Cloud Infrastructure', criticality: 'High' as const, demand: 'High Demand', description: 'Designing high-availability multi-cloud landing zones, IAM security, and serverless architectures.' },
  { id: 'lib-3', name: 'React & Modern Frontend Engineering', type: 'Technical', category: 'Frontend Development', criticality: 'High' as const, demand: 'Core Tech', description: 'Building scalable SPA applications with React 18, state synchronization, and micro-frontends.' },
  { id: 'lib-4', name: 'Python Data Engineering & PySpark', type: 'Technical', category: 'Data & Analytics', criticality: 'High' as const, demand: 'Emerging', description: 'Big data processing pipelines, ETL workflows, and distributed Spark streaming.' },
  { id: 'lib-5', name: 'Cyber Security & Network Defense', type: 'Technical', category: 'Information Security', criticality: 'High' as const, demand: 'Critical Core', description: 'Zero-trust architecture, threat analysis, API gateway hardening, and vulnerability mitigation.' },
  { id: 'lib-6', name: 'Agile & Scrum Leadership', type: 'Functional', category: 'Management', criticality: 'Medium' as const, demand: 'Core Tech', description: 'Leading agile sprint cycles, sprint planning, backlog refinement, and cross-team velocity optimization.' },
  { id: 'lib-7', name: 'Strategic Stakeholder Management', type: 'Behavioral', category: 'Leadership', criticality: 'Medium' as const, demand: 'Leadership', description: 'Aligning business priorities across executive sponsors, product management, and engineering teams.' },
  { id: 'lib-8', name: '5G Core Network Slicing & Edge Computing', type: 'Domain', category: 'Telecom Engineering', criticality: 'High' as const, demand: 'Emerging Tech', description: 'Configuring 5G SA core slicing, UPF deployment, and low-latency MEC edge nodes.' },
  { id: 'lib-9', name: 'AI / Machine Learning Model Deployment', type: 'Technical', category: 'Artificial Intelligence', criticality: 'High' as const, demand: 'Emerging Tech', description: 'Deploying LLMs, fine-tuning embeddings, MLOps, and vector database retrieval systems.' },
  { id: 'lib-10', name: 'RESTful API & GraphQL Design', type: 'Technical', category: 'Software Architecture', criticality: 'High' as const, demand: 'Core Tech', description: 'Designing resilient microservices API contracts, GraphQL schemas, and rate-limiting gateways.' },
  { id: 'lib-11', name: 'Microservices Design Patterns', type: 'Technical', category: 'Software Architecture', criticality: 'High' as const, demand: 'Core Tech', description: 'Event-driven architecture, saga patterns, message queues (Kafka/RabbitMQ), and circuit breakers.' },
];

// Role Focus Skills
const INITIAL_ROLE_SKILLS: SkillItem[] = [
  {
    id: 'sk-1',
    name: 'eNB / gNB Config & Commissioning',
    type: 'Technical',
    category: 'Deployment',
    criticality: 'High',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 4,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Configuring, integrating and commissioning base station nodes, and bringing them on air to acceptance standards.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Assists commissioning under supervision, following the checklist.' },
      { level: 2, name: 'Working', description: 'Commissions standard nodes end to end and closes routine integration faults.' },
      { level: 3, name: 'Practitioner', description: 'Commissions and integrates independently, including non-standard and multi-vendor configurations.' },
      { level: 4, name: 'Expert', description: 'Owns the commissioning standard. Resolves escalated integration failures and audits quality.' }
    ],
    recommendedCourses: [
      { title: 'Advanced 5G gNB Node Integration & Multi-Vendor Setup', provider: 'Jio Academy', duration: '4h 30m' },
      { title: 'Base Station Acceptance & Field Audit Protocol', provider: 'Internal Engineering', duration: '3h 15m' }
    ]
  },
  {
    id: 'sk-2',
    name: 'Small Cell & In-Building Solutions',
    type: 'Technical',
    category: 'RF Engineering',
    criticality: 'High',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Designing and deploying indoor cellular coverage solutions, distributed antenna systems (DAS), and indoor small cells.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands basic indoor RF propagation and DAS components.' },
      { level: 2, name: 'Working', description: 'Installs and tests indoor small cells following coverage blueprints.' },
      { level: 3, name: 'Practitioner', description: 'Designs and optimizes complex in-building wireless coverage for enterprise facilities.' },
      { level: 4, name: 'Expert', description: 'Leads nationwide indoor cellular architecture and multi-tenant DAS guidelines.' }
    ],
    recommendedCourses: [
      { title: 'In-Building Wireless & DAS Design Masterclass', provider: 'RF Academy', duration: '5h 00m' }
    ]
  },
  {
    id: 'sk-3',
    name: '5G NR Radio Access',
    type: 'Technical',
    category: 'RF Engineering',
    criticality: 'High',
    targetLevel: 3,
    currentLevel: 2,
    selfRating: 3,
    managerRating: 2,
    status: '1 level short',
    skillMeaning: 'Understanding and configuring 5G New Radio (NR) protocols, beamforming, and spectrum allocation.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands 5G NR frame structure, numerology, and frequency bands.' },
      { level: 2, name: 'Working', description: 'Configures basic 5G NR gNB parameters and handles routine radio troubleshooting.' },
      { level: 3, name: 'Practitioner', description: 'Optimizes Massive MIMO, beamforming vectors, and carrier aggregation in live networks.' },
      { level: 4, name: 'Expert', description: 'Defines 5G NR radio algorithms and spectrum allocation strategy across enterprise deployments.' }
    ],
    recommendedCourses: [
      { title: '5G NR Massive MIMO & Beamforming Deep Dive', provider: 'Jio 5G Lab', duration: '6h 45m' },
      { title: 'Radio Access Network Optimization Essentials', provider: 'Coursera', duration: '4h 15m' }
    ]
  },
  {
    id: 'sk-4',
    name: 'RF Optimisation & Drive Test',
    type: 'Technical',
    category: 'RF Engineering',
    criticality: 'High',
    staleText: 'Stale — last assessed Jun 2025',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Analyzing drive test log files, KPIs (RSRP, SINR, Throughput), and tuning antenna tilts and neighbor lists for optimal coverage.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Collects drive test data using automated tools and basic GPS loggers.' },
      { level: 2, name: 'Working', description: 'Analyzes drive test logs to identify coverage holes and interference zones.' },
      { level: 3, name: 'Practitioner', description: 'Executes cluster optimization, handoff tuning, and PCI collision mitigation.' },
      { level: 4, name: 'Expert', description: 'Architects automated AI drive test analysis and self-organizing network (SON) parameters.' }
    ],
    recommendedCourses: [
      { title: 'Drive Test KPI Analysis & Automated Log Parsing', provider: 'Internal Academy', duration: '3h 30m' }
    ]
  },
  {
    id: 'sk-5',
    name: 'Fault Management & Troubleshooting',
    type: 'Functional',
    category: 'Operations',
    criticality: 'High',
    staleText: 'Stale — last assessed Apr 2025',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Systematic diagnosis of network element alarms, hardware failures, fiber breaks, and protocol stack anomalies.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Monitors NOC alarm consoles and logs incident tickets accurately.' },
      { level: 2, name: 'Working', description: 'Resolves L1/L2 network faults using standard operating procedures.' },
      { level: 3, name: 'Practitioner', description: 'Diagnoses complex multi-domain outages and root causes within SLA limits.' },
      { level: 4, name: 'Expert', description: 'Establishes enterprise fault response frameworks and predictive anomaly detection models.' }
    ],
    recommendedCourses: [
      { title: 'Network Fault Diagnostics & SLA Incident Recovery', provider: 'Operations Excellence', duration: '4h 10m' }
    ]
  },
  {
    id: 'sk-6',
    name: 'Microservices & Distributed Systems Architecture',
    type: 'Technical',
    category: 'Software Architecture',
    criticality: 'High',
    targetLevel: 4,
    currentLevel: 3,
    selfRating: 4,
    managerRating: 3,
    status: '1 level short',
    skillMeaning: 'Designing resilient, decoupled microservices, gRPC communication contracts, and distributed caching topologies.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands basic REST APIs and stateless service containerization.' },
      { level: 2, name: 'Working', description: 'Develops and tests microservices with database connection pooling and structured logging.' },
      { level: 3, name: 'Practitioner', description: 'Architects event-driven microservices with saga patterns, distributed tracing, and retry policies.' },
      { level: 4, name: 'Expert', description: 'Sets enterprise microservice design standards, zero-trust service mesh, and global high-availability blueprints.' }
    ],
    recommendedCourses: [
      { title: 'Cloud-Native Distributed Systems & Resiliency Patterns', provider: 'Internal Engineering', duration: '5h 20m' }
    ]
  },
  {
    id: 'sk-7',
    name: 'Sprint Governance & Agile Delivery',
    type: 'Functional',
    category: 'Project Management',
    criticality: 'Low',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Facilitating sprint cadences, unblocking engineering dependencies, and tracking cross-functional burndown metrics.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Participates in daily standups and sprint planning rituals.' },
      { level: 2, name: 'Working', description: 'Manages user stories, epic grooming, and task breakdown on Jira boards.' },
      { level: 3, name: 'Practitioner', description: 'Leads cross-squad sprint deliverables and removes complex cross-team blockers.' },
      { level: 4, name: 'Expert', description: 'Directs multi-product release governance and implements enterprise Agile scaling frameworks.' }
    ],
    recommendedCourses: [
      { title: 'Agile Delivery & Velocity Metrics for Tech Leads', provider: 'Jio Academy', duration: '3h 45m' }
    ]
  },
  {
    id: 'sk-8',
    name: 'Cross-Functional Technical Mentorship',
    type: 'Behavioral',
    category: 'People & Leadership',
    criticality: 'Medium',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Mentoring junior engineers, conducting constructive code reviews, and fostering an inclusive culture of engineering craft.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Provides peer feedback during standard code pull requests.' },
      { level: 2, name: 'Working', description: 'Directly mentors 1–2 junior engineers on best development practices.' },
      { level: 3, name: 'Practitioner', description: 'Runs technical workshops, designs onboarding cohorts, and coaches mid-level developers.' },
      { level: 4, name: 'Expert', description: 'Builds enterprise-wide mentorship programs and technical talent development pipelines.' }
    ],
    recommendedCourses: [
      { title: 'High-Impact Technical Mentoring & Feedback', provider: 'Leadership Lab', duration: '2h 50m' }
    ]
  },
  {
    id: 'sk-9',
    name: '5G Core Slicing & Edge Protocol Architecture',
    type: 'Domain',
    category: 'Telecom Engineering',
    criticality: 'High',
    targetLevel: 3,
    currentLevel: 2,
    selfRating: 3,
    managerRating: 2,
    status: '1 level short',
    skillMeaning: 'Architecting 5G Standalone network slicing (eMBB, URLLC, mMTC) and multi-access edge computing (MEC) endpoints.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands 3GPP network slicing specifications and user plane functions.' },
      { level: 2, name: 'Working', description: 'Configures slice selection policies and edge routing tables.' },
      { level: 3, name: 'Practitioner', description: 'Optimizes dynamic SLA slicing and low-latency MEC traffic steering.' },
      { level: 4, name: 'Expert', description: 'Authors 5G standalone Core slicing architectures for mission-critical enterprise private networks.' }
    ],
    recommendedCourses: [
      { title: '5G Standalone Core Slicing & MEC Deployment', provider: 'Jio 5G Academy', duration: '6h 15m' }
    ]
  }
];

// Leaderboard Mock Data
const ROLE_LEADERBOARD_30D: LeaderboardUser[] = [
  { rank: 1, id: 'u1', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80', role: 'Staff Software Engineer', department: 'Platform Tech', points: 3420, skillsMastered: 16 },
  { rank: 2, id: 'u2', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80', role: 'Lead Architect', department: 'Cloud Infra', points: 3150, skillsMastered: 15 },
  { rank: 3, id: 'u3', name: 'Vikram Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80', role: 'Senior Developer', department: 'Digital Products', points: 2890, skillsMastered: 14 },
  { rank: 4, id: 'u4', name: 'Sandeep Gupta (You)', avatar: USER_PROFILE.photo, role: 'Senior Engineer', department: 'Platform Engineering', points: 2650, skillsMastered: 12, isCurrentUser: true },
  { rank: 5, id: 'u5', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80', role: 'Full Stack Engineer', department: 'Enterprise Sales Tech', points: 2410, skillsMastered: 11 },
  { rank: 6, id: 'u6', name: 'Siddharth Rao', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80', role: 'DevOps Lead', department: 'Cloud Operations', points: 2280, skillsMastered: 10 },
];

const ROLE_LEADERBOARD_6M: LeaderboardUser[] = [
  { rank: 1, id: 'u2', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80', role: 'Lead Architect', department: 'Cloud Infra', points: 14200, skillsMastered: 18 },
  { rank: 2, id: 'u1', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80', role: 'Staff Software Engineer', department: 'Platform Tech', points: 13850, skillsMastered: 17 },
  { rank: 3, id: 'u4', name: 'Sandeep Gupta (You)', avatar: USER_PROFILE.photo, role: 'Senior Engineer', department: 'Platform Engineering', points: 12100, skillsMastered: 15, isCurrentUser: true },
  { rank: 4, id: 'u3', name: 'Vikram Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80', role: 'Senior Developer', department: 'Digital Products', points: 11400, skillsMastered: 14 },
  { rank: 5, id: 'u5', name: 'Ananya Roy', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80', role: 'Full Stack Engineer', department: 'Enterprise Sales Tech', points: 9800, skillsMastered: 12 },
];

const ORG_LEADERBOARD_30D: LeaderboardUser[] = [
  { rank: 1, id: 'o1', name: 'Kavita Nair', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80', role: 'VP Digital Transformation', department: 'Enterprise Solutions', points: 4890, skillsMastered: 22 },
  { rank: 2, id: 'o2', name: 'Sandeep Kumar', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80', role: 'Principal Data Scientist', department: 'AI & Machine Learning', points: 4520, skillsMastered: 20 },
  { rank: 3, id: 'u1', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80', role: 'Staff Software Engineer', department: 'Platform Tech', points: 3420, skillsMastered: 16 },
  { rank: 4, id: 'o3', name: 'Deepak Joshi', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&q=80', role: 'Product Director', department: 'Consumer Tech', points: 3210, skillsMastered: 15 },
  { rank: 12, id: 'u4', name: 'Sandeep Gupta (You)', avatar: USER_PROFILE.photo, role: 'Senior Engineer', department: 'Platform Engineering', points: 2650, skillsMastered: 12, isCurrentUser: true },
];

const ORG_LEADERBOARD_6M: LeaderboardUser[] = [
  { rank: 1, id: 'o2', name: 'Sandeep Kumar', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80', role: 'Principal Data Scientist', department: 'AI & Machine Learning', points: 18900, skillsMastered: 25 },
  { rank: 2, id: 'o1', name: 'Kavita Nair', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80', role: 'VP Digital Transformation', department: 'Enterprise Solutions', points: 17400, skillsMastered: 24 },
  { rank: 3, id: 'u2', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80', role: 'Lead Architect', department: 'Cloud Infra', points: 14200, skillsMastered: 18 },
  { rank: 10, id: 'u4', name: 'Sandeep Gupta (You)', avatar: USER_PROFILE.photo, role: 'Senior Engineer', department: 'Platform Engineering', points: 12100, skillsMastered: 15, isCurrentUser: true },
];

// Team Data Mock
const TEAM_MEMBERS_DATA = [
  { id: 'tm-1', name: 'Priya Sharma', role: 'Staff Software Engineer', grade: 'Grade E4', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80', readiness: 88, skillsCount: 16, pendingEvidence: 1, criticalGap: 'None' },
  { id: 'tm-2', name: 'Rohan Mehta', role: 'Lead Architect', grade: 'Grade E5', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80', readiness: 94, skillsCount: 18, pendingEvidence: 0, criticalGap: 'None' },
  { id: 'tm-3', name: 'Vikram Verma', role: 'Senior Developer', grade: 'Grade E4', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80', readiness: 72, skillsCount: 14, pendingEvidence: 1, criticalGap: '5G NR Radio Access' },
  { id: 'tm-4', name: 'Ananya Roy', role: 'Full Stack Engineer', grade: 'Grade E3', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80', readiness: 65, skillsCount: 11, pendingEvidence: 0, criticalGap: 'Cloud Architecture' },
  { id: 'tm-5', name: 'Siddharth Rao', role: 'DevOps Lead', grade: 'Grade E4', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80', readiness: 81, skillsCount: 13, pendingEvidence: 0, criticalGap: 'None' }
];

export interface SkillBadgeItem {
  id: string;
  title: string;
  type: 'skill' | 'role_readiness';
  tier: 'Platinum' | 'Gold' | 'Silver' | 'In Progress';
  category: string;
  description: string;
  scoreOrCriteria: string;
  status: 'Earned' | 'In Progress' | 'Locked';
  accreditedDate?: string;
  credentialId: string;
  issuer: string;
  skillsCovered: string[];
}

export const SKILL_BADGES_DATA: SkillBadgeItem[] = [
  // Skill Badges
  {
    id: 'badge-sk-1',
    title: '5G gNB Node Integration Master',
    type: 'skill',
    tier: 'Platinum',
    category: 'Telecom Engineering',
    description: 'Awarded for scoring 90%+ on advanced 5G gNB node commissioning, multi-vendor carrier aggregation, and verified field audit approval.',
    scoreOrCriteria: 'Score: 92/100 (Pass ≥ 85)',
    status: 'Earned',
    accreditedDate: '12 Jan 2026',
    credentialId: 'JIO-SKB-2026-9041',
    issuer: 'Jio Engineering Standards & Accreditation Council',
    skillsCovered: ['eNB / gNB Config & Commissioning', 'Base Station Quality Audit']
  },
  {
    id: 'badge-sk-2',
    title: 'Kubernetes Cloud Orchestrator',
    type: 'skill',
    tier: 'Gold',
    category: 'DevOps & Cloud',
    description: 'Demonstrates certified mastery of container orchestration, Helm chart deployments, ingress controllers, and microservice autoscaling.',
    scoreOrCriteria: 'Score: 88/100 (Pass ≥ 80)',
    status: 'Earned',
    accreditedDate: '28 Nov 2025',
    credentialId: 'JIO-SKB-2025-7812',
    issuer: 'Cloud Center of Excellence (CCoE)',
    skillsCovered: ['Kubernetes & Container Orchestration', 'Microservices Design Patterns']
  },
  {
    id: 'badge-sk-3',
    title: '5G NR Radio Access Practitioner',
    type: 'skill',
    tier: 'Gold',
    category: 'RF Engineering',
    description: 'Validation in 5G NR frame structures, numerology configuration, Massive MIMO beamforming, and spectrum optimization.',
    scoreOrCriteria: 'Score: 86/100 (Pass ≥ 85)',
    status: 'Earned',
    accreditedDate: '14 Oct 2025',
    credentialId: 'JIO-SKB-2025-6320',
    issuer: 'Radio Access Network Practice Guild',
    skillsCovered: ['5G NR Radio Access', 'RF Optimisation & Drive Test']
  },
  {
    id: 'badge-sk-4',
    title: 'React & Modern Frontend Architect',
    type: 'skill',
    tier: 'Silver',
    category: 'Frontend Engineering',
    description: 'Recognizes competence in building high-performance modern web apps, reactive state stores, micro-frontends, and accessible UI kits.',
    scoreOrCriteria: 'Score: 80/100 (Pass ≥ 75)',
    status: 'Earned',
    accreditedDate: '05 Sep 2025',
    credentialId: 'JIO-SKB-2025-4109',
    issuer: 'Digital Product Engineering Academy',
    skillsCovered: ['React & Modern Frontend Engineering', 'RESTful API & GraphQL Design']
  },
  {
    id: 'badge-sk-5',
    title: 'AI & Machine Learning MLOps Specialist',
    type: 'skill',
    tier: 'In Progress',
    category: 'Artificial Intelligence',
    description: 'Focuses on scalable model serving, vector search embeddings, LLM guardrails, and automated training pipeline monitoring.',
    scoreOrCriteria: 'Progress: 2/3 Sections Completed',
    status: 'In Progress',
    credentialId: 'JIO-SKB-IP-0911',
    issuer: 'Jio AI Labs',
    skillsCovered: ['AI / Machine Learning Model Deployment', 'Python Data Engineering']
  },

  // Role Readiness Badges
  {
    id: 'badge-rr-1',
    title: 'Senior Platform Engineer — Role Ready',
    type: 'role_readiness',
    tier: 'Platinum',
    category: 'Role Benchmark',
    description: 'Certified role readiness for Grade E4 Senior Platform Engineer, having met 100% of required technical and functional role skills with verified manager validations.',
    scoreOrCriteria: 'Overall Readiness: 94% (Target ≥ 85%)',
    status: 'Earned',
    accreditedDate: '02 Feb 2026',
    credentialId: 'JIO-RRB-2026-1188',
    issuer: 'Jio Talent & Organizational Readiness Board',
    skillsCovered: ['eNB / gNB Config', 'RF Optimisation', 'Fault Management', 'Kubernetes Orchestration']
  },
  {
    id: 'badge-rr-2',
    title: '5G Core Network Slicing Lead — Stage 2 Qualified',
    type: 'role_readiness',
    tier: 'Gold',
    category: 'Role Benchmark',
    description: 'Role capability accreditation validating independence in designing mission-critical enterprise slicing architectures and UPF edge deployments.',
    scoreOrCriteria: 'Overall Readiness: 86% (Target ≥ 80%)',
    status: 'Earned',
    accreditedDate: '19 Dec 2025',
    credentialId: 'JIO-RRB-2025-0845',
    issuer: 'Telecom Core Technical Board',
    skillsCovered: ['5G Core Slicing & Edge Protocol', 'Fault Management & Troubleshooting']
  },
  {
    id: 'badge-rr-3',
    title: 'Enterprise Solutions Architect — Associate Ready',
    type: 'role_readiness',
    tier: 'Silver',
    category: 'Role Benchmark',
    description: 'Validates cross-domain solution architecture capabilities across cloud landing zones, microservices topology, and zero-trust security postures.',
    scoreOrCriteria: 'Overall Readiness: 78% (Target ≥ 75%)',
    status: 'Earned',
    accreditedDate: '10 Aug 2025',
    credentialId: 'JIO-RRB-2025-0312',
    issuer: 'Enterprise Architectural Review Board',
    skillsCovered: ['Cloud Architecture', 'Cyber Security & Network Defense', 'Strategic Stakeholder Management']
  },
  {
    id: 'badge-rr-4',
    title: 'DevOps & Site Reliability Lead — Candidate',
    type: 'role_readiness',
    tier: 'In Progress',
    category: 'Role Benchmark',
    description: 'Evaluates production incident leadership, automated SLO/SLA management, chaos engineering, and zero-downtime deployment pipelines.',
    scoreOrCriteria: 'Overall Readiness: 68% (Target ≥ 80%)',
    status: 'In Progress',
    credentialId: 'JIO-RRB-IP-0552',
    issuer: 'Jio Reliability Engineering Guild',
    skillsCovered: ['Kubernetes & Container Orchestration', 'Fault Management & Troubleshooting']
  }
];

const SkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top Nav Sub-Menu Active Tab
  const tabParam = searchParams.get('tab') as SkillsTab;
  const [activeSubTab, setActiveSubTab] = useState<SkillsTab>(() => {
    if (tabParam === 'badges') return 'credentials';
    if (tabParam === 'rewards') return 'credentials';
    if (tabParam && ['home', 'explore', 'my-team', 'leaderboard', 'rewards', 'credentials', 'skill-admin'].includes(tabParam)) {
      return tabParam;
    }
    return 'home';
  });

  useEffect(() => {
    if (tabParam === 'badges') {
      setActiveSubTab('credentials');
      setLeaderboardTab('badges');
    } else if (tabParam === 'rewards') {
      setActiveSubTab('credentials');
    } else if (tabParam && ['home', 'explore', 'my-team', 'leaderboard', 'rewards', 'credentials', 'skill-admin'].includes(tabParam)) {
      setActiveSubTab(tabParam);
    }
  }, [tabParam]);

  const handleSelectSubTab = (tab: SkillsTab) => {
    if (tab === 'badges') {
      setActiveSubTab('credentials');
      setLeaderboardTab('badges');
      setSearchParams({ tab: 'credentials', subtab: 'badges' });
      return;
    }
    if (tab === 'credentials' || tab === 'rewards' || tab === 'leaderboard') {
      setActiveSubTab('credentials');
      setLeaderboardTab('leaderboard');
      setSearchParams({ tab: 'credentials' });
      return;
    }
    setActiveSubTab(tab);
    setSearchParams({ tab });
  };

  // Profile Section Accordion State
  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(false);

  // Primary Filter State inside Home
  const [activeMainFilter, setActiveMainFilter] = useState<'role' | 'additional'>('role');

  // Skill Type & Criticality Separate Filter State for My Skills section
  const [skillTypeFilter, setSkillTypeFilter] = useState<string>('All');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('All');
  const [skillStatusFilter, setSkillStatusFilter] = useState<string>('All');
  const [showSkillsFilters, setShowSkillsFilters] = useState<boolean>(false);

  // Employee Profile Modal State
  const [showEmployeeModal, setShowEmployeeModal] = useState<boolean>(false);

  // Modal State for Learn/Courses
  const [activeSkillModal, setActiveSkillModal] = useState<SkillItem | null>(null);

  // Role Skills & Employee Self-Survey State (Epic A)
  const [surveyState, setSurveyState] = useState<RoleSurveyState>(() => getStoredRoleSurveyState());
  const [roleSkills, setRoleSkills] = useState<SkillItem[]>(() => {
    const storedSurvey = getStoredRoleSurveyState();
    const seeded = INITIAL_ROLE_SKILLS.map(skill => {
      // If survey is completed or has draft ratings, prioritize them
      const draftRating = storedSurvey.draftRatings?.[skill.id];
      const selfRating = storedSurvey.completed ? (draftRating ?? skill.selfRating) : (draftRating !== undefined ? draftRating : undefined);
      const targetLevel = skill.targetLevel || 3;
      let status = skill.status;
      if (selfRating !== undefined) {
        status = selfRating >= targetLevel ? 'Met' : (targetLevel - selfRating === 1 ? '1 level short' : 'Not Met');
      }
      return {
        ...skill,
        selfRating,
        status
      };
    });
    return getStoredRoleSkills<SkillItem>(seeded);
  });
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState<boolean>(false);
  const [surveyToastMessage, setSurveyToastMessage] = useState<string | null>(null);

  // Sync role survey updates across windows/events
  useEffect(() => {
    const handleSurveySync = () => {
      const updatedState = getStoredRoleSurveyState();
      setSurveyState(updatedState);
      const updatedSkills = getStoredRoleSkills<SkillItem>(INITIAL_ROLE_SKILLS);
      setRoleSkills(updatedSkills);
    };
    window.addEventListener('role-survey-updated', handleSurveySync);
    window.addEventListener('role-skills-updated', handleSurveySync);
    return () => {
      window.removeEventListener('role-survey-updated', handleSurveySync);
      window.removeEventListener('role-skills-updated', handleSurveySync);
    };
  }, []);

  const handleOpenSurvey = () => {
    navigate('/skills/self-survey');
  };

  const handleSaveSurveyDraft = (draftRatings: Record<string, number>) => {
    saveRoleSurveyDraft(draftRatings);
    setSurveyState(getStoredRoleSurveyState());
    setSurveyToastMessage('Draft survey saved! You can resume anytime without losing your selections.');
    setTimeout(() => setSurveyToastMessage(null), 3500);
  };

  const handleSubmitSurvey = (finalRatings: Record<string, number>) => {
    const result = submitRoleSurvey(finalRatings);
    const updatedState = getStoredRoleSurveyState();
    setSurveyState(updatedState);
    
    // Update roleSkills in state & storage
    setRoleSkills(prev => {
      const updated = prev.map(sk => {
        const rating = finalRatings[sk.id];
        const targetLevel = sk.targetLevel || 3;
        if (rating !== undefined) {
          return {
            ...sk,
            selfRating: rating,
            status: rating >= targetLevel ? 'Met' : (targetLevel - rating === 1 ? '1 level short' : 'Not Met') as any
          };
        }
        return sk;
      });
      saveStoredRoleSkills(updated);
      return updated;
    });

    setIsSurveyModalOpen(false);
    setSurveyToastMessage(
      surveyState.completed 
        ? `Survey resubmitted successfully! Prior ratings overwritten (${result.completedAt}).`
        : `Self-survey submitted successfully! (${result.completedAt})`
    );
    setTimeout(() => setSurveyToastMessage(null), 4000);
  };

  // Epic B & C: My Team & Manager Survey State
  const [teamMembers, setTeamMembers] = useState<TeamMemberProfile[]>(() => getStoredTeamMembers());
  const [managerSurveys, setManagerSurveys] = useState<Record<string, ManagerSurveyRecord>>(() => getStoredManagerSurveys());
  const [evaluatingMember, setEvaluatingMember] = useState<TeamMemberProfile | null>(null);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState<boolean>(false);
  const [managerSuccessToast, setManagerSuccessToast] = useState<string | null>(null);
  const [teamSurveyFilter, setTeamSurveyFilter] = useState<'All' | ManagerSurveyStatus>('All');
  const [expandedTeamMemberId, setExpandedTeamMemberId] = useState<string | null>(null);

  // My Team Sub-Views, Employee Skills Profile Dossier & Validation Hub State
  const [selectedEmployeeForDossier, setSelectedEmployeeForDossier] = useState<TeamMemberProfile | null>(null);
  const [myTeamSubView, setMyTeamSubView] = useState<'roster' | 'validations'>('roster');
  const [managerValidations, setManagerValidations] = useState<ManagerSkillValidationItem[]>(() => getStoredManagerValidations());
  const [validationFilter, setValidationFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [selectedValidationForReview, setSelectedValidationForReview] = useState<ManagerSkillValidationItem | null>(null);
  const [activeEvidenceModalDoc, setActiveEvidenceModalDoc] = useState<{ doc: SkillEvidenceDoc; employeeName: string; skillName: string } | null>(null);

  // Sync team members, manager surveys, and validations across windows/events
  useEffect(() => {
    const handleManagerSurveySync = () => {
      setManagerSurveys(getStoredManagerSurveys());
      setTeamMembers(getStoredTeamMembers());
      setManagerValidations(getStoredManagerValidations());
    };
    window.addEventListener('manager-surveys-updated', handleManagerSurveySync);
    window.addEventListener('team-members-updated', handleManagerSurveySync);
    window.addEventListener('manager-validations-updated', handleManagerSurveySync);
    return () => {
      window.removeEventListener('manager-surveys-updated', handleManagerSurveySync);
      window.removeEventListener('team-members-updated', handleManagerSurveySync);
      window.removeEventListener('manager-validations-updated', handleManagerSurveySync);
    };
  }, []);

  const handleOpenManagerSurvey = (member: TeamMemberProfile) => {
    setEvaluatingMember(member);
    setIsManagerModalOpen(true);
  };

  const handleSaveManagerSurveyDraft = (reporteeId: string, draftRatings: Record<string, number>) => {
    saveManagerSurveyDraft(reporteeId, draftRatings);
    setManagerSurveys(getStoredManagerSurveys());
    setManagerSuccessToast(`Draft evaluation for ${evaluatingMember?.name || 'reportee'} saved successfully.`);
    setTimeout(() => setManagerSuccessToast(null), 3500);
  };

  const handleSubmitManagerSurvey = (reporteeId: string, finalRatings: Record<string, number>) => {
    const record = submitManagerSurvey(reporteeId, finalRatings);
    const updatedSurveys = getStoredManagerSurveys();
    const updatedTeam = getStoredTeamMembers();
    setManagerSurveys(updatedSurveys);
    setTeamMembers(updatedTeam);
    setIsManagerModalOpen(false);

    if (selectedEmployeeForDossier) {
      const refreshed = updatedTeam.find(m => m.id === selectedEmployeeForDossier.id) || null;
      setSelectedEmployeeForDossier(refreshed);
    }
    
    // Ensure user stays on or returns to originating 'my-team' tab (Epic C requirement)
    setActiveSubTab('my-team');
    setSearchParams({ tab: 'my-team' });

    setManagerSuccessToast(
      `Manager competency evaluation for ${evaluatingMember?.name || 'reportee'} submitted successfully (${record.completedAt}). Role capability matrix and gap metrics updated.`
    );
    setTimeout(() => setManagerSuccessToast(null), 5000);
  };

  const handleUpdateValidationDecision = (
    validationId: string,
    decision: 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant',
    managerNotes: string,
    validatedLevel: number
  ) => {
    updateManagerValidationDecision(validationId, decision, managerNotes, validatedLevel);
    const updatedVals = getStoredManagerValidations();
    const updatedTeam = getStoredTeamMembers();
    setManagerValidations(updatedVals);
    setTeamMembers(updatedTeam);

    if (selectedEmployeeForDossier) {
      const refreshed = updatedTeam.find(m => m.id === selectedEmployeeForDossier.id) || null;
      setSelectedEmployeeForDossier(refreshed);
    }

    setManagerSuccessToast(`Validation decision submitted: Skill marked as "${decision}" with confirmed Level ${validatedLevel}.`);
    setTimeout(() => setManagerSuccessToast(null), 4500);
  };

  // Additional Skills State (synced with persistent storage)
  const [additionalSkills, setAdditionalSkills] = useState<AdditionalSkillItem[]>(() => getStoredAdditionalSkills());
  const [viewingEvidenceModal, setViewingEvidenceModal] = useState<AdditionalSkillItem | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<number>(0);
  const [skillToDelete, setSkillToDelete] = useState<{ id: string; name: string } | null>(null);

  // Sync state on external updates (e.g. from AddAdditionalSkillPage)
  useEffect(() => {
    const handleStorageUpdate = () => {
      setAdditionalSkills(getStoredAdditionalSkills());
    };
    window.addEventListener('additional-skills-updated', handleStorageUpdate);
    return () => window.removeEventListener('additional-skills-updated', handleStorageUpdate);
  }, []);

  const handleDeleteAdditionalSkill = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the additional skill "${name}" and its attached proofs?`)) {
      deleteAdditionalSkill(id);
      setAdditionalSkills(getStoredAdditionalSkills());
    }
  };

  // Explore (formerly Skills Library) State
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryTypeFilter, setLibraryTypeFilter] = useState('All');
  const [selectedSkillGroups, setSelectedSkillGroups] = useState<string[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [librarySkills, setLibrarySkills] = useState(SKILL_LIBRARY);

  // Rewards & Recognitions (Leaderboard, Points, Badges) State
  const [leaderboardTab, setLeaderboardTab] = useState<'leaderboard' | 'points' | 'badges'>('leaderboard');
  const [leaderboardScope, setLeaderboardScope] = useState<'role' | 'org'>('role');
  const [leaderboardTime, setLeaderboardTime] = useState<'30d' | '6m'>('30d');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'skill' | 'role_readiness'>('all');
  const [badgeSearchQuery, setBadgeSearchQuery] = useState<string>('');
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<SkillBadgeItem | null>(null);

  // Skill Admin Dashboard State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillType, setNewSkillType] = useState('Technical');
  const [newSkillCategory, setNewSkillCategory] = useState('Cloud Architecture');
  const [newSkillCriticality, setNewSkillCriticality] = useState<'High' | 'Medium' | 'Low'>('High');
  const [pendingSubmissions, setPendingSubmissions] = useState([
    { id: 'sub-1', name: 'Aarav Mehta', role: 'Staff Engineer', skill: '5G Core Network Slicing', date: 'Yesterday', status: 'Pending Verification', evidence: 'Jio 5G Specialist Cert #3391' },
    { id: 'sub-2', name: 'Priya Sharma', role: 'Senior Analyst', skill: 'Agile & Scrum Leadership', date: '2 days ago', status: 'Pending Review', evidence: 'Scrum Alliance CSM-4049' },
    { id: 'sub-3', name: 'Rohan Deshmukh', role: 'Platform Architect', skill: 'Kubernetes & Container Orchestration', date: '3 days ago', status: 'Pending Verification', evidence: 'CKA Certified - Linux Foundation ID #3911' },
  ]);

  // Determine Leaderboard Data
  let currentLeaderboard: LeaderboardUser[] = ROLE_LEADERBOARD_30D;
  if (leaderboardScope === 'role' && leaderboardTime === '6m') currentLeaderboard = ROLE_LEADERBOARD_6M;
  if (leaderboardScope === 'org' && leaderboardTime === '30d') currentLeaderboard = ORG_LEADERBOARD_30D;
  if (leaderboardScope === 'org' && leaderboardTime === '6m') currentLeaderboard = ORG_LEADERBOARD_6M;

  // Status Badge Styling Helper
  const getValidationBadge = (status: ValidationStatus) => {
    if (status === 'Relevant' || status === 'Future Relevant') {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
          Validated
        </span>
      );
    }
    return null;
  };

  // Criticality Ranking Map
  const CRITICALITY_ORDER: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Filtered and Sorted Role Skills for My Skills section (Incomplete first, then Criticality High->Low)
  const filteredRoleSkills = roleSkills
    .filter((skill) => {
      const matchesType = skillTypeFilter === 'All' || skill.type === skillTypeFilter;
      const matchesCriticality = criticalityFilter === 'All' || skill.criticality === criticalityFilter;
      const matchesStatus = skillStatusFilter === 'All' || 
        (skillStatusFilter === 'Met' && skill.status === 'Met') ||
        (skillStatusFilter === 'Not Met' && (skill.status === 'Not Met' || skill.status === '1 level short'));
      return matchesType && matchesCriticality && matchesStatus;
    })
    .sort((a, b) => {
      // 1. Incomplete first (Met is completed, 1 level short or Not Met is incomplete)
      const aIsComplete = a.status === 'Met';
      const bIsComplete = b.status === 'Met';
      if (aIsComplete !== bIsComplete) {
        return aIsComplete ? 1 : -1;
      }
      // 2. Criticality descending (Critical > High > Medium > Low)
      const critA = CRITICALITY_ORDER[a.criticality] || 0;
      const critB = CRITICALITY_ORDER[b.criticality] || 0;
      if (critA !== critB) {
        return critB - critA;
      }
      // 3. Alphabetical tie-breaker
      return a.name.localeCompare(b.name);
    });

  // Filtered and Sorted Additional Skills for My Skills section (Incomplete first, then Criticality High->Low)
  const filteredAdditionalSkills = additionalSkills
    .filter((skill) => {
      const matchesType = skillTypeFilter === 'All' || skill.type === skillTypeFilter;
      const matchesCriticality = criticalityFilter === 'All' || skill.criticality === criticalityFilter;
      const matchesStatus = skillStatusFilter === 'All' ||
        (skillStatusFilter === 'Met' && (skill.validationStatus === 'Relevant' || skill.validationStatus === 'Future Relevant')) ||
        (skillStatusFilter === 'Not Met' && !(skill.validationStatus === 'Relevant' || skill.validationStatus === 'Future Relevant'));
      return matchesType && matchesCriticality && matchesStatus;
    })
    .sort((a, b) => {
      // 1. Incomplete first (Relevant / Future Relevant is complete, Pending / Need More Evidence is incomplete)
      const aIsComplete = a.validationStatus === 'Relevant' || a.validationStatus === 'Future Relevant';
      const bIsComplete = b.validationStatus === 'Relevant' || b.validationStatus === 'Future Relevant';
      if (aIsComplete !== bIsComplete) {
        return aIsComplete ? 1 : -1;
      }
      // 2. Criticality descending
      const critA = CRITICALITY_ORDER[a.criticality || 'High'] || 0;
      const critB = CRITICALITY_ORDER[b.criticality || 'High'] || 0;
      if (critA !== critB) {
        return critB - critA;
      }
      // 3. Alphabetical tie-breaker
      return a.name.localeCompare(b.name);
    });

  // Filtered Skills Library (Explore tab)
  const filteredLibrary = librarySkills.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          item.description.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesType = libraryTypeFilter === 'All' || item.type === libraryTypeFilter;
    const matchesGroup = selectedSkillGroups.length === 0 || selectedSkillGroups.includes(item.category);
    return matchesSearch && matchesType && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* ========================================================= */}
      {/* TOP SUB NAV MENU BAR (Requirement a)                      */}
      {/* ========================================================= */}
      <SkillsSubHeader 
        activeTab={activeSubTab} 
        onSelectTab={handleSelectSubTab} 
        activeRewardSubTab={leaderboardTab}
      />

      {/* ========================================================= */}
      {/* SUB-TAB 1: HOME (Bento Grid Layout)                       */}
      {/* ========================================================= */}
      {activeSubTab === 'home' && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 animate-fade-in lg:h-[calc(100vh-140px)] lg:overflow-hidden flex flex-col">
               {/* Breadcrumb Header */}
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium flex-shrink-0">
            <span>Employee Portal</span>
            <span>/</span>
            <span className="text-gray-900 font-bold">Skills Intelligence</span>
            <span>/</span>
            <span className="text-r-blue font-bold">My Skills</span>
          </div>

          {/* ======================================================= */}
          {/* BENTO GRID: Profile (Left) | My Skills (Middle) | Numbers (Right) */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[20%_1fr_18%] gap-6 items-start lg:flex-1 lg:min-h-0 lg:overflow-hidden w-full pb-4">
            
            {/* ======================================================= */}
            {/* 1. LEFT BOX: PROFILE SECTION (LIGHT SKY BLUE 80% OPACITY) */}
            {/* ======================================================= */}
            <section className="lg:col-span-3 xl:col-span-1 bg-sky-100/80 rounded-3xl p-5 text-slate-900 shadow-xs border border-sky-200/80 relative overflow-hidden backdrop-blur-xs flex flex-col justify-between space-y-4 lg:space-y-5 lg:self-start w-full">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 w-48 h-48 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-center text-center sm:text-left lg:text-center gap-4 sm:gap-6 lg:gap-3.5 w-full">
                {/* Circular Bigger Profile Avatar */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={USER_PROFILE.photo} 
                    alt={USER_PROFILE.name} 
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-24 lg:h-24 rounded-full object-cover ring-4 ring-sky-300/60 shadow-md"
                  />
                  <div 
                    className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-white shadow-xs"
                    title="Active Employee"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Employee Details: Name and Job Role */}
                <div className="space-y-2 w-full flex-1">
                  <div>
                    {/* Name */}
                    <h1 className="text-lg sm:text-xl lg:text-lg font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
                      {USER_PROFILE.name}
                    </h1>

                    {/* Job Role text - larger as requested */}
                    <p className="text-sm font-extrabold text-slate-950 leading-snug mt-1">
                      {USER_PROFILE.jobRole}
                    </p>
                  </div>

                  {/* Business Unit Badge */}
                  <div className="pt-1 flex justify-center sm:justify-start lg:justify-center">
                    <span className="px-2.5 py-1 bg-sky-200/90 text-sky-950 font-bold rounded-lg border border-sky-300/80 text-[10px] inline-flex items-center gap-1 shadow-2xs">
                      <BriefcaseIcon className="w-3 h-3 text-sky-800" />
                      {USER_PROFILE.businessUnit}
                    </span>
                  </div>

                  {/* Skills count breakdown */}
                  <div className="w-full pt-2.5 border-t border-sky-200/40 text-[11px] font-extrabold text-slate-800 tracking-wide mt-2 text-center sm:text-left lg:text-center">
                    9 Role Skills &middot; 5 Additional Skills
                  </div>
                </div>
              </div>
            </section>

            {/* ======================================================= */}
            {/* 2. MIDDLE BOX: MY SKILLS SECTION                        */}
            {/* ======================================================= */}
            <section className="lg:col-span-9 xl:col-span-1 bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden flex flex-col lg:h-full lg:max-h-full">
              
              {/* Header & Controls */}
              <div className="px-5 sm:px-6 py-5 border-b border-gray-200 bg-gray-50/80 space-y-3.5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 tracking-tight">
                    My Skills
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Manage your role-mapped competencies, proficiency progression, and additional validated skills.
                  </p>
                </div>

                 {/* Left-Aligned Category Tabs & Filters */}
                 <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 w-full">
                   
                   {/* Category Switcher: Role focus vs My Additional Skills */}
                   <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl border border-gray-300">
                     <button
                       onClick={() => setActiveMainFilter('role')}
                       className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                         activeMainFilter === 'role'
                           ? 'bg-r-blue text-white shadow-xs'
                           : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                       }`}
                     >
                       <AwardIcon className="w-3.5 h-3.5" />
                       Role focus: Skills
                       <span className={`px-1.5 py-0.5 text-xs font-extrabold rounded-full ${
                         activeMainFilter === 'role' ? 'bg-white text-r-blue' : 'bg-gray-300 text-gray-800'
                       }`}>
                         {INITIAL_ROLE_SKILLS.length}
                       </span>
                     </button>
 
                     <button
                       onClick={() => setActiveMainFilter('additional')}
                       className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                         activeMainFilter === 'additional'
                           ? 'bg-r-blue text-white shadow-xs'
                           : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                       }`}
                     >
                       <PlusIcon className="w-3.5 h-3.5" />
                       My Additional Skills
                       <span className={`px-1.5 py-0.5 text-xs font-extrabold rounded-full ${
                         activeMainFilter === 'additional' ? 'bg-white text-r-blue' : 'bg-gray-300 text-gray-800'
                       }`}>
                         {additionalSkills.length}
                       </span>
                     </button>
                   </div>
 
                   {/* Filter Icon Toggle Button (Icon Only, on the right side) */}
                   <button
                     type="button"
                     onClick={() => setShowSkillsFilters(!showSkillsFilters)}
                     className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-3xs relative ${
                       showSkillsFilters 
                         ? 'bg-r-blue text-white border-r-blue hover:bg-r-blue-dark' 
                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                     }`}
                     title="Toggle Filters"
                     aria-label="Toggle Filters"
                   >
                     <FilterIcon className="w-4 h-4" />
                     {(skillTypeFilter !== 'All' || criticalityFilter !== 'All' || skillStatusFilter !== 'All') && (
                       <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                     )}
                   </button>

                </div>

                {/* Collapsible Filter Bar */}
                {showSkillsFilters && (
                  <div className="p-3 bg-slate-100/70 border border-gray-200 rounded-xl flex flex-wrap items-center gap-2.5 animate-fade-in mt-3">
                    {/* Filter 1: Skill Type */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 shadow-3xs">
                      <label className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-r-blue"></span>
                        Type:
                      </label>
                      <select
                        value={skillTypeFilter}
                        onChange={(e) => setSkillTypeFilter(e.target.value)}
                        className="text-xs font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All">All Types</option>
                        <option value="Technical">Technical</option>
                        <option value="Functional">Functional</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Domain">Domain</option>
                      </select>
                    </div>

                    {/* Filter 2: Criticality */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 shadow-3xs">
                      <label className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Criticality:
                      </label>
                      <select
                        value={criticalityFilter}
                        onChange={(e) => setCriticalityFilter(e.target.value)}
                        className="text-xs font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All">All Criticalities</option>
                        <option value="High">🟠 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">🔵 Low</option>
                      </select>
                    </div>

                    {/* Filter 3: Status (Met / Not Met) */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 shadow-3xs">
                      <label className="text-xs font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Status:
                      </label>
                      <select
                        value={skillStatusFilter}
                        onChange={(e) => setSkillStatusFilter(e.target.value)}
                        className="text-xs font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer pr-1"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Met">🟢 Met</option>
                        <option value="Not Met">🟡 Not Met</option>
                      </select>
                    </div>

                    {/* Reset Filters button */}
                    {(skillTypeFilter !== 'All' || criticalityFilter !== 'All' || skillStatusFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setSkillTypeFilter('All');
                          setCriticalityFilter('All');
                          setSkillStatusFilter('All');
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer sm:ml-auto"
                        title="Clear filters"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                        Reset Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* TAB 1: ROLE FOCUS SKILLS */}
              {activeMainFilter === 'role' && (
                <div className="flex-1 overflow-y-auto lg:max-h-[calc(100vh-290px)] min-h-0 flex flex-col">
                  {/* Header Info Bar */}
                  <div className="px-5 py-2.5 bg-slate-50/80 border-b border-gray-200 flex items-center justify-between text-xs text-gray-700">
                    <span className="font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 text-xs sm:text-sm">
                      <AwardIcon className="w-3.5 h-3.5 text-r-blue" />
                      Role Profile Mapped Skills ({filteredRoleSkills.length})
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs flex items-center gap-1">
                      🔒 Verified
                    </span>
                  </div>

                  {/* Epic A: Role-Mapped Skill Self-Survey Entry Point Banner (Pending vs Completed) */}
                  {!surveyState.completed ? (
                    <div 
                      id="survey-entry-point-banner"
                      className="m-4 mb-2 p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/90 border border-blue-200 rounded-2xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-r-blue text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                          <AwardIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                              Survey Pending
                            </span>
                            {Object.keys(surveyState.draftRatings || {}).length > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold">
                                Draft Saved ({Object.keys(surveyState.draftRatings).length}/9 skills answered)
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-slate-900 font-heading">
                            Role-Mapped Skill Self-Survey
                          </h3>
                          <p className="text-xs text-slate-600 font-medium max-w-xl leading-relaxed">
                            Evaluate your current proficiency (L1–L4) across all 9 role-mapped skills for your role profile (Senior Platform Architect) to baseline your capabilities and target growth areas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          id="btn-take-self-survey"
                          onClick={handleOpenSurvey}
                          className="w-full sm:w-auto px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <SparklesIcon className="w-4 h-4 text-amber-300" />
                          <span>
                            {Object.keys(surveyState.draftRatings || {}).length > 0 ? 'Resume Draft Survey' : 'Take Self-Survey'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      id="survey-completed-status-banner"
                      className="m-4 mb-2 p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-emerald-950 font-heading">
                              Self-Survey Completed
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                              Completed on {surveyState.completedAt || 'Recently'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-medium mt-0.5">
                            All 9 role-mapped skills have been self-assessed. Your self-ratings are reflected below.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                        <button
                          type="button"
                          id="btn-update-resubmit-survey"
                          onClick={handleOpenSurvey}
                          className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 shadow-3xs hover:shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Update your self-assessed proficiency ratings"
                        >
                          <EditIcon className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Update / Resubmit Survey</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {filteredRoleSkills.length === 0 ? (
                    <div className="p-8 text-center bg-white space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-gray-400">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">No skills match the selected filters</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        No skills found for Type "{skillTypeFilter}" and Criticality "{criticalityFilter}".
                      </p>
                      <button
                        onClick={() => {
                          setSkillTypeFilter('All');
                          setCriticalityFilter('All');
                        }}
                        className="px-3.5 py-1.5 bg-r-blue text-white text-xs font-bold rounded-lg hover:bg-r-blue-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    /* Horizontal Skill Tiles with Spacing & Met/Not Met status column */
                    <div className="p-4 space-y-3 bg-slate-50/50">
                      {filteredRoleSkills.map((skill) => {
                        const targetLevel = skill.targetLevel || 3;
                        const selfRating = skill.selfRating;
                        const isSelfMet = selfRating !== undefined && selfRating >= targetLevel;

                        return (
                          <div 
                            key={skill.id} 
                            id={`role-skill-card-${skill.id}`}
                            className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-r-blue/40 hover:shadow-xs transition-all flex flex-col gap-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                               {/* Skill Name & Badges */}
                               <div className="flex flex-wrap items-center gap-2">
                                 <h3 className="font-bold text-sm sm:text-base text-gray-900">
                                   {skill.name}
                                 </h3>
                                 {/* Criticality: Key title is criticality and value is high/medium/low */}
                                 <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                   skill.criticality === 'High'
                                     ? 'bg-orange-50 text-orange-750 border-orange-200 font-extrabold shadow-3xs'
                                     : skill.criticality === 'Medium'
                                     ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-3xs'
                                     : 'bg-sky-50 text-sky-700 border-sky-200 font-semibold shadow-3xs'
                                 }`}>
                                   Criticality: {skill.criticality}
                                 </span>
                               </div>

                               {/* Action Button: Learn Icon (BookOpenIcon) for both Met and Not Met, matched to w-5 h-5 */}
                               <button
                                 onClick={() => navigate(`/skills/learn/${skill.id}`)}
                                 className="self-start sm:self-auto p-1 text-r-blue hover:text-r-blue-dark bg-transparent border-none shadow-none transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
                                 title="Learn Skill"
                               >
                                 <BookOpenIcon className="w-5 h-5" style={{ strokeWidth: '2.5px' }} />
                               </button>
                             </div>

                            {/* Progress & Met/Gap Status Row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100 text-xs sm:text-sm">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  {skill.status === 'Met' ? (
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                                      <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                                      Met
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 text-[10px] font-extrabold rounded-full border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                                      <AlertCircleIcon className="w-3 h-3 text-amber-600" />
                                      Gap
                                    </span>
                                  )}
                                </div>

                                {/* Self-Assessed Proficiency Display */}
                                {selfRating !== undefined ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-0.5 bg-blue-50 text-r-blue border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1">
                                      <span className="text-slate-500 font-semibold">Self-Assessed:</span>
                                      <strong className="font-black">L{selfRating}</strong>
                                      <span className="text-[10px] font-medium text-slate-600">
                                        ({skill.levels.find(l => l.level === selfRating)?.name || 'Practitioner'})
                                      </span>
                                    </span>

                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                      isSelfMet 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {isSelfMet ? 'Self: Met' : `Self: Gap (-${targetLevel - selfRating} lvl)`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">
                                    Self-Assessed: <span className="text-amber-700 font-bold">Survey Pending</span>
                                  </span>
                                )}

                                <span className="text-gray-500 font-semibold text-xs">
                                  Required: <strong className="text-slate-800">L{skill.targetLevel}</strong> &middot; Current: <strong className="text-slate-800">L{skill.currentLevel}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: MY ADDITIONAL SKILLS */}
              {activeMainFilter === 'additional' && (
                <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto lg:max-h-[calc(100vh-290px)] min-h-0 flex flex-col">
                  {/* Header Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                        My Additional Skills
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        skills beyond your current role
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/skills/add-additional-skill')}
                      className="px-3 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                      title="Add Skills"
                    >
                      <PlusIcon className="w-3.5 h-3.5" strokeWidth={3} />
                      <span>Add Skills</span>
                    </button>
                  </div>

                  {/* Additional Skills List */}
                  {filteredAdditionalSkills.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-gray-200 space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-gray-400">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">No additional skills match the selected filters</h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        No additional skills found for Type "{skillTypeFilter}" and Criticality "{criticalityFilter}".
                      </p>
                      <div className="flex items-center justify-center gap-2.5 pt-1">
                        <button
                          onClick={() => {
                            setSkillTypeFilter('All');
                            setCriticalityFilter('All');
                          }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={() => navigate('/skills/add-additional-skill')}
                          className="px-3 py-1.5 bg-r-blue text-white text-xs font-bold rounded-lg hover:bg-r-blue-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          Add New Skill
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAdditionalSkills.map((item) => {
                        const proofCount = item.evidences?.length || (item.evidence ? 1 : 0);
                        const isManagerValidated = item.validationStatus === 'Relevant' || item.validationStatus === 'Future Relevant';
                        const hasMinScore = item.skillScore !== undefined && item.skillScore >= 75;
                        const canDelete = !isManagerValidated && !hasMinScore;

                        return (
                          <div 
                            key={item.id} 
                            className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-r-blue/40 hover:shadow-xs transition-all flex flex-col gap-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm sm:text-base text-gray-900">{item.name}</span>
                                  
                                  {/* Criticality: Key title is criticality and value is high/medium/low */}
                                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                    item.criticality === 'High'
                                      ? 'bg-orange-50 text-orange-750 border-orange-200 font-extrabold shadow-3xs'
                                      : item.criticality === 'Medium'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-3xs'
                                      : 'bg-sky-50 text-sky-700 border-sky-200 font-semibold shadow-3xs'
                                  }`}>
                                    Criticality: {item.criticality || 'High'}
                                  </span>

                                  {/* Completed Tag & Score /100 if skill assessment completed for the skill */}
                                  {(item.assessmentCompleted || (item.skillScore !== undefined && item.skillScore >= 75)) && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 inline-flex items-center gap-1 shadow-3xs">
                                        <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                                        Completed
                                      </span>
                                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full border bg-teal-50 text-teal-800 border-teal-200 inline-flex items-center shadow-3xs">
                                        {item.skillScore ?? 85}/100
                                      </span>
                                    </div>
                                  )}

                                  {/* Validation / Revalidation status */}
                                  {item.underRevalidation ? (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 inline-flex items-center gap-1 shadow-3xs" title={`Currently validated at Level ${item.validatedProficiencyLevel || item.proficiencyLevel}`}>
                                        <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                                        Validated (L{item.validatedProficiencyLevel || item.proficiencyLevel})
                                      </span>
                                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-800 border-amber-300 inline-flex items-center gap-1 shadow-3xs" title="Modifications submitted for revalidation review">
                                        <ClockIcon className="w-3 h-3 text-amber-600" />
                                        Revalidation Pending (L{item.proficiencyLevel})
                                      </span>
                                    </div>
                                  ) : isManagerValidated ? (
                                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1 shadow-3xs">
                                      <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                                      Validated (L{item.proficiencyLevel || 3})
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                                  <span>Exp: <strong className="text-gray-900">{item.experienceYears || '2 Years'}</strong></span>
                                  {item.applicationSummaries && item.applicationSummaries.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-r-blue font-bold">{item.applicationSummaries.length} Summaries</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-start sm:self-auto flex-shrink-0 flex-wrap">
                                <button
                                  onClick={() => navigate(`/skills/learn/${item.id}`)}
                                  className="p-1 text-r-blue hover:text-r-blue-dark bg-transparent border-none transition-colors flex items-center justify-center cursor-pointer"
                                  title="Learn"
                                >
                                  <BookOpenIcon className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => navigate(`/skills/edit-additional-skill/${item.id}`)}
                                  className="p-1 text-blue-600 hover:text-blue-800 bg-transparent border-none transition-colors flex items-center justify-center cursor-pointer"
                                  title="Edit"
                                >
                                  <EditIcon className="w-5 h-5" />
                                </button>

                                {canDelete ? (
                                  <button
                                    onClick={() => setSkillToDelete({ id: item.id, name: item.name })}
                                    className="p-1 text-gray-400 hover:text-rose-600 bg-transparent border-none transition-colors flex items-center justify-center cursor-pointer"
                                    title="Delete Skill"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <span 
                                    className="p-1 text-gray-300 bg-transparent flex items-center justify-center cursor-not-allowed"
                                    title={`Deletion locked: ${isManagerValidated ? 'Validated by Manager' : ''}${isManagerValidated && hasMinScore ? ' and ' : ''}${hasMinScore ? 'Score exceeds 75% min score' : ''}`}
                                  >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <AwardIcon className="w-3 h-3" />
                                {proofCount} {proofCount === 1 ? 'Proof' : 'Proofs'}
                              </span>
                              <div>
                                {item.underRevalidation ? (
                                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-800 border-amber-300 inline-flex items-center gap-1.5 shadow-3xs" title="Revalidation in progress for updated details">
                                    <ClockIcon className="w-3 h-3 text-amber-600" />
                                    Revalidation In Progress
                                  </span>
                                ) : (item.validationStatus === 'Relevant' || item.validationStatus === 'Future Relevant') ? (
                                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 inline-flex items-center gap-1.5 shadow-3xs" title="Validated by Manager">
                                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                                    Validated
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

            </section>

            {/* ======================================================= */}
            {/* 3. RIGHT BOX: YOUR SKILLS SNAPSHOT                      */}
            {/* ======================================================= */}
            <section className="lg:col-span-12 xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:max-h-full lg:overflow-y-auto no-scrollbar lg:self-start">
              
              <div className="pb-1 border-b border-gray-200 sm:col-span-2 lg:col-span-1">
                <h3 className="text-sm sm:text-base font-heading font-extrabold text-slate-800 uppercase tracking-wider">
                  Your Skills Snapshot
                </h3>
              </div>

              {/* 1. Role readiness */}
              <div className="bg-white hover:bg-slate-50/90 transition-all p-4 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between group min-h-[140px] h-auto md:aspect-[3/2]">
                <div>
                  <span className="text-xs sm:text-[13px] font-heading font-extrabold text-slate-500 uppercase tracking-wider block">role readiness</span>
                  <div className="text-4xl font-black text-slate-900 tracking-tight mt-2">
                    71%
                  </div>
                  <div className="text-sm font-bold text-gray-800 mt-3 leading-tight">
                    10 / 14 skills met
                  </div>
                  <div className="text-xs font-semibold text-rose-600 mt-1 leading-tight">
                    4 skill gaps remaining
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '71%' }} />
                  </div>
                </div>
              </div>

              {/* 2. Detailed Skill Gaps (Moved here to be directly below Role Readiness) */}
              <div className="bg-white hover:bg-slate-50/90 transition-all p-4 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between group min-h-[140px] h-auto md:aspect-[3/2]">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
                    <div>
                      <span className="text-xs sm:text-[13px] font-heading font-extrabold text-slate-500 uppercase tracking-wider block">skill gaps</span>
                      <div className="text-base font-extrabold text-amber-600 tracking-tight mt-1">
                        4 Skill Gaps
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-800 flex items-start gap-1.5">
                      <span className="text-rose-600 flex-shrink-0" title="Critical">🔴</span>
                      <div>
                        <div className="font-bold text-gray-900 text-xs leading-tight">5G NR Radio Access</div>
                        <div className="text-[10px] text-gray-500 font-semibold">L2 / Required L3</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-800 flex items-start gap-1.5">
                      <span className="text-amber-500 flex-shrink-0" title="High">🟠</span>
                      <div>
                        <div className="font-bold text-gray-900 text-xs leading-tight">Microservices Architecture</div>
                        <div className="text-[10px] text-gray-500 font-semibold">L2 / Required L3</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Role Leadership Rank Tile */}
              <button
                type="button"
                onClick={() => {
                  setLeaderboardScope('role');
                  handleSelectSubTab('leaderboard');
                }}
                className="bg-white hover:bg-slate-50/90 hover:border-r-blue/40 transition-all p-4 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between text-left group w-full cursor-pointer min-h-[140px] h-auto md:aspect-[3/2]"
              >
                <div>
                  <span className="text-xs sm:text-[13px] font-heading font-extrabold text-slate-500 uppercase tracking-wider block">role rank</span>
                  <div className="text-3xl font-black text-r-blue tracking-tight mt-2">
                    #4 <span className="text-xs font-semibold text-slate-500">of 63</span>
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-r-blue text-xs font-bold rounded-md border border-blue-200">
                    2,650 pts
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-bold border-t border-gray-100 pt-2 w-full">
                  <span>View Role Leaderboard</span>
                  <ChevronRightIcon className="w-4 h-4 text-r-blue group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 4. Org-Wide Leadership Rank Tile */}
              <button
                type="button"
                onClick={() => {
                  setLeaderboardScope('org');
                  handleSelectSubTab('leaderboard');
                }}
                className="bg-white hover:bg-slate-50/90 hover:border-indigo-200/40 transition-all p-4 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between text-left group w-full cursor-pointer min-h-[140px] h-auto md:aspect-[3/2]"
              >
                <div>
                  <span className="text-xs sm:text-[13px] font-heading font-extrabold text-slate-500 uppercase tracking-wider block">org rank</span>
                  <div className="text-3xl font-black text-indigo-600 tracking-tight mt-2">
                    #12 <span className="text-xs font-semibold text-slate-500">of 412</span>
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-md border border-indigo-200">
                    2,650 pts
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-bold border-t border-gray-100 pt-2 w-full">
                  <span>View Org Leaderboard</span>
                  <ChevronRightIcon className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </section>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB: CREDENTIALS (Leaderboard, Points, Badges)         */}
      {/* ========================================================= */}
      {(activeSubTab === 'credentials' || activeSubTab === 'rewards' || activeSubTab === 'leaderboard' || activeSubTab === 'badges') && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
          {/* Breadcrumb & Back Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 font-medium">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                id="credentials-back-home"
                onClick={() => handleSelectSubTab('home')}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-slate-800 text-xs font-bold rounded-xl border border-gray-200 shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4 text-r-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Skills Home</span>
              </button>

              <div className="flex items-center gap-2">
                <span>Employee Portal</span>
                <span>/</span>
                <span className="text-gray-900 font-bold">Skills Intelligence</span>
                <span>/</span>
                <span className="text-r-blue font-bold">Credentials</span>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-6">
            
            {/* Leaderboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2.5">
                  <StarIcon className="w-6 h-6 text-amber-500 fill-amber-400" />
                  <h2 className="text-2xl font-heading font-extrabold text-gray-900">Credentials & Recognitions</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Track your standing, skill points, digital skill badges, and enterprise role readiness credentials.
                </p>
              </div>
            </div>

            {/* Sub-Filters: Leaderboard vs Points vs Badges */}
            <div className="flex border-b border-gray-150 pb-px gap-2">
              <button
                type="button"
                onClick={() => setLeaderboardTab('leaderboard')}
                className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  leaderboardTab === 'leaderboard'
                    ? 'border-r-blue text-r-blue font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-bold'
                }`}
              >
                <StarIcon className="w-4 h-4" />
                Leaderboard
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardTab('points')}
                className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  leaderboardTab === 'points'
                    ? 'border-r-blue text-r-blue font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-bold'
                }`}
              >
                <AwardIcon className="w-4 h-4" />
                Points
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardTab('badges')}
                className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  leaderboardTab === 'badges'
                    ? 'border-r-blue text-r-blue font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-bold'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Badges
              </button>
            </div>

            {leaderboardTab === 'points' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Total points summary card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-r-blue block">Total Accumulated Skill Points</span>
                    <span className="text-3xl font-black text-r-blue mt-1 block">12,100 pts</span>
                  </div>
                  <div className="text-xs text-blue-800 font-bold bg-blue-100/50 px-3.5 py-2 rounded-xl border border-blue-200">
                    🏆 You are in the top 10% of Platform Engineering!
                  </div>
                </div>

                {/* Points history table */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-3xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wider font-bold text-gray-500 bg-gray-50/90">
                        <th className="py-3.5 px-5">Skill / Competency</th>
                        <th className="py-3.5 px-5">Activity / Achievement Type</th>
                        <th className="py-3.5 px-5 text-center">Points Gained</th>
                        <th className="py-3.5 px-5 text-right">Date Accredited</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm bg-white">
                      {[
                        { id: 'p-1', skillName: 'Kubernetes & Container Orchestration', pointsGained: 1200, date: '24 Aug 2026', type: 'Assessment Passed' },
                        { id: 'p-2', skillName: 'React & Modern Frontend Engineering', pointsGained: 850, date: '12 Aug 2026', type: 'Course Certification' },
                        { id: 'p-3', skillName: '5G NR Radio Access', pointsGained: 1000, date: '28 Jul 2026', type: 'Manager Verified Evidence' },
                        { id: 'p-4', skillName: 'Microservices Design Patterns', pointsGained: 600, date: '15 Jul 2026', type: 'Assessment Passed' },
                        { id: 'p-5', skillName: 'Agile & Scrum Leadership', pointsGained: 400, date: '02 Jul 2026', type: 'Internal Workshop' },
                        { id: 'p-6', skillName: 'RESTful API & GraphQL Design', pointsGained: 750, date: '18 Jun 2026', type: 'Course Certification' },
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-5 font-bold text-gray-900">{item.skillName}</td>
                          <td className="py-4 px-5 font-medium text-gray-600">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center font-black text-emerald-600">
                            +{item.pointsGained.toLocaleString()} pts
                          </td>
                          <td className="py-4 px-5 text-right font-semibold text-gray-500">{item.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : leaderboardTab === 'badges' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Badges Overview Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/60 rounded-2xl border border-indigo-100 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">Total Badges</span>
                      <AwardIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-indigo-950">7</span>
                      <span className="text-xs font-semibold text-indigo-700">/ 9 Total Available</span>
                    </div>
                    <div className="w-full bg-indigo-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50/80 to-violet-50/60 rounded-2xl border border-purple-100 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900">Skill Badges</span>
                      <SparklesIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-purple-950">4 Earned</span>
                      <span className="text-xs font-semibold text-purple-700">1 In Progress</span>
                    </div>
                    <span className="text-[11px] text-purple-700 block mt-1 font-medium">Domain & Technical Mastery</span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-2xl border border-emerald-100 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900">Role Readiness</span>
                      <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-950">3 Certified</span>
                      <span className="text-xs font-semibold text-emerald-700">1 Candidate</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 block mt-1 font-medium">Job Architecture Benchmark</span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-100 shadow-3xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">Top Credential Tier</span>
                      <StarIcon className="w-5 h-5 text-amber-600 fill-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-950">Platinum</span>
                    </div>
                    <span className="text-[11px] text-amber-700 block mt-1 font-medium">Top 5% Technical Tier</span>
                  </div>
                </div>

                {/* Badges Filtering & Search Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBadgeCategoryFilter('all')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        badgeCategoryFilter === 'all'
                          ? 'bg-r-blue text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      All Badges ({SKILL_BADGES_DATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeCategoryFilter('skill')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        badgeCategoryFilter === 'skill'
                          ? 'bg-purple-700 text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Skill Badges ({SKILL_BADGES_DATA.filter(b => b.type === 'skill').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeCategoryFilter('role_readiness')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        badgeCategoryFilter === 'role_readiness'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Role Readiness Badges ({SKILL_BADGES_DATA.filter(b => b.type === 'role_readiness').length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search badges or skills..."
                      value={badgeSearchQuery}
                      onChange={(e) => setBadgeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-white text-xs font-semibold text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:border-r-blue focus:ring-1 focus:ring-r-blue placeholder-gray-400"
                    />
                    {badgeSearchQuery && (
                      <button
                        onClick={() => setBadgeSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Badges Grid */}
                {(() => {
                  const filteredBadges = SKILL_BADGES_DATA.filter((badge) => {
                    if (badgeCategoryFilter === 'skill' && badge.type !== 'skill') return false;
                    if (badgeCategoryFilter === 'role_readiness' && badge.type !== 'role_readiness') return false;
                    if (badgeSearchQuery.trim()) {
                      const q = badgeSearchQuery.toLowerCase();
                      const matchTitle = badge.title.toLowerCase().includes(q);
                      const matchCategory = badge.category.toLowerCase().includes(q);
                      const matchSkills = badge.skillsCovered.some(s => s.toLowerCase().includes(q));
                      if (!matchTitle && !matchCategory && !matchSkills) return false;
                    }
                    return true;
                  });

                  if (filteredBadges.length === 0) {
                    return (
                      <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <AwardIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <h4 className="text-base font-bold text-gray-900">No Badges Match Your Filter</h4>
                        <p className="text-xs text-gray-500 mt-1">Try broadening your search query or selecting All Badges.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredBadges.map((badge) => {
                        const isSkill = badge.type === 'skill';
                        const isEarned = badge.status === 'Earned';
                        const isPlatinum = badge.tier === 'Platinum';
                        const isGold = badge.tier === 'Gold';

                        return (
                          <div
                            key={badge.id}
                            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden bg-white ${
                              isEarned
                                ? isSkill
                                  ? 'border-purple-200/80 hover:border-purple-300'
                                  : 'border-emerald-200/80 hover:border-emerald-300'
                                : 'border-gray-200/80 bg-slate-50/50'
                            }`}
                          >
                            {/* Top colored accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                              isSkill 
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`} />

                            <div className="space-y-3 pt-1">
                              {/* Type & Tier badges */}
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                                  isSkill
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {isSkill ? 'Skill Badge' : 'Role Readiness'}
                                </span>

                                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                                  isPlatinum
                                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                                    : isGold
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : badge.tier === 'Silver'
                                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}>
                                  {badge.tier}
                                </span>
                              </div>

                              {/* Badge Graphic & Title */}
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                                  isSkill
                                    ? isEarned
                                      ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-400'
                                      : 'bg-purple-100 text-purple-700 border-purple-200'
                                    : isEarned
                                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400'
                                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}>
                                  {isSkill ? (
                                    <SparklesIcon className="w-6 h-6" />
                                  ) : (
                                    <ShieldCheckIcon className="w-6 h-6" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                                    {badge.title}
                                  </h3>
                                  <span className="text-xs font-semibold text-gray-500 block">
                                    {badge.category}
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {badge.description}
                              </p>

                              {/* Score & Criteria Box */}
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
                                <span className="font-bold text-gray-700">Criteria:</span>
                                <span className={`font-extrabold ${isEarned ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {badge.scoreOrCriteria}
                                </span>
                              </div>

                              {/* Skills Covered Pills */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                  Covered Skills
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {badge.skillsCovered.map((sk, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Footer Status & Credential Action */}
                            <div className="pt-4 mt-4 border-t border-gray-150 flex items-center justify-between gap-2">
                              <div>
                                {isEarned ? (
                                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Earned {badge.accreditedDate && `• ${badge.accreditedDate}`}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                    <ClockIcon className="w-4 h-4 text-amber-600" />
                                    <span>In Progress</span>
                                  </div>
                                )}
                              </div>

                              {isEarned && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBadgeForModal(badge)}
                                  className="px-3 py-1.5 text-xs font-extrabold text-r-blue hover:text-white bg-blue-50 hover:bg-r-blue border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                  <span>Credential</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Leaderboard Scope Toggles & Time Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Filter Standings
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Scope Segmented Control */}
                    <div className="bg-gray-200/60 p-1 rounded-xl flex items-center border border-gray-300/40">
                      <button
                        onClick={() => setLeaderboardScope('role')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          leaderboardScope === 'role'
                            ? 'bg-white text-r-blue shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Role Specific
                      </button>
                      <button
                        onClick={() => setLeaderboardScope('org')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          leaderboardScope === 'org'
                            ? 'bg-white text-r-blue shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Org Wide
                      </button>
                    </div>

                    {/* Time Filter Pills */}
                    <div className="bg-gray-200/60 p-1 rounded-xl flex items-center border border-gray-300/40">
                      <button
                        onClick={() => setLeaderboardTime('30d')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          leaderboardTime === '30d'
                            ? 'bg-r-blue text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        30 Days
                      </button>
                      <button
                        onClick={() => setLeaderboardTime('6m')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          leaderboardTime === '6m'
                            ? 'bg-r-blue text-white shadow-2xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        6 Months
                      </button>
                    </div>

                  </div>
                </div>

                {/* Full Leaderboard Table */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-3xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wider font-bold text-gray-500 bg-gray-50/90">
                        <th className="py-3.5 px-4">Rank</th>
                        <th className="py-3.5 px-4">Learner</th>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4 text-center">Skills Mastered</th>
                        <th className="py-3.5 px-4 text-right">Skill Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm bg-white">
                      {currentLeaderboard.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`transition-colors ${
                            user.isCurrentUser 
                              ? 'bg-blue-50/90 border-l-4 border-r-blue font-semibold' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          
                          {/* Rank */}
                          <td className="py-4 px-4 font-bold text-base">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${
                              user.rank === 1 ? 'bg-amber-400 text-white font-black' :
                              user.rank === 2 ? 'bg-gray-300 text-gray-800' :
                              user.rank === 3 ? 'bg-amber-600/80 text-white' : 'text-gray-700 bg-gray-100'
                            }`}>
                              #{user.rank}
                            </span>
                          </td>

                          {/* Learner Name & Avatar */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3.5">
                              <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-300 shadow-2xs" />
                              <div>
                                <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                                  {user.name}
                                  {user.isCurrentUser && (
                                    <span className="px-2 py-0.5 bg-r-blue text-white text-xs font-bold rounded-full">You</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 font-normal">{user.role}</p>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 px-4 text-gray-700 font-medium text-sm">
                            {user.department}
                          </td>

                          {/* Skills Mastered */}
                          <td className="py-4 px-4 text-center">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-xs">
                              {user.skillsMastered} Mastered
                            </span>
                          </td>

                          {/* Skill Points */}
                          <td className="py-4 px-4 text-right">
                            <span className="text-base font-black text-r-blue">
                              {user.points.toLocaleString()} pts
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </section>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: SKILL ADMIN                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'skill-admin' && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
          
          {/* Admin Header */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-heading font-extrabold text-gray-900 tracking-tight">
                  Enterprise Competency Administrator
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Publish new engineering competencies, govern the master registry, and approve pending validation requests.
              </p>
            </div>
            
            {/* Admin Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-gray-200 p-3 rounded-xl min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Skills</span>
                <span className="text-xl font-extrabold text-gray-900">{librarySkills.length} Registry</span>
              </div>
              <div className="bg-slate-50 border border-gray-200 p-3 rounded-xl min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Queue Status</span>
                <span className="text-xl font-extrabold text-indigo-600">{pendingSubmissions.length} Pending</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Add New Skill Form */}
            <div className="xl:col-span-5 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs h-fit space-y-6">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-gray-900">
                  Publish New Competency
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add custom role-mapped modules and certifications directly to the Enterprise Catalog.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSkillName.trim() || !newSkillDesc.trim()) {
                    alert('Please provide a valid skill name and description.');
                    return;
                  }
                  const newSkill = {
                    id: `skill-${Date.now()}`,
                    name: newSkillName,
                    type: newSkillType,
                    category: newSkillCategory,
                    criticality: newSkillCriticality as any,
                    demand: 'high demand',
                    description: newSkillDesc
                  };
                  setLibrarySkills([newSkill, ...librarySkills]);
                  setNewSkillName('');
                  setNewSkillDesc('');
                  alert(`"${newSkillName}" has been successfully published to the Jio master catalog!`);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Competency Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Docker Containerization, CI/CD Jenkins Pipelines"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-r-blue focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Skill Type</label>
                    <select
                      value={newSkillType}
                      onChange={(e) => setNewSkillType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Functional">Functional</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Domain">Domain</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Criticality</label>
                    <select
                      value={newSkillCriticality}
                      onChange={(e) => setNewSkillCriticality(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Skill Group / Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none"
                  >
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Mobile Technologies">Mobile Technologies</option>
                    <option value="5G Technologies">5G Technologies</option>
                    <option value="Methodology & Tools">Methodology & Tools</option>
                    <option value="Leadership & Strategy">Leadership & Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a comprehensive description of the skill, required proficiency indicators, and typical usage..."
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-r-blue focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Publish Competency
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Pending Validation Queue */}
            <div className="xl:col-span-7 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-gray-900">
                  Validation Queue ({pendingSubmissions.length})
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Review professional certification proof, course logs, and manager endorsements submitted by staff.
                </p>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50">
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-bold text-gray-800 mt-2">All submissions reviewed!</p>
                  <p className="text-xs text-gray-500">Validation queue is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xs transition-all space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{sub.name}</h4>
                          <p className="text-xs text-gray-500 font-semibold">{sub.role}</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-100">
                          {sub.status}
                        </span>
                      </div>

                      <div className="py-2.5 px-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase">Competency Requested</span>
                          <span className="font-extrabold text-gray-800">{sub.skill}</span>
                        </div>
                        <div className="pt-1">
                          <span className="text-gray-400 font-bold block text-[10px] uppercase">Evidence of Proficiency</span>
                          <span className="font-bold text-indigo-600 underline flex items-center gap-1">
                            📄 {sub.evidence}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] font-semibold text-gray-400">Received {sub.date}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Requested further details / clarification from ${sub.name}.`);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-300 shadow-2xs transition-all cursor-pointer"
                          >
                            Needs Info
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingSubmissions(pendingSubmissions.filter((p) => p.id !== sub.id));
                              alert(`Successfully verified skill "${sub.skill}" for ${sub.name}! They have been accredited skill points.`);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg border border-indigo-600 shadow-2xs transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: EXPLORE (formerly SKILLS LIBRARY)               */}
      {/* ========================================================= */}
      {activeSubTab === 'explore' && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
          
          {/* Search Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-gray-900">
                Jio Enterprise Explore
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Explore available technical, functional, behavioral, and domain competencies across Reliance Jio engineering.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-grow">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search skills, categories, keywords (e.g. Kubernetes, 5G Core, AI)..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-r-blue focus:outline-none"
                />
              </div>

              {/* Custom Dropdown Multi-Select for Skill Group (Requirement 4) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="w-full sm:w-56 px-4 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none flex items-center justify-between gap-2 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="truncate">
                    {selectedSkillGroups.length === 0 
                      ? 'Skill Group: All' 
                      : `Skill Group: (${selectedSkillGroups.length} selected)`}
                  </span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isGroupDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-3 space-y-3 animate-fade-in">
                    {/* Search Bar inside Dropdown */}
                    <div className="relative">
                      <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search skill groups..."
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-[11px] font-medium focus:ring-2 focus:ring-r-blue focus:outline-none"
                      />
                    </div>

                    {/* Checkbox Options */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                      {Array.from(new Set(SKILL_LIBRARY.map(item => item.category)))
                        .filter(g => g.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                        .map(group => {
                          const isChecked = selectedSkillGroups.includes(group);
                          return (
                            <label key={group} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedSkillGroups(selectedSkillGroups.filter(g => g !== group));
                                  } else {
                                    setSelectedSkillGroups([...selectedSkillGroups, group]);
                                  }
                                }}
                                className="w-3.5 h-3.5 text-r-blue rounded border-gray-300 focus:ring-r-blue"
                              />
                              <span className="text-[11px] font-bold text-gray-700 truncate">{group}</span>
                            </label>
                          );
                        })}
                      {Array.from(new Set(SKILL_LIBRARY.map(item => item.category))).filter(g => g.toLowerCase().includes(groupSearchQuery.toLowerCase())).length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400 font-medium">
                          No skill groups found
                        </div>
                      )}
                    </div>

                    {/* Action buttons inside Dropdown */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedSkillGroups([])}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGroupDropdownOpen(false)}
                        className="px-3 py-1 bg-r-blue text-white rounded-md hover:bg-r-blue-dark"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <select
                value={libraryTypeFilter}
                onChange={(e) => setLibraryTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none"
              >
                <option value="All">All Skill Types</option>
                <option value="Technical">Technical</option>
                <option value="Functional">Functional</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Domain">Domain</option>
              </select>
            </div>
          </div>

          {/* Skill Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLibrary.map((skill) => {
              const truncatedDesc = skill.description.length > 105 
                ? skill.description.slice(0, 102) + '...' 
                : skill.description;
              return (
                <div key={skill.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-r-blue hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded border border-indigo-100">
                        {skill.type}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 font-heading">
                      {skill.name}
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400 block mb-2">{skill.category}</span>

                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      {truncatedDesc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-500">
                      Levels: <strong className="text-gray-900">L1 – L4</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/skills/learn/${skill.id}`)}
                      className="p-2 bg-r-blue hover:bg-r-blue-dark text-white rounded-lg shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                      title="Learn Skill"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: MY TEAM                                       */}
      {/* ========================================================= */}
      {activeSubTab === 'my-team' && (() => {
        // If an employee's detailed dossier is selected, render the EmployeeSkillProfileView component
        if (selectedEmployeeForDossier) {
          const empSurveyRecord = managerSurveys[selectedEmployeeForDossier.id] || {
            reporteeId: selectedEmployeeForDossier.id,
            status: 'Not started',
            draftRatings: {},
            managerRatings: {}
          };

          return (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <EmployeeSkillProfileView
                member={selectedEmployeeForDossier}
                surveyRecord={empSurveyRecord}
                onBack={() => setSelectedEmployeeForDossier(null)}
                onConductSurvey={(member) => handleOpenManagerSurvey(member)}
                onOpenValidationReview={(valItem) => setSelectedValidationForReview(valItem)}
                onPreviewDoc={(doc, empName, skName) => setActiveEvidenceModalDoc({ doc, employeeName: empName, skillName: skName })}
              />
            </div>
          );
        }

        const totalReportsCount = teamMembers.length;
        const completedSurveysCount = teamMembers.filter(m => managerSurveys[m.id]?.status === 'Completed').length;
        const inProgressSurveysCount = teamMembers.filter(m => managerSurveys[m.id]?.status === 'In progress').length;
        const notStartedSurveysCount = teamMembers.filter(m => !managerSurveys[m.id] || managerSurveys[m.id]?.status === 'Not started').length;
        const teamAvgReadiness = totalReportsCount > 0 
          ? Math.round(teamMembers.reduce((acc, m) => acc + (m.readiness || 0), 0) / totalReportsCount) 
          : 0;
        const criticalGapsCount = teamMembers.filter(m => m.criticalGap && m.criticalGap !== 'None').length;

        const pendingValidationsCount = managerValidations.filter(v => v.status === 'Pending').length;
        const completedValidationsCount = managerValidations.filter(v => v.status !== 'Pending').length;

        const filteredTeamMembers = teamMembers.filter(member => {
          const status = managerSurveys[member.id]?.status || 'Not started';
          if (teamSurveyFilter === 'All') return true;
          return status === teamSurveyFilter;
        });

        const filteredValidations = managerValidations.filter(v => {
          if (validationFilter === 'All') return true;
          if (validationFilter === 'Pending') return v.status === 'Pending';
          return v.status !== 'Pending';
        });

        return (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            
            {/* Team Overview Metrics Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-heading font-extrabold text-gray-900">
                    My Team Skill Intelligence & Validation Hub
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Direct Reports: <strong className="text-gray-900">{totalReportsCount} Engineers</strong> • Team Average Readiness: <strong className="text-emerald-700">{teamAvgReadiness}%</strong> • Evaluations: <strong className="text-r-blue">{completedSurveysCount} of {totalReportsCount} Completed</strong> • Pending Validations: <strong className="text-amber-700">{pendingValidationsCount}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-r-blue border border-blue-200 text-xs font-bold">
                    Manager View Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Total Direct Reports</span>
                  <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{totalReportsCount} Direct Reports</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Click any employee to view profile</span>
                </div>
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Surveys Completed</span>
                  <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{completedSurveysCount} Evaluated</span>
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">{inProgressSurveysCount} Drafts in Progress</span>
                </div>
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Skill Validations</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-amber-900">{pendingValidationsCount} Pending</span>
                    <span className="text-xs font-bold text-amber-700">({completedValidationsCount} decided)</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-0.5 block">Additional skills awaiting verification</span>
                </div>
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-r-blue block">Critical Gaps Alert</span>
                  <span className="text-2xl font-extrabold text-r-blue mt-1 block">{criticalGapsCount} Identified</span>
                  <span className="text-[11px] text-blue-700 mt-0.5 block">Across team competencies</span>
                </div>
              </div>

              {/* Sub-view Navigation Tabs */}
              <div className="pt-2 border-t border-gray-150 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMyTeamSubView('roster')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      myTeamSubView === 'roster'
                        ? 'bg-white text-r-blue shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AwardIcon className="w-4 h-4" />
                    <span>Direct Reports Roster & Surveys</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      myTeamSubView === 'roster' ? 'bg-blue-100 text-r-blue' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {totalReportsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMyTeamSubView('validations')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      myTeamSubView === 'validations'
                        ? 'bg-white text-r-blue shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Skill Validations Hub (Additional Skills)</span>
                    {pendingValidationsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                        {pendingValidationsCount} Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {managerValidations.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {myTeamSubView === 'roster' 
                    ? 'Tip: Click on any employee row to open their full skill profile' 
                    : 'Review and validate additional skill applications submitted by direct reports'}
                </div>
              </div>
            </div>

            {/* VIEW 1: TEAM ROSTER & SURVEYS */}
            {myTeamSubView === 'roster' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-gray-900">
                      Direct Reports Capability Status & Surveys
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Click any employee to view their detailed skill profile (role-mapped and additional skills), or conduct manager surveys.
                    </p>
                  </div>

                  {/* Filter Tabs by Manager Survey Status */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTeamSurveyFilter('All')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        teamSurveyFilter === 'All' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({totalReportsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamSurveyFilter('Not started')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        teamSurveyFilter === 'Not started' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Not Started ({notStartedSurveysCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamSurveyFilter('In progress')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        teamSurveyFilter === 'In progress' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Progress ({inProgressSurveysCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamSurveyFilter('Completed')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        teamSurveyFilter === 'Completed' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed ({completedSurveysCount})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">DIRECT REPORTEE</th>
                        <th className="py-3 px-4">ROLE & GRADE</th>
                        <th className="py-3 px-4 text-center">MANAGER SURVEY STATUS</th>
                        <th className="py-3 px-4 text-center">ROLE READINESS</th>
                        <th className="py-3 px-4 text-center">CRITICAL SKILL GAP</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs bg-white">
                      {filteredTeamMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                            No reportees match the selected survey status filter "{teamSurveyFilter}".
                          </td>
                        </tr>
                      ) : (
                        filteredTeamMembers.map((member) => {
                          const surveyRecord = managerSurveys[member.id] || {
                            reporteeId: member.id,
                            status: 'Not started',
                            draftRatings: {},
                            managerRatings: {}
                          };
                          const status: ManagerSurveyStatus = surveyRecord.status;
                          const isExpanded = expandedTeamMemberId === member.id;
                          const ratedSkillsCount = Object.keys(surveyRecord.draftRatings || {}).length;
                          const memberPendingVals = managerValidations.filter(v => v.employeeId === member.id && v.status === 'Pending').length;

                          return (
                            <React.Fragment key={member.id}>
                              <tr 
                                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                onClick={() => setSelectedEmployeeForDossier(member)}
                              >
                                {/* Direct Reportee */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={member.photo} 
                                      alt={member.name} 
                                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-r-blue flex-shrink-0 transition-all" 
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-sm text-gray-900 group-hover:text-r-blue transition-colors block">
                                          {member.name}
                                        </span>
                                        {memberPendingVals > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold" title={`${memberPendingVals} pending skill validations`}>
                                            {memberPendingVals} val pending
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-gray-500">
                                        {member.roleSkills.length} Role Skills &bull; {member.additionalSkills?.length || 0} Additional Skills
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Role & Grade */}
                                <td className="py-3.5 px-4 text-gray-700 font-medium">
                                  <div>
                                    <span className="font-bold text-gray-900">{member.role}</span>
                                    <span className="text-gray-400 font-normal ml-1">({member.grade})</span>
                                  </div>
                                  <span className="text-[11px] text-gray-500 block">{member.department}</span>
                                </td>

                                {/* Manager Survey Status */}
                                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  {status === 'Completed' ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-black rounded-full border border-emerald-300 flex items-center gap-1 shadow-3xs">
                                        <CheckCircleIcon className="w-3 h-3 text-emerald-700" />
                                        Completed
                                      </span>
                                      {surveyRecord.completedAt && (
                                        <span className="text-[10px] text-emerald-800 font-medium mt-0.5">
                                          {surveyRecord.completedAt}
                                        </span>
                                      )}
                                    </div>
                                  ) : status === 'In progress' ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-black rounded-full border border-amber-300 flex items-center gap-1 shadow-3xs">
                                        <EditIcon className="w-3 h-3 text-amber-700" />
                                        In Progress
                                      </span>
                                      <span className="text-[10px] text-amber-800 font-bold mt-0.5">
                                        {ratedSkillsCount}/{member.roleSkills.length} rated
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full border border-slate-300 flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3 text-slate-500" />
                                        Not started
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                        Survey Pending
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Role Readiness */}
                                <td className="py-3.5 px-4 text-center font-extrabold text-r-blue">
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <div className="inline-flex items-center gap-2">
                                      <span className={`font-black ${
                                        member.readiness >= 85 
                                          ? 'text-emerald-700' 
                                          : member.readiness >= 70 
                                          ? 'text-r-blue' 
                                          : 'text-amber-700'
                                      }`}>
                                        {member.readiness}%
                                      </span>
                                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            member.readiness >= 85 
                                              ? 'bg-emerald-600' 
                                              : member.readiness >= 70 
                                              ? 'bg-r-blue' 
                                              : 'bg-amber-500'
                                          }`} 
                                          style={{ width: `${member.readiness}%` }} 
                                        />
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-semibold">
                                      {status === 'Completed' ? 'Manager Assessed' : 'Baseline / Self'}
                                    </span>
                                  </div>
                                </td>

                                {/* Critical Skill Gap */}
                                <td className="py-3.5 px-4 text-center">
                                  {member.criticalGap === 'None' ? (
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-200">
                                      None ✓
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 text-[11px] font-bold rounded-md border border-rose-200">
                                      {member.criticalGap}
                                    </span>
                                  )}
                                </td>

                                {/* Action Buttons */}
                                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      id={`btn-view-profile-${member.id}`}
                                      onClick={() => setSelectedEmployeeForDossier(member)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                      title="Open full employee skills profile dossier"
                                    >
                                      <span>View Profile</span>
                                    </button>

                                    {status === 'Completed' ? (
                                      <button
                                        type="button"
                                        id={`btn-manage-survey-${member.id}`}
                                        onClick={() => handleOpenManagerSurvey(member)}
                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg text-xs border border-slate-300 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                        title="Update or review manager evaluation"
                                      >
                                        <EditIcon className="w-3.5 h-3.5 text-r-blue" />
                                        <span>Update Survey</span>
                                      </button>
                                    ) : status === 'In progress' ? (
                                      <button
                                        type="button"
                                        id={`btn-manage-survey-${member.id}`}
                                        onClick={() => handleOpenManagerSurvey(member)}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                        title="Resume partially completed draft survey"
                                      >
                                        <SparklesIcon className="w-3.5 h-3.5 text-amber-200" />
                                        <span>Resume Survey</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        id={`btn-manage-survey-${member.id}`}
                                        onClick={() => handleOpenManagerSurvey(member)}
                                        className="px-3 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                        title="Open role competency evaluation survey"
                                      >
                                        <AwardIcon className="w-3.5 h-3.5" />
                                        <span>Conduct Survey</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setExpandedTeamMemberId(isExpanded ? null : member.id)}
                                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                      title={isExpanded ? 'Collapse role skills' : 'Expand role skills breakdown'}
                                    >
                                      <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-r-blue' : ''}`} />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expandable Breakdown Drawer */}
                              {isExpanded && (
                                <tr className="bg-slate-50/80">
                                  <td colSpan={6} className="p-4 sm:p-5 border-y border-slate-200">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <AwardIcon className="w-4 h-4 text-r-blue" />
                                          <span className="font-heading font-extrabold text-xs text-slate-900">
                                            Role Competency Matrix for {member.name} ({member.roleSkills.length} Mapped Skills)
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedEmployeeForDossier(member)}
                                            className="text-r-blue hover:underline text-xs font-bold"
                                          >
                                            View Full Employee Profile (Role & Additional Skills) →
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenManagerSurvey(member)}
                                            className="text-r-blue hover:underline text-xs font-bold"
                                          >
                                            Open Survey Form →
                                          </button>
                                        </div>
                                      </div>

                                      {member.roleSkills.length === 0 ? (
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                          <AlertCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                          <span>
                                            No role-mapped competencies are configured for this profile ({member.role}, {member.grade}). Click "Conduct Survey" to view empty state actions or map competencies in Skill Admin.
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                          <table className="w-full text-left text-xs">
                                            <thead>
                                              <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="py-2.5 px-3">Role Competency</th>
                                                <th className="py-2.5 px-3">Category</th>
                                                <th className="py-2.5 px-3 text-center">Required Target</th>
                                                <th className="py-2.5 px-3 text-center">Employee Self-Rating</th>
                                                <th className="py-2.5 px-3 text-center">Manager Evaluation</th>
                                                <th className="py-2.5 px-3 text-center">Status / Gap</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {member.roleSkills.map((sk) => {
                                                const mRating = surveyRecord.managerRatings[sk.id] !== undefined 
                                                  ? surveyRecord.managerRatings[sk.id] 
                                                  : sk.managerRating;
                                                const draftRating = surveyRecord.draftRatings[sk.id];
                                                const target = sk.targetLevel || 3;
                                                const evaluatedRating = mRating !== undefined ? mRating : draftRating;
                                                const hasEvaluated = evaluatedRating !== undefined;
                                                const isGap = hasEvaluated && evaluatedRating < target;

                                                return (
                                                  <tr key={sk.id} className="hover:bg-slate-50/60">
                                                    <td className="py-2.5 px-3">
                                                      <span className="font-bold text-slate-800 block">{sk.name}</span>
                                                      <span className="text-[10px] text-slate-500 font-normal">{sk.description}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-600">
                                                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                                        {sk.category}
                                                      </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-black">
                                                        L{sk.targetLevel}
                                                      </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      {sk.selfRating !== undefined ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs font-black">
                                                          L{sk.selfRating}
                                                        </span>
                                                      ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                                                          Not submitted
                                                        </span>
                                                      )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      {mRating !== undefined ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-black">
                                                          L{mRating} (Submitted)
                                                        </span>
                                                      ) : draftRating !== undefined ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold">
                                                          L{draftRating} (Draft)
                                                        </span>
                                                      ) : (
                                                        <span className="text-slate-400 text-[11px] italic">
                                                          Pending
                                                        </span>
                                                      )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      {hasEvaluated ? (
                                                        isGap ? (
                                                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black">
                                                            -{target - evaluatedRating} Lvl Gap
                                                          </span>
                                                        ) : (
                                                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                                                            Target Met ✓
                                                          </span>
                                                        )
                                                      ) : (
                                                        <span className="text-slate-400 text-[10px]">
                                                          Unassessed
                                                        </span>
                                                      )}
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 2: COMPLETE LIST OF PENDING AND COMPLETED SKILL VALIDATIONS */}
            {myTeamSubView === 'validations' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-r-blue" />
                      Employee Additional Skills Validation Queue
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Review skill declarations, application justifications, and preview or download attached evidence documents to approve or reject proficiency validations.
                    </p>
                  </div>

                  {/* Filter Tabs: All / Pending / Completed */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setValidationFilter('All')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        validationFilter === 'All' 
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({managerValidations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidationFilter('Pending')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        validationFilter === 'Pending' 
                          ? 'bg-amber-500 text-white shadow-2xs font-extrabold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Pending Verification</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        validationFilter === 'Pending' ? 'bg-white text-amber-900 font-extrabold' : 'bg-amber-100 text-amber-900 font-bold'
                      }`}>
                        {pendingValidationsCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidationFilter('Completed')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        validationFilter === 'Completed' 
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed ({completedValidationsCount})
                    </button>
                  </div>
                </div>

                {/* Validations Cards List */}
                {filteredValidations.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-heading font-extrabold text-gray-900">
                      No validations found for filter "{validationFilter}"
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      {validationFilter === 'Pending' 
                        ? 'All additional skill applications submitted by your team members have been reviewed and validated.' 
                        : 'No skill validation records match the selected status filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredValidations.map((item) => {
                      const isPending = item.status === 'Pending';
                      const levelName = item.selectedLevel === 4 ? 'Expert' : item.selectedLevel === 3 ? 'Practitioner' : item.selectedLevel === 2 ? 'Intermediate' : 'Beginner';

                      return (
                        <div 
                          key={item.id}
                          className={`rounded-2xl border p-5 transition-all ${
                            isPending 
                              ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400 shadow-xs' 
                              : 'bg-white border-gray-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            
                            {/* Left: Employee Info & Skill Info */}
                            <div className="space-y-3 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                {/* Employee Header */}
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={item.employeePhoto} 
                                    alt={item.employeeName} 
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300"
                                  />
                                  <div>
                                    <span className="font-extrabold text-xs text-gray-900 block">{item.employeeName}</span>
                                    <span className="text-[10px] text-gray-500">{item.employeeRole} ({item.employeeGrade})</span>
                                  </div>
                                </div>

                                <span className="text-gray-300 font-normal">|</span>

                                {/* Category and Criticality */}
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {item.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  item.criticality === 'High' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {item.criticality} Criticality
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  Submitted {item.submittedAt}
                                </span>
                              </div>

                              {/* Skill Title & Level */}
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-heading font-black text-gray-900">
                                    {item.skillName}
                                  </h4>
                                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-extrabold">
                                    Requested: Level {item.selectedLevel} ({levelName})
                                  </span>
                                  {item.validatedLevel !== undefined && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                                      Manager Validated: Level {item.validatedLevel}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                  {item.skillDescription}
                                </p>
                              </div>

                              {/* Application Justification Excerpt */}
                              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                  Employee Application & Practical Experience Justification
                                </span>
                                <p className="text-slate-700 italic leading-relaxed">
                                  "{item.applicationStatement}"
                                </p>
                              </div>

                              {/* Evidence Files List */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                  Attached Evidence Artifacts ({item.evidenceDocs.length} files)
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {item.evidenceDocs.map((doc) => (
                                    <div 
                                      key={doc.id}
                                      className="px-3 py-1.5 bg-white border border-gray-300 hover:border-r-blue rounded-xl flex items-center gap-2 text-xs transition-colors shadow-3xs"
                                    >
                                      <AwardIcon className="w-3.5 h-3.5 text-r-blue flex-shrink-0" />
                                      <span className="font-bold text-slate-800 max-w-[180px] truncate">{doc.title}</span>
                                      <span className="text-[10px] text-gray-400">({doc.type})</span>
                                      
                                      <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
                                        <button
                                          type="button"
                                          onClick={() => setActiveEvidenceModalDoc({ doc, employeeName: item.employeeName, skillName: item.skillName })}
                                          className="text-r-blue hover:text-r-blue-dark font-bold text-[11px] cursor-pointer hover:underline"
                                          title="Preview document artifact in interactive viewer"
                                        >
                                          Preview
                                        </button>
                                        <span className="text-gray-300">&bull;</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const blob = new Blob([
                                              `=======================================================\n` +
                                              `JIO LEARNING & COMPETENCY MANAGEMENT ARTIFACT\n` +
                                              `=======================================================\n\n` +
                                              `Document: ${doc.title}\n` +
                                              `Employee: ${item.employeeName} (${item.employeeRole})\n` +
                                              `Skill: ${item.skillName} (Level ${item.selectedLevel})\n` +
                                              `Verification Key: ${doc.verificationId || 'JIO-CERT-AUTO-GEN'}\n` +
                                              `Issuer / Institute: ${doc.issuer || 'Jio Platform Architecture Guild'}\n` +
                                              `Accreditation Date: ${doc.issuedDate || 'Verified'}\n\n` +
                                              `Description & Key Learnings:\n${doc.description || 'Comprehensive competency validation artifact.'}\n\n` +
                                              `Key Skills Validated:\n- ${item.skillName}\n- Platform Architecture Standard\n\n` +
                                              `Status: Manager Review Pipeline Verified\n`
                                            ], { type: 'text/plain;charset=utf-8' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${doc.fileName || `${item.skillName.toLowerCase().replace(/\s+/g, '-')}-evidence.txt`}`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                          }}
                                          className="text-slate-600 hover:text-slate-900 font-bold text-[11px] cursor-pointer hover:underline"
                                          title="Download evidence document"
                                        >
                                          Download
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Manager Notes if Decided */}
                              {item.managerNotes && (
                                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                                  <span className="font-bold block">Manager Review Remarks ({item.decidedAt}):</span>
                                  <p className="text-emerald-800">{item.managerNotes}</p>
                                </div>
                              )}
                            </div>

                            {/* Right: Status Pill and Action Button */}
                            <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200">
                              <div>
                                {item.status === 'Pending' ? (
                                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full border border-amber-300 flex items-center gap-1.5 shadow-3xs">
                                    <ClockIcon className="w-3.5 h-3.5 text-amber-700" />
                                    Pending Review
                                  </span>
                                ) : item.status === 'Relevant' ? (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-3xs">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700" />
                                    Validated: Relevant
                                  </span>
                                ) : item.status === 'Future Relevant' ? (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-900 font-extrabold text-xs rounded-full border border-blue-300 flex items-center gap-1.5 shadow-3xs">
                                    <SparklesIcon className="w-3.5 h-3.5 text-blue-700" />
                                    Future Relevant
                                  </span>
                                ) : item.status === 'Need More Evidence' ? (
                                  <span className="px-3 py-1 bg-rose-100 text-rose-900 font-extrabold text-xs rounded-full border border-rose-300 flex items-center gap-1.5 shadow-3xs">
                                    <AlertCircleIcon className="w-3.5 h-3.5 text-rose-700" />
                                    Need More Evidence
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full border border-slate-300 flex items-center gap-1.5">
                                    <XIcon className="w-3.5 h-3.5 text-slate-500" />
                                    Not Relevant
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                id={`btn-review-val-${item.id}`}
                                onClick={() => setSelectedValidationForReview(item)}
                                className={`px-4 py-2 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isPending
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-md'
                                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                                }`}
                              >
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span>{isPending ? 'Review & Validate' : 'Update Decision'}</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MULTI-EVIDENCE VIEWER MODAL                                */}
      {/* ========================================================= */}
      {viewingEvidenceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-gray-900 p-5 text-white flex justify-between items-start flex-shrink-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-blue-200 px-2 py-0.5 rounded">
                    {viewingEvidenceModal.type} Skill
                  </span>
                  {viewingEvidenceModal.category && (
                    <span className="text-[10px] text-gray-300 font-medium">
                      {viewingEvidenceModal.category}
                    </span>
                  )}
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold">
                    {viewingEvidenceModal.criticality} Criticality
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading text-white">{viewingEvidenceModal.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Added on {viewingEvidenceModal.addedDate} • {viewingEvidenceModal.evidences?.length || (viewingEvidenceModal.evidence ? 1 : 0)} Evidence Proofs Submitted
                </p>
              </div>

              <button 
                onClick={() => setViewingEvidenceModal(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-grow">
              
              {/* Validation Status & Manager Remarks Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-gray-500 font-bold block mb-1">Manager Validation Status</span>
                  {getValidationBadge(viewingEvidenceModal.validationStatus) || (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-300 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit">
                      <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                      Pending Validation
                    </span>
                  )}
                </div>
                {viewingEvidenceModal.managerComment && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 max-w-sm">
                    <span className="font-bold text-[11px] block">Manager Feedback:</span>
                    <p className="mt-0.5 font-medium italic">"{viewingEvidenceModal.managerComment}"</p>
                  </div>
                )}
              </div>

              {/* Practical Application / Usage Summaries */}
              {((viewingEvidenceModal.applicationSummaries && viewingEvidenceModal.applicationSummaries.length > 0) || viewingEvidenceModal.notes) && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <FileTextIcon className="w-4 h-4 text-r-blue" />
                    Practical Application / Usage Summaries
                  </h4>
                  {viewingEvidenceModal.applicationSummaries && viewingEvidenceModal.applicationSummaries.length > 0 ? (
                    <div className="space-y-1.5">
                      {viewingEvidenceModal.applicationSummaries.map((summary: string, sIdx: number) => (
                        <div key={sIdx} className="p-2.5 bg-white rounded-lg border border-blue-100 text-xs text-gray-800 font-medium flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-r-blue text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="leading-relaxed">{summary}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-blue-100 leading-relaxed font-medium">
                      {viewingEvidenceModal.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Multiple Evidences Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <AwardIcon className="w-4 h-4 text-r-blue" />
                    Attached Proofs & Evidences ({viewingEvidenceModal.evidences?.length || (viewingEvidenceModal.evidence ? 1 : 0)})
                  </h4>
                  <button
                    onClick={() => {
                      const id = viewingEvidenceModal.id;
                      setViewingEvidenceModal(null);
                      navigate(`/skills/edit-additional-skill/${id}`);
                    }}
                    className="text-xs text-r-blue hover:text-r-blue-dark font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add More Proofs
                  </button>
                </div>

                {/* Evidences List / Cards */}
                {viewingEvidenceModal.evidences && viewingEvidenceModal.evidences.length > 0 ? (
                  <div className="space-y-4">
                    {viewingEvidenceModal.evidences.map((ev, index) => (
                      <div key={ev.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-r-blue text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <h5 className="text-sm font-bold text-gray-900">{ev.title}</h5>
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-semibold mt-0.5">
                                <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{ev.type}</span>
                                {ev.issuer && <>• Issued by <strong className="text-gray-800">{ev.issuer}</strong></>}
                                {ev.issueDate && <>• Date: {ev.issueDate}</>}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                            ev.verificationStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ev.verificationStatus === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ev.verificationStatus === 'verified' ? 'Verified' : ev.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>

                        {/* Description */}
                        {ev.description && (
                          <p className="text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed font-medium">
                            {ev.description}
                          </p>
                        )}

                        {/* Metadata Details (Credential ID, Link, File) */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {ev.credentialId && (
                            <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">
                              ID: {ev.credentialId}
                            </span>
                          )}

                          {ev.linkUrl && (
                            <a
                              href={ev.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-r-blue hover:underline inline-flex items-center gap-1 font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-100"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>Open Proof Link</span>
                              <ExternalLinkIcon className="w-2.5 h-2.5" />
                            </a>
                          )}

                          {ev.fileName && (
                            <div className="text-[11px] text-gray-700 inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded border border-gray-200 font-medium">
                              <FileTextIcon className="w-3.5 h-3.5 text-r-blue" />
                              <span>{ev.fileName}</span>
                              {ev.fileSize && <span className="text-gray-400">({ev.fileSize})</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewingEvidenceModal.evidence ? (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="w-8 h-8 text-r-blue flex-shrink-0" />
                      <div>
                        <h5 className="font-bold text-sm text-gray-900">{viewingEvidenceModal.evidence.fileName || 'Attached Documentation'}</h5>
                        <p className="text-xs text-gray-500">{viewingEvidenceModal.evidence.fileSize || '1.2 MB'} • Verified Document Upload</p>
                      </div>
                    </div>
                    {viewingEvidenceModal.evidence.description && (
                      <p className="text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-gray-100">
                        {viewingEvidenceModal.evidence.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No proofs attached yet.</p>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  const id = viewingEvidenceModal.id;
                  setViewingEvidenceModal(null);
                  navigate(`/skills/edit-additional-skill/${id}`);
                }}
                className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <EditIcon className="w-4 h-4" />
                <span>Edit Skill & Manage Proofs</span>
              </button>

              <button
                onClick={() => setViewingEvidenceModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: COMPLETE EMPLOYEE INFO DOSSIER                      */}
      {/* ========================================================= */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img 
                  src={USER_PROFILE.photo} 
                  alt={USER_PROFILE.name} 
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/40 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-heading font-extrabold text-white">{USER_PROFILE.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-400/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{USER_PROFILE.jobPosition}</p>
                  <span className="text-[11px] text-blue-300 font-mono">{USER_PROFILE.empId}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Complete Employee Info */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Organization & Role Metadata */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-r-blue" />
                  Role & Organizational Assignment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Job Role</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.jobRole}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Job Position</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.jobPosition}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Job Grade</span>
                    <strong className="text-xs font-bold text-r-blue block mt-0.5">{USER_PROFILE.jobGrade}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Career Level</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.careerLevel}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Job Sub-Family</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.jobSubFamily}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Role Variant</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.variant}</strong>
                  </div>
                </div>
              </div>

              {/* Reporting, Location & Experience */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                  Workplace & Career History
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Reporting Manager</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.reportsTo}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Work Location</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.location}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Cohort Group</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.cohort}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Date Joined Jio</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.joinedJioDate}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Relevant Experience</span>
                    <strong className="text-xs font-bold text-r-blue block mt-0.5">{USER_PROFILE.relevantExperience}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-medium block">Total Professional Experience</span>
                    <strong className="text-xs font-bold text-gray-900 block mt-0.5">{USER_PROFILE.totalExperience}</strong>
                  </div>
                </div>
              </div>

              {/* Skills Mapping Breakdown */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-r-blue rounded-xl">
                    <AwardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Skills Profile Alignment</h5>
                    <p className="text-[11px] text-gray-500">Core vs Role Variant Mapped Competencies</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-r-blue">
                    {USER_PROFILE.coreSkillsCount} Core / {USER_PROFILE.variantMappedSkillsCount} Variant
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                className="px-5 py-2 bg-r-blue text-white text-xs font-bold rounded-xl hover:bg-r-blue-dark transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LEARN MODAL (RECOMMENDED COURSES)                 */}
      {/* ========================================================= */}
      {activeSkillModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-r-blue-dark to-r-blue p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded text-blue-100">
                  {activeSkillModal.type} Skill Pathway
                </span>
                <h3 className="text-lg font-bold font-heading mt-1">{activeSkillModal.name}</h3>
              </div>
              <button 
                onClick={() => setActiveSkillModal(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                <div>
                  <span className="text-gray-500 block font-medium">Final Current Level</span>
                  <strong className="text-r-blue text-sm font-extrabold">
                    Level {activeSkillModal.currentLevel} ({activeSkillModal.levels.find(l => l.level === activeSkillModal.currentLevel)?.name})
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block font-medium">Target Level Required</span>
                  <strong className="text-gray-900 text-sm font-extrabold">
                    Level {activeSkillModal.targetLevel} ({activeSkillModal.levels.find(l => l.level === activeSkillModal.targetLevel)?.name})
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Recommended Learning Resources
                </h4>

                <div className="space-y-3">
                  {activeSkillModal.recommendedCourses.map((course, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-gray-200 hover:border-r-blue transition-colors flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-r-blue uppercase tracking-wider block">{course.provider}</span>
                        <h5 className="font-bold text-xs text-gray-900 mt-0.5">{course.title}</h5>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          Duration: {course.duration}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          alert(`Enrolled in "${course.title}"! Redirecting to course player...`);
                          setActiveSkillModal(null);
                          navigate('/mylearning');
                        }}
                        className="px-3 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-lg shadow-2xs transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        Enroll Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setActiveSkillModal(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 rounded-2xl flex-shrink-0">
                <TrashIcon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-lg leading-tight">Delete Competency?</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-900 font-bold">"{skillToDelete.name}"</strong>? This will permanently delete this skill and all associated proofs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSkillToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAdditionalSkill(skillToDelete.id);
                  setAdditionalSkills(getStoredAdditionalSkills());
                  setSkillToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Verification Modal for Badges */}
      {selectedBadgeForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-150 animate-scale-up">
            {/* Certificate Header Accent */}
            <div className={`p-6 text-white text-center relative ${
              selectedBadgeForModal.type === 'skill'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700'
                : 'bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedBadgeForModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 mx-auto bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-3">
                {selectedBadgeForModal.type === 'skill' ? (
                  <SparklesIcon className="w-8 h-8 text-amber-300" />
                ) : (
                  <ShieldCheckIcon className="w-8 h-8 text-amber-300" />
                )}
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                Official Digital Credential
              </span>
              <h3 className="text-xl font-black mt-1 leading-tight">
                {selectedBadgeForModal.title}
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium">
                {selectedBadgeForModal.issuer}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Awarded To</span>
                <span className="text-lg font-black text-gray-900 block">Sandeep Gupta</span>
                <span className="text-xs text-gray-500 font-medium">Senior Engineer • Platform Tech • Jio</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Credential ID</span>
                  <span className="font-mono font-bold text-slate-800 break-all text-[11px] mt-0.5 block">
                    {selectedBadgeForModal.credentialId}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Accredited Date</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {selectedBadgeForModal.accreditedDate || 'Certified'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900">Performance Criteria:</span>
                <span className="font-black text-r-blue">{selectedBadgeForModal.scoreOrCriteria}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Verified Skills Covered</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBadgeForModal.skillsCovered.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBadgeForModal.credentialId);
                    alert(`Copied Credential ID: ${selectedBadgeForModal.credentialId}`);
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Copy Credential ID
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBadgeForModal(null)}
                  className="flex-1 py-2.5 px-4 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Epic A: Role-Mapped Skill Self-Survey Modal */}
      <RoleSkillSelfSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        roleSkills={roleSkills}
        initialRatings={
          surveyState.draftRatings && Object.keys(surveyState.draftRatings).length > 0
            ? surveyState.draftRatings
            : roleSkills.reduce((acc, s) => {
                if (s.selfRating !== undefined) acc[s.id] = s.selfRating;
                return acc;
              }, {} as Record<string, number>)
        }
        isResubmitting={surveyState.completed}
        onSaveDraft={handleSaveSurveyDraft}
        onSubmitSurvey={handleSubmitSurvey}
      />

      {/* Epic A: Floating Survey Notification Toast */}
      {surveyToastMessage && (
        <div 
          id="survey-toast-message"
          className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-800 animate-fade-in text-xs font-bold"
        >
          <SparklesIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{surveyToastMessage}</span>
        </div>
      )}

      {/* Epic B: Manager Role Skill Survey Modal */}
      <ManagerRoleSkillSurveyModal
        isOpen={isManagerModalOpen}
        onClose={() => {
          setIsManagerModalOpen(false);
          setEvaluatingMember(null);
        }}
        reportee={evaluatingMember}
        isDirectReport={evaluatingMember ? teamMembers.some(m => m.id === evaluatingMember.id) : false}
        initialRatings={
          evaluatingMember
            ? (managerSurveys[evaluatingMember.id]?.draftRatings && Object.keys(managerSurveys[evaluatingMember.id].draftRatings).length > 0
                ? managerSurveys[evaluatingMember.id].draftRatings
                : managerSurveys[evaluatingMember.id]?.managerRatings || {})
            : {}
        }
        isResubmitting={evaluatingMember ? managerSurveys[evaluatingMember.id]?.status === 'Completed' : false}
        onSaveDraft={handleSaveManagerSurveyDraft}
        onSubmitSurvey={handleSubmitManagerSurvey}
      />

      {/* Epic B & C: Manager Survey Notification Toast */}
      {managerSuccessToast && (
        <div 
          id="manager-survey-toast-message"
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-slate-900 to-blue-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-500/30 animate-fade-in text-xs font-bold max-w-md"
        >
          <SparklesIcon className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <div className="flex-1">
            <span className="block font-black text-white text-[13px]">Manager Survey Updated</span>
            <span className="text-slate-300 font-normal leading-relaxed">{managerSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setManagerSuccessToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manager Skill Validation Review Modal */}
      <ManagerSkillValidationReviewModal
        isOpen={Boolean(selectedValidationForReview)}
        onClose={() => setSelectedValidationForReview(null)}
        validationItem={selectedValidationForReview}
        onSaveDecision={handleUpdateValidationDecision}
        onPreviewDoc={(doc, empName, skName) => setActiveEvidenceModalDoc({ doc, employeeName: empName, skillName: skName })}
      />

      {/* Evidence Document Preview & Download Modal */}
      <EvidenceDocumentModal
        isOpen={Boolean(activeEvidenceModalDoc)}
        onClose={() => setActiveEvidenceModalDoc(null)}
        doc={activeEvidenceModalDoc?.doc || null}
        employeeName={activeEvidenceModalDoc?.employeeName}
        skillName={activeEvidenceModalDoc?.skillName}
      />

    </div>
  );
};

export default SkillsPage;
