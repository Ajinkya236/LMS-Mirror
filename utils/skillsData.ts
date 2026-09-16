// utils/skillsData.ts
export type ValidationStatus = 'Relevant' | 'Not Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Pending Review' | 'Pending';

export type EvidenceType = 'certificate' | 'project' | 'assessment' | 'link' | 'document' | 'Certification' | 'Project' | 'Assessment' | 'Training' | 'Document' | 'Link';

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  fileName?: string;
  fileType?: 'pdf' | 'image' | 'doc' | 'link';
  fileSize?: string;
  fileUrl?: string;
  linkUrl?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  description: string;
  addedDate?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Requires Review';
  skills?: string[];
  issuedDate?: string;
  verificationId?: string;
}

export type SkillEvidenceDoc = EvidenceItem;

export interface AdditionalSkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category?: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  proficiencyLevel?: number; // 1: Awareness, 2: Working, 3: Practitioner, 4: Expert
  selectedLevel?: number;
  levelName?: string;
  levelDescription?: string;
  validatedProficiencyLevel?: number; // Currently validated proficiency level
  underRevalidation?: boolean; // Set to true when edited after validation
  revalidationStatus?: 'Pending Revalidation' | 'Under Review';
  addedDate?: string;
  submittedDate?: string;
  validationStatus: ValidationStatus;
  evidences: EvidenceItem[];
  evidenceDocs?: EvidenceItem[];
  managerComment?: string;
  managerFeedback?: string;
  experienceYears?: string;
  notes?: string;
  applicationText?: string;
  applicationSummaries?: string[];
  explored?: boolean;
  skillScore?: number;
  assessmentCompleted?: boolean;
}

export type ReporteeAdditionalSkill = AdditionalSkillItem;

const STORAGE_KEY = 'jio_learning_additional_skills_v3';

export const INITIAL_ADDITIONAL_SKILLS_DATA: AdditionalSkillItem[] = [
  {
    id: 'add-1',
    name: 'Kubernetes & Cloud Native Systems',
    type: 'Technical',
    category: 'Cloud Infrastructure',
    criticality: 'High',
    proficiencyLevel: 3,
    validatedProficiencyLevel: 3,
    addedDate: '10 Aug 2026',
    validationStatus: 'Relevant',
    managerComment: 'Verified certification and production deployment manifests. High relevance to Q4 hybrid cloud scope.',
    experienceYears: '3.5 Years',
    notes: 'Hands-on production cluster administration, Helm chart authoring, and Istio service mesh routing.',
    evidences: [
      {
        id: 'ev-101',
        title: 'Linux Foundation Certified Kubernetes Administrator (CKA)',
        type: 'certificate',
        fileName: 'CKA_Certified_Kubernetes_Administrator.pdf',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        issuer: 'The Linux Foundation / CNCF',
        issueDate: 'July 2025',
        credentialId: 'CKA-84920482',
        description: 'Scored 94% on practical exam covering cluster architecture, workload scheduling, RBAC, and storage classes.',
        addedDate: '10 Aug 2026',
        verificationStatus: 'Verified'
      },
      {
        id: 'ev-102',
        title: '5G Core Signaling Helm Deployments & GitOps Manifests',
        type: 'project',
        fileName: '5G_Core_Kubernetes_Cluster_Report.pdf',
        fileType: 'pdf',
        fileSize: '3.4 MB',
        linkUrl: 'https://github.jio.internal/platform/k8s-5g-core-orchestration',
        issuer: 'Internal Platform Engineering Squad',
        issueDate: 'March 2026',
        description: 'Architected automated ArgoCD pipelines deploying 14 containerized microservices across 3 on-premise Kubernetes clusters.',
        addedDate: '10 Aug 2026',
        verificationStatus: 'Verified'
      }
    ]
  },
  {
    id: 'add-2',
    name: 'AWS Solutions Architecture',
    type: 'Technical',
    category: 'Cloud Infrastructure',
    criticality: 'High',
    proficiencyLevel: 4,
    validatedProficiencyLevel: 4,
    addedDate: '02 Jul 2026',
    validationStatus: 'Future Relevant',
    managerComment: 'Great addition. Will align directly with the upcoming multi-region edge deployment architecture.',
    experienceYears: '4 Years',
    notes: 'Well-Architected Framework practitioner with emphasis on Cost Optimization and Reliability pillars.',
    evidences: [
      {
        id: 'ev-201',
        title: 'AWS Certified Solutions Architect - Professional',
        type: 'certificate',
        fileName: 'AWS_Solutions_Architect_Professional.pdf',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        issuer: 'Amazon Web Services (AWS)',
        issueDate: 'January 2026',
        credentialId: 'AWS-SAP-992019',
        description: 'Advanced credential validating complex multi-tier application architecture, VPC peering, Transit Gateways, and disaster recovery.',
        addedDate: '02 Jul 2026',
        verificationStatus: 'Verified'
      },
      {
        id: 'ev-202',
        title: 'Architecture Blueprint: Multi-Region Event Bridge & DynamoDB Global Tables',
        type: 'document',
        fileName: 'AWS_MultiRegion_Blueprint_v3.pdf',
        fileType: 'pdf',
        fileSize: '4.1 MB',
        issuer: 'Cloud Architecture Guild',
        issueDate: 'May 2026',
        description: 'Comprehensive high-level design (HLD) document establishing 99.999% uptime strategy with cross-region replication.',
        addedDate: '02 Jul 2026',
        verificationStatus: 'Verified'
      }
    ]
  },
  {
    id: 'add-3',
    name: 'Agile Project Management & Scrum',
    type: 'Functional',
    category: 'Delivery Governance',
    criticality: 'Medium',
    proficiencyLevel: 2,
    addedDate: '15 May 2026',
    validationStatus: 'Need More Evidence',
    managerComment: 'Please attach sprint velocity logs or burndown metrics from the squads you facilitated.',
    experienceYears: '1.5 Years',
    notes: 'Facilitated cross-functional sprint planning, backlog refinement, and retrospectives.',
    evidences: [
      {
        id: 'ev-301',
        title: 'Professional Scrum Master I (PSM I) Certificate',
        type: 'certificate',
        fileName: 'Scrum_Master_Completion_Certificate.png',
        fileType: 'image',
        fileSize: '850 KB',
        issuer: 'Scrum.org',
        issueDate: 'February 2025',
        credentialId: 'PSM1-394820',
        description: 'Completed certification assessment on Scrum framework fundamentals, servant leadership, and sprint cadence management.',
        addedDate: '15 May 2026',
        verificationStatus: 'Verified'
      }
    ]
  },
  {
    id: 'add-4',
    name: 'Design Thinking & UX Systems',
    type: 'Behavioral',
    category: 'Product & Design',
    criticality: 'Medium',
    proficiencyLevel: 2,
    addedDate: '20 Jan 2026',
    validationStatus: 'Not Relevant',
    managerComment: 'Skill noted, but not directly mapped to core technical platform engineering scope.',
    experienceYears: '1 Year',
    notes: 'Attended internal human-centered design sessions and applied wireframing in developer portals.',
    evidences: [
      {
        id: 'ev-401',
        title: 'Enterprise Design Thinking Practitioner Workshop',
        type: 'document',
        fileName: 'Design_Thinking_Workshop_Badge.pdf',
        fileType: 'pdf',
        fileSize: '950 KB',
        issuer: 'Jio Leadership Lab',
        issueDate: 'November 2025',
        description: 'Attended internal 2-day workshop on enterprise user empathy mapping, problem framing, and rapid low-fidelity prototyping.',
        addedDate: '20 Jan 2026',
        verificationStatus: 'Verified'
      }
    ]
  },
  {
    id: 'add-5',
    name: 'Telecom OSS/BSS Integration Architecture',
    type: 'Domain',
    category: 'Telecom Systems',
    criticality: 'High',
    proficiencyLevel: 3,
    validatedProficiencyLevel: 3,
    addedDate: '05 Mar 2026',
    validationStatus: 'Relevant',
    managerComment: 'Directly applicable to upcoming BSS modernisation roadmap.',
    experienceYears: '3 Years',
    notes: 'Specializing in TM Forum Open API standardizations (TMF620, TMF622, TMF641) for real-time catalog & service ordering.',
    evidences: [
      {
        id: 'ev-501',
        title: 'TM Forum Open Digital Architecture (ODA) Practitioner',
        type: 'certificate',
        fileName: 'TM_Forum_Open_Digital_Architecture.pdf',
        fileType: 'pdf',
        fileSize: '3.1 MB',
        issuer: 'TM Forum',
        issueDate: 'January 2026',
        credentialId: 'TMF-ODA-55102',
        description: 'Formal credential for designing composable cloud-native telecom IT systems conforming to TM Forum Open API suites.',
        addedDate: '05 Mar 2026',
        verificationStatus: 'Verified'
      },
      {
        id: 'ev-502',
        title: 'BSS Product Catalog Modernization Whitepaper',
        type: 'project',
        fileName: 'BSS_Catalog_Decoupling_Design.docx',
        fileType: 'doc',
        fileSize: '2.2 MB',
        issuer: 'Enterprise Telecom Tech Council',
        issueDate: 'February 2026',
        description: 'Technical whitepaper detailing real-time rating and decoupled catalog integration using Kafka streams.',
        addedDate: '05 Mar 2026',
        verificationStatus: 'Verified'
      }
    ]
  },
  {
    id: 'add-6',
    name: 'Golang Microservices & Concurrency',
    type: 'Technical',
    category: 'Cloud Infrastructure',
    criticality: 'Medium',
    proficiencyLevel: 2,
    addedDate: '12 Aug 2026',
    validationStatus: 'Need More Evidence',
    experienceYears: '1 Year',
    notes: 'Go channels, select statements, goroutines, and standard library HTTP server creation. Scored 82/100 in skill assessment.',
    evidences: [],
    assessmentCompleted: true,
    skillScore: 82
  },
  {
    id: 'add-7',
    name: 'Vue.js Frontend Development',
    type: 'Technical',
    category: 'Product & Design',
    criticality: 'Low',
    proficiencyLevel: 1,
    addedDate: '18 Aug 2026',
    validationStatus: 'Need More Evidence',
    experienceYears: '6 Months',
    notes: 'Vue 3 Composition API basics and state management using Pinia. Competency assessment pending.',
    evidences: [],
    assessmentCompleted: false,
    skillScore: 68
  }
];

export function getStoredAdditionalSkills(): AdditionalSkillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;
        const updated = parsed.map((s: any) => {
          let item = { ...s };
          if (item.criticality === 'Critical') {
            item.criticality = 'High';
            hasChanges = true;
          }
          if (item.explored) {
            delete item.explored;
            hasChanges = true;
          }
          return item as AdditionalSkillItem;
        });
        INITIAL_ADDITIONAL_SKILLS_DATA.forEach(defSkill => {
          if (!updated.some(s => s.id === defSkill.id)) {
            updated.push(defSkill);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }
        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to parse additional skills from localStorage', e);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADDITIONAL_SKILLS_DATA));
  return INITIAL_ADDITIONAL_SKILLS_DATA;
}

export function saveAllAdditionalSkills(skills: AdditionalSkillItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    window.dispatchEvent(new Event('additional-skills-updated'));
  } catch (e) {
    console.error('Failed to save additional skills to localStorage', e);
  }
}

export function getAdditionalSkillById(id: string): AdditionalSkillItem | undefined {
  const skills = getStoredAdditionalSkills();
  return skills.find(s => s.id === id);
}

export function saveOrUpdateAdditionalSkill(skill: AdditionalSkillItem): void {
  const skills = getStoredAdditionalSkills();
  const existingIdx = skills.findIndex(s => s.id === skill.id);
  
  let updatedList: AdditionalSkillItem[];
  if (existingIdx >= 0) {
    updatedList = [...skills];
    updatedList[existingIdx] = skill;
  } else {
    updatedList = [skill, ...skills];
  }
  
  saveAllAdditionalSkills(updatedList);
}

export function deleteAdditionalSkill(id: string): void {
  const skills = getStoredAdditionalSkills();
  const target = skills.find(s => s.id === id);
  if (target) {
    const isManagerValidated = target.validationStatus === 'Relevant' || target.validationStatus === 'Future Relevant';
    const hasMinScore = target.skillScore !== undefined && target.skillScore >= 75;
    if (isManagerValidated || hasMinScore) {
      console.warn("Attempted to delete a locked or validated skill. Deletion skipped.");
      return;
    }
  }
  const updatedList = skills.filter(s => s.id !== id);
  saveAllAdditionalSkills(updatedList);
}

export function addEvidenceToSkill(skillId: string, evidence: EvidenceItem): void {
  const skills = getStoredAdditionalSkills();
  const skill = skills.find(s => s.id === skillId);
  if (skill) {
    skill.evidences = [evidence, ...(skill.evidences || [])];
    saveAllAdditionalSkills(skills);
  }
}

export function updateEvidenceInSkill(skillId: string, evidenceId: string, updatedEvidence: EvidenceItem): void {
  const skills = getStoredAdditionalSkills();
  const skill = skills.find(s => s.id === skillId);
  if (skill) {
    const evIdx = (skill.evidences || []).findIndex(e => e.id === evidenceId);
    if (evIdx >= 0) {
      skill.evidences[evIdx] = updatedEvidence;
      saveAllAdditionalSkills(skills);
    }
  }
}

export function deleteEvidenceFromSkill(skillId: string, evidenceId: string): void {
  const skills = getStoredAdditionalSkills();
  const skill = skills.find(s => s.id === skillId);
  if (skill) {
    skill.evidences = (skill.evidences || []).filter(e => e.id !== evidenceId);
    saveAllAdditionalSkills(skills);
  }
}

// ---------------------------------------------------------------------------
// Epic A: Role Focus Skill Self-Survey & Persistence
// ---------------------------------------------------------------------------

export interface RoleSkillLevel {
  level: number;
  name: string;
  description: string;
}

export interface RoleSkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  targetLevel: number;
  currentLevel: number;
  selfRating?: number;
  managerRating?: number;
  status: 'Met' | '1 level short' | '2 levels short' | 'Not Met';
  skillMeaning?: string;
  description?: string;
  levels: RoleSkillLevel[];
  recommendedCourses?: { title: string; provider: string; duration: string }[];
}

export const ROLE_SKILLS: RoleSkillItem[] = [
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
      { title: 'Indoor DAS Architecture & High-Density Stadium RF Design', provider: 'Telecom Guild', duration: '3h 45m' },
      { title: 'Small Cell Integration Protocols & Backhaul Planning', provider: 'Jio Academy', duration: '2h 30m' }
    ]
  },
  {
    id: 'sk-3',
    name: '5G Core Network Slicing & Edge UPF',
    type: 'Domain',
    category: 'Core Network',
    criticality: 'Critical',
    targetLevel: 4,
    currentLevel: 3,
    selfRating: 3,
    managerRating: 3,
    status: '1 level short',
    skillMeaning: 'Configuring network slices for eMBB, URLLC, and mMTC and deploying User Plane Function (UPF) at enterprise edge nodes.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands 5G SA core architecture, NFs, and slicing concept.' },
      { level: 2, name: 'Working', description: 'Configures standard slices and verifies QoS parameters and slice selection.' },
      { level: 3, name: 'Practitioner', description: 'Designs custom enterprise slices and optimizes edge UPF routing for sub-5ms latency.' },
      { level: 4, name: 'Expert', description: 'Defines 5G core slicing policy engine, URLLC fault recovery, and multi-access edge computing (MEC) standards.' }
    ],
    recommendedCourses: [
      { title: '5G Standalone (SA) Core Architecture & Network Slicing Masterclass', provider: 'Jio 5G COE', duration: '6h 00m' },
      { title: 'Edge Computing & UPF Micro-Data Center Deployment', provider: 'Jio Academy', duration: '4h 15m' }
    ]
  },
  {
    id: 'sk-4',
    name: 'Fiber Backhaul & Transport Sync (PTP / SyncE)',
    type: 'Technical',
    category: 'Transmission',
    criticality: 'Medium',
    targetLevel: 3,
    currentLevel: 2,
    selfRating: 2,
    managerRating: 2,
    status: '1 level short',
    skillMeaning: 'Commissioning IP/MPLS cell site routers (CSR) and configuring IEEE 1588v2 Precision Time Protocol (PTP) synchronization.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Understands fiber OTDR traces, optical power budgets, and timing concepts.' },
      { level: 2, name: 'Working', description: 'Configures CSR interfaces, VLANs, and verifies PTP lock state.' },
      { level: 3, name: 'Practitioner', description: 'Troubleshoots complex sync wander/jitter, asymmetric fiber delays, and boundary clock failovers.' },
      { level: 4, name: 'Expert', description: 'Architects nationwide transport synchronization topology and telecom profile clock grids.' }
    ],
    recommendedCourses: [
      { title: 'IEEE 1588v2 & SyncE for 5G Fronthaul/Midhaul Networks', provider: 'Optical & Transport Guild', duration: '3h 30m' },
      { title: 'IP/MPLS Cell Site Router Commissioning & QoS Engineering', provider: 'Jio Academy', duration: '5h 00m' }
    ]
  },
  {
    id: 'sk-5',
    name: 'RF Optimization & Drive Test Analysis',
    type: 'Technical',
    category: 'RF Engineering',
    criticality: 'High',
    targetLevel: 4,
    currentLevel: 4,
    selfRating: 4,
    managerRating: 4,
    status: 'Met',
    skillMeaning: 'Analyzing drive-test layer 3 logs, diagnosing call drops and handover failures, and tuning antenna tilt and power parameters.',
    levels: [
      { level: 1, name: 'Awareness', description: 'Collects scanner and UE logs, identifies basic coverage holes.' },
      { level: 2, name: 'Working', description: 'Post-processes drive test logs and recommends electrical down-tilt adjustments.' },
      { level: 3, name: 'Practitioner', description: 'Performs root-cause analysis on complex handovers, pilot pollution, and inter-frequency interference.' },
      { level: 4, name: 'Expert', description: 'Designs automated self-organizing network (SON) algorithms and network-wide RF golden parameters.' }
    ],
    recommendedCourses: [
      { title: 'Advanced 5G NR Layer 3 Signaling & Protocol Analysis', provider: 'Telecom Guild', duration: '5h 30m' },
      { title: 'Automated SON Optimization & MIMO Beamforming Tuning', provider: 'Jio Academy', duration: '4h 00m' }
    ]
  }
];

export interface RoleSurveyRecord {
  status: 'Completed' | 'In progress' | 'Not started';
  completed: boolean;
  completedAt?: string;
  draftRatings: Record<string, number>; // skillId -> level (1-4)
  submittedRatings: Record<string, number>; // skillId -> level (1-4)
}

export interface RoleSurveyState {
  completed: boolean;
  completedAt?: string;
  draftRatings: Record<string, number>; // skillId -> level (1-4)
  submittedRatings?: Record<string, number>;
}

const ROLE_SKILLS_STORAGE_KEY = 'jio_learning_role_skills_inventory_v1';
const ROLE_SURVEY_STORAGE_KEY = 'jio_learning_role_survey_state_v1';

export function getStoredRoleSurvey(): RoleSurveyRecord {
  try {
    const raw = localStorage.getItem(ROLE_SURVEY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const completed = Boolean(parsed.completed);
        const draft = parsed.draftRatings || {};
        const submitted = parsed.submittedRatings || (completed ? draft : {});
        const hasDraft = Object.keys(draft).length > 0;
        const status = completed ? 'Completed' : (hasDraft ? 'In progress' : 'Not started');
        return {
          status,
          completed,
          completedAt: parsed.completedAt,
          draftRatings: draft,
          submittedRatings: submitted
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse role survey state from localStorage', e);
  }
  return {
    status: 'Not started',
    completed: false,
    draftRatings: {},
    submittedRatings: {}
  };
}

export function getStoredRoleSurveyState(): RoleSurveyState {
  const record = getStoredRoleSurvey();
  return {
    completed: record.completed,
    completedAt: record.completedAt,
    draftRatings: record.draftRatings,
    submittedRatings: record.submittedRatings
  };
}

export function saveRoleSurveyDraft(draftRatings: Record<string, number>): RoleSurveyRecord {
  try {
    const current = getStoredRoleSurvey();
    const updated: RoleSurveyRecord = {
      ...current,
      status: current.completed ? 'Completed' : (Object.keys(draftRatings).length > 0 ? 'In progress' : 'Not started'),
      draftRatings
    };
    localStorage.setItem(ROLE_SURVEY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('role-survey-updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save survey draft to localStorage', e);
    return getStoredRoleSurvey();
  }
}

export function submitRoleSurvey(ratings: Record<string, number>): { completedAt: string; surveyRecord: RoleSurveyRecord } {
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updatedRecord: RoleSurveyRecord = {
    status: 'Completed',
    completed: true,
    completedAt: formattedTime,
    draftRatings: ratings,
    submittedRatings: ratings
  };

  try {
    localStorage.setItem(ROLE_SURVEY_STORAGE_KEY, JSON.stringify(updatedRecord));

    // Also update role skills inventory if stored
    const rawRoleSkills = localStorage.getItem(ROLE_SKILLS_STORAGE_KEY);
    if (rawRoleSkills) {
      const parsed = JSON.parse(rawRoleSkills);
      if (Array.isArray(parsed)) {
        const updatedSkills = parsed.map((sk: any) => {
          if (ratings[sk.id] !== undefined) {
            const newSelfRating = ratings[sk.id];
            const targetLevel = sk.targetLevel || 3;
            return {
              ...sk,
              selfRating: newSelfRating,
              status: newSelfRating >= targetLevel ? 'Met' : (targetLevel - newSelfRating === 1 ? '1 level short' : 'Not Met')
            };
          }
          return sk;
        });
        localStorage.setItem(ROLE_SKILLS_STORAGE_KEY, JSON.stringify(updatedSkills));
      }
    }

    window.dispatchEvent(new Event('role-survey-updated'));
    window.dispatchEvent(new Event('role-skills-updated'));
  } catch (e) {
    console.error('Failed to persist completed survey state', e);
  }

  return { completedAt: formattedTime, surveyRecord: updatedRecord };
}

export function getStoredRoleSkills<T>(fallbackSkills: T[]): T[] {
  try {
    const raw = localStorage.getItem(ROLE_SKILLS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T[];
      }
    }
  } catch (e) {
    console.error('Failed to parse role skills from localStorage', e);
  }

  // Sync with current survey ratings if any
  const surveyState = getStoredRoleSurveyState();
  if (surveyState.draftRatings && Object.keys(surveyState.draftRatings).length > 0) {
    const synced = (fallbackSkills as any[]).map(sk => {
      const rating = surveyState.draftRatings[sk.id];
      if (rating !== undefined) {
        return {
          ...sk,
          selfRating: rating,
          status: rating >= sk.targetLevel ? 'Met' : (sk.targetLevel - rating === 1 ? '1 level short' : 'Not Met')
        };
      }
      return sk;
    });
    try {
      localStorage.setItem(ROLE_SKILLS_STORAGE_KEY, JSON.stringify(synced));
    } catch {}
    return synced as T[];
  }

  try {
    localStorage.setItem(ROLE_SKILLS_STORAGE_KEY, JSON.stringify(fallbackSkills));
  } catch {}
  return fallbackSkills;
}

export function saveStoredRoleSkills<T>(skills: T[]): void {
  try {
    localStorage.setItem(ROLE_SKILLS_STORAGE_KEY, JSON.stringify(skills));
    window.dispatchEvent(new Event('role-skills-updated'));
  } catch (e) {
    console.error('Failed to save role skills to localStorage', e);
  }
}

// =========================================================
// Epic B & C: Manager Survey & Team Members Types & Storage
// =========================================================

export type ManagerSurveyStatus = 'Not started' | 'In progress' | 'Completed';

export interface ReporteeRoleSkill {
  id: string;
  name: string;
  category: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  targetLevel: number; // 1 - 4
  selfRating?: number; // reportee submitted self rating (undefined if Not submitted)
  managerRating?: number; // manager assessed rating
  description: string;
}

export interface TeamMemberProfile {
  id: string;
  name: string;
  role: string;
  grade: string;
  department: string;
  photo: string;
  skillsCount: number;
  pendingEvidence: number;
  criticalGap: string;
  readiness: number;
  roleSkills: ReporteeRoleSkill[];
  additionalSkills?: AdditionalSkillItem[];
}

export interface ManagerSurveyRecord {
  reporteeId: string;
  status: ManagerSurveyStatus;
  completedAt?: string;
  draftRatings: Record<string, number>; // skillId -> level (1-4)
  managerRatings: Record<string, number>; // skillId -> level (1-4)
  updatedAt?: string;
}

const MANAGER_SURVEYS_STORAGE_KEY = 'jio_learning_manager_surveys_v1';
const TEAM_MEMBERS_STORAGE_KEY = 'jio_learning_team_members_v1';

// Initial direct reports dataset
export const INITIAL_TEAM_MEMBERS: TeamMemberProfile[] = [
  {
    id: 'tm-1',
    name: 'Priya Sharma',
    role: 'Staff Software Engineer',
    grade: 'Grade E4',
    department: 'Platform Tech',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
    skillsCount: 5,
    pendingEvidence: 1,
    criticalGap: 'Observability & Distributed Tracing',
    readiness: 86,
    roleSkills: [
      {
        id: 'ps-1',
        name: 'Microservices Design Patterns',
        category: 'Architecture',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 3,
        description: 'Design decoupled, fault-tolerant microservice architectures with circuit breakers and event-driven sagas.'
      },
      {
        id: 'ps-2',
        name: 'Kubernetes & Container Orchestration',
        category: 'Cloud Infrastructure',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: 3,
        description: 'Container deployment, helm charts, horizontal pod autoscaling, and statefulsets.'
      },
      {
        id: 'ps-3',
        name: 'CI/CD & GitOps Automation',
        category: 'DevOps',
        type: 'Technical',
        criticality: 'Medium',
        targetLevel: 3,
        selfRating: 4,
        description: 'Continuous integration and progressive delivery using ArgoCD and Jenkins pipelines.'
      },
      {
        id: 'ps-4',
        name: 'RESTful & gRPC Service Engineering',
        category: 'Backend',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 4,
        description: 'High-throughput contract design with protocol buffers and OpenAPI specifications.'
      },
      {
        id: 'ps-5',
        name: 'Observability & Distributed Tracing',
        category: 'SRE',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: 2,
        description: 'OpenTelemetry integration, Prometheus metric instrumentation, and Jaeger tracing.'
      }
    ],
    additionalSkills: [
      {
        id: 'ps-add-1',
        name: 'Apache Kafka & Event Streaming',
        category: 'Data & Event Streaming',
        type: 'Technical',
        criticality: 'High',
        proficiencyLevel: 3,
        experienceYears: '3 Years',
        validationStatus: 'Pending',
        applicationSummaries: [
          'Implemented high-volume message partitioning and idempotent producer streams handling 50k msgs/sec for telecom billing.',
          'Configured schema registry with Avro serialization and mirror-maker replication across availability zones.'
        ],
        evidences: [
          {
            id: 'ev-ps-1',
            type: 'Certification',
            title: 'Confluent Certified Developer for Apache Kafka (CCDAK)',
            issuer: 'Confluent Inc.',
            issueDate: 'August 2025',
            credentialId: 'CCDAK-984214',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
            description: 'Official certification demonstrating mastery of Kafka streams, consumer groups, schema evolution, and performance tuning.',
            skills: ['Apache Kafka', 'Distributed Streaming', 'Avro Serialization']
          },
          {
            id: 'ev-ps-2',
            type: 'Project',
            title: 'Telecom Stream Slicing Pipeline Architecture Doc & Code Repo',
            issuer: 'Jio 5G Platform Engineering',
            issueDate: 'June 2026',
            description: 'Architecture and benchmarks for real-time CDR stream ingestion with automated lag monitoring.',
            skills: ['Kafka Streams', 'Prometheus Kafka Exporter']
          }
        ]
      },
      {
        id: 'ps-add-2',
        name: 'GraphQL API Federation',
        category: 'Backend Architecture',
        type: 'Technical',
        criticality: 'Medium',
        proficiencyLevel: 3,
        experienceYears: '2 Years',
        validationStatus: 'Relevant',
        validatedProficiencyLevel: 3,
        managerComment: 'Verified production schema federation setup and Apollo router configurations across subscriber microservices.',
        applicationSummaries: [
          'Migrated 12 legacy REST microservices into a unified GraphQL subgraph gateway reducing client round-trips by 65%.'
        ],
        evidences: [
          {
            id: 'ev-ps-3',
            type: 'Training',
            title: 'Apollo GraphQL Enterprise Federation Professional',
            issuer: 'Apollo GraphQL',
            issueDate: 'January 2026',
            credentialId: 'AGQL-77812',
            description: 'Federated schema design, entity resolvers, and subgraphs caching.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm-2',
    name: 'Rohan Mehta',
    role: 'Lead Architect',
    grade: 'Grade E5',
    department: 'Cloud Infra',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
    skillsCount: 4,
    pendingEvidence: 0,
    criticalGap: 'None',
    readiness: 100,
    roleSkills: [
      {
        id: 'rm-1',
        name: 'Cloud-Native Architecture',
        category: 'Cloud Strategy',
        type: 'Technical',
        criticality: 'Critical',
        targetLevel: 4,
        selfRating: 4,
        managerRating: 4,
        description: 'Enterprise multicloud infrastructure, landing zones, and cloud governance frameworks.'
      },
      {
        id: 'rm-2',
        name: 'Zero Trust & Cyber Security',
        category: 'Security',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 4,
        managerRating: 4,
        description: 'Identity-aware proxies, mTLS service meshes, and defense-in-depth posture.'
      },
      {
        id: 'rm-3',
        name: 'High-Scale Distributed Systems',
        category: 'System Design',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 4,
        managerRating: 4,
        description: 'Consensus algorithms, partitioned caches, and multi-region failover.'
      },
      {
        id: 'rm-4',
        name: 'Technical Strategy & Mentorship',
        category: 'Leadership',
        type: 'Behavioral',
        criticality: 'Medium',
        targetLevel: 4,
        selfRating: 4,
        managerRating: 4,
        description: 'Architecture review boards, RFD processes, and staff engineer talent coaching.'
      }
    ],
    additionalSkills: [
      {
        id: 'rm-add-1',
        name: 'Generative AI Architecture & LLM Orchestration',
        category: 'Artificial Intelligence',
        type: 'Technical',
        criticality: 'Critical',
        proficiencyLevel: 4,
        experienceYears: '2 Years',
        validationStatus: 'Relevant',
        validatedProficiencyLevel: 4,
        managerComment: 'Exceptional architectural delivery of RAG search indexing and Gemini enterprise gateway.',
        applicationSummaries: [
          'Engineered vector database indexing pipeline with Milvus and LangChain for enterprise internal knowledge retrieval.'
        ],
        evidences: [
          {
            id: 'ev-rm-1',
            type: 'Certification',
            title: 'Google Cloud Professional Machine Learning Engineer',
            issuer: 'Google Cloud',
            issueDate: 'October 2025',
            credentialId: 'GCP-MLE-88190',
            description: 'Architecting enterprise GenAI solutions, embeddings models, and vector storage.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm-3',
    name: 'Vikram Verma',
    role: 'Senior Developer',
    grade: 'Grade E4',
    department: '5G RAN Engineering',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    skillsCount: 4,
    pendingEvidence: 1,
    criticalGap: '5G NR Radio Access',
    readiness: 75,
    roleSkills: [
      {
        id: 'vv-1',
        name: '5G NR Radio Access',
        category: 'Telecom Engineering',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: 2,
        description: 'Numerologies, beamforming configurations, and 5G NR frame structures.'
      },
      {
        id: 'vv-2',
        name: 'RF Optimisation & Drive Test',
        category: 'RF Engineering',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: 2,
        description: 'Signal-to-interference ratio tuning, coverage heatmap analysis, and parameter optimization.'
      },
      {
        id: 'vv-3',
        name: 'Base Station Protocol Stacks',
        category: 'Telecom Engineering',
        type: 'Technical',
        criticality: 'Medium',
        targetLevel: 3,
        selfRating: 3,
        description: 'Layer 2/Layer 3 control and user plane debugging and node logs analysis.'
      },
      {
        id: 'vv-4',
        name: 'Automated Integration Testing',
        category: 'Testing & QA',
        type: 'Technical',
        criticality: 'Medium',
        targetLevel: 3,
        selfRating: undefined, // Not submitted yet
        description: 'Robot framework, end-to-end simulated UE test scripts, and regression suites.'
      }
    ],
    additionalSkills: [
      {
        id: 'vv-add-1',
        name: 'Open RAN (O-RAN) Architecture',
        category: 'Telecom Standards',
        type: 'Technical',
        criticality: 'High',
        proficiencyLevel: 3,
        experienceYears: '2.5 Years',
        validationStatus: 'Pending',
        applicationSummaries: [
          'Spearheaded O-DU and O-CU functional split testing over 7.2x Fronthaul interfaces and E2 interface telemetry integration.'
        ],
        evidences: [
          {
            id: 'ev-vv-1',
            type: 'Certification',
            title: 'O-RAN Alliance Certified Engineer',
            issuer: 'O-RAN Software Community / Linux Foundation',
            issueDate: 'May 2026',
            credentialId: 'ORAN-CERT-44120',
            description: 'Mastery over O-RAN disaggregated architecture, near-RT RIC, and xApps deployment.',
            skills: ['O-RAN Architecture', 'Near-RT RIC', 'E2 / A1 Interfaces']
          },
          {
            id: 'ev-vv-2',
            type: 'Project',
            title: 'Fronthaul Latency Analysis Whitepaper & Lab Test Results',
            issuer: 'Jio 5G Lab Core Group',
            issueDate: 'July 2026',
            description: 'Comprehensive timing synchronization and eCPRI throughput performance validation logs.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm-4',
    name: 'Ananya Roy',
    role: 'Full Stack Engineer',
    grade: 'Grade E3',
    department: 'Consumer Platform',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80',
    skillsCount: 4,
    pendingEvidence: 0,
    criticalGap: 'Cloud Architecture & Microservices',
    readiness: 65,
    roleSkills: [
      {
        id: 'ar-1',
        name: 'React & Modern Frontend Engineering',
        category: 'Frontend Engineering',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: undefined, // Entire survey not submitted
        description: 'Component lifecycles, hooks, virtualized rendering, and client state orchestration.'
      },
      {
        id: 'ar-2',
        name: 'Cloud Architecture & Microservices',
        category: 'Cloud Infrastructure',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: undefined,
        description: 'Stateless compute, API gateway routing, and containerized runtime deployments.'
      },
      {
        id: 'ar-3',
        name: 'Database Modeling & SQL Tuning',
        category: 'Data Engineering',
        type: 'Technical',
        criticality: 'Medium',
        targetLevel: 3,
        selfRating: undefined,
        description: 'PostgreSQL indexing, query plan analysis, and relational schema migrations.'
      },
      {
        id: 'ar-4',
        name: 'Unit & Integration Test Automation',
        category: 'Quality Engineering',
        type: 'Technical',
        criticality: 'Low',
        targetLevel: 2,
        selfRating: undefined,
        description: 'Jest, Playwright, mock API servers, and testing pyramid discipline.'
      }
    ],
    additionalSkills: [
      {
        id: 'ar-add-1',
        name: 'Tailwind CSS & Design Systems Engineering',
        category: 'Design Engineering',
        type: 'Technical',
        criticality: 'High',
        proficiencyLevel: 4,
        experienceYears: '3 Years',
        validationStatus: 'Relevant',
        validatedProficiencyLevel: 4,
        managerComment: 'Authored company design token package and built reusable component library used by 5 squads.',
        applicationSummaries: [
          'Built accessible UI primitive tokens, dark-mode themes, and Storybook components for Jio Consumer Web apps.'
        ],
        evidences: [
          {
            id: 'ev-ar-1',
            type: 'Project',
            title: 'Jio Unified Design System Token Package & NPM Registry',
            issuer: 'Jio Frontend Center of Excellence',
            issueDate: 'March 2026',
            description: 'Component documentation, unit tests, and accessibility audit report passing WCAG AA.'
          }
        ]
      },
      {
        id: 'ar-add-2',
        name: 'Rust Systems Programming',
        category: 'Low-Level Programming',
        type: 'Technical',
        criticality: 'Medium',
        proficiencyLevel: 2,
        experienceYears: '1 Year',
        validationStatus: 'Need More Evidence',
        managerComment: 'Promising self-learning progress. Please submit code repository or production project sample for Level 3 validation.',
        applicationSummaries: [
          'Built CLI log analyzer and WebAssembly micro-parser in Rust for high-speed client data transformations.'
        ],
        evidences: [
          {
            id: 'ev-ar-2',
            type: 'Training',
            title: 'Rust Fundamentals & Memory Safety Certificate',
            issuer: 'The Rust Foundation Education Track',
            issueDate: 'February 2026',
            description: 'Ownership models, lifetimes, concurrency, and WebAssembly compilation.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm-5',
    name: 'Siddharth Rao',
    role: 'DevOps Lead',
    grade: 'Grade E4',
    department: 'SRE & Reliability',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    skillsCount: 4,
    pendingEvidence: 0,
    criticalGap: 'None',
    readiness: 88,
    roleSkills: [
      {
        id: 'sr-1',
        name: 'Kubernetes & Container Orchestration',
        category: 'Cloud Infrastructure',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 4,
        description: 'Multi-cluster management, custom resource definitions (CRDs), and operator patterns.'
      },
      {
        id: 'sr-2',
        name: 'Terraform & Infrastructure as Code',
        category: 'DevOps',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 3,
        selfRating: 3,
        description: 'Modular IaC patterns, state locking, and automated drift detection.'
      },
      {
        id: 'sr-3',
        name: 'Incident Management & Chaos Engineering',
        category: 'SRE',
        type: 'Technical',
        criticality: 'Medium',
        targetLevel: 3,
        selfRating: 3,
        description: 'Chaos Mesh experiments, post-mortem analysis, and automated runbooks.'
      },
      {
        id: 'sr-4',
        name: 'Site Reliability Engineering & SLOs',
        category: 'SRE',
        type: 'Technical',
        criticality: 'High',
        targetLevel: 4,
        selfRating: 3,
        description: 'Error budget tracking, alert burn rates, and synthetic blackbox monitoring.'
      }
    ],
    additionalSkills: [
      {
        id: 'sr-add-1',
        name: 'ArgoCD & Progressive Delivery',
        category: 'GitOps & CI/CD',
        type: 'Technical',
        criticality: 'High',
        proficiencyLevel: 4,
        experienceYears: '3 Years',
        validationStatus: 'Pending',
        applicationSummaries: [
          'Configured multi-tenant GitOps rollouts using Argo Rollouts with automated blue/green canary analysis with Prometheus.'
        ],
        evidences: [
          {
            id: 'ev-sr-1',
            type: 'Certification',
            title: 'GitOps Certified Practitioner with ArgoCD',
            issuer: 'Codefresh & Linux Foundation',
            issueDate: 'April 2026',
            credentialId: 'GITOPS-ARGO-11029',
            description: 'Declarative cluster management, sealed secrets, and automated canary analysis.',
            skills: ['ArgoCD', 'GitOps', 'Canary Deployments']
          }
        ]
      }
    ]
  },
  {
    id: 'tm-6',
    name: 'Dev Tanwar',
    role: 'Graduate Trainee / Unassigned Track',
    grade: 'Grade E1',
    department: 'Engineering Academy',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80',
    skillsCount: 0,
    pendingEvidence: 0,
    criticalGap: 'Role Profile Unmapped',
    readiness: 0,
    roleSkills: [],
    additionalSkills: []
  }
];

// Seed initial manager surveys
export const INITIAL_MANAGER_SURVEYS: Record<string, ManagerSurveyRecord> = {
  'tm-1': {
    reporteeId: 'tm-1',
    status: 'In progress',
    draftRatings: {
      'ps-1': 3,
      'ps-2': 3
    },
    managerRatings: {},
    updatedAt: '15 Sep 2026, 02:40 PM'
  },
  'tm-2': {
    reporteeId: 'tm-2',
    status: 'Completed',
    completedAt: '14 Sep 2026, 04:30 PM',
    draftRatings: {
      'rm-1': 4,
      'rm-2': 4,
      'rm-3': 4,
      'rm-4': 4
    },
    managerRatings: {
      'rm-1': 4,
      'rm-2': 4,
      'rm-3': 4,
      'rm-4': 4
    },
    updatedAt: '14 Sep 2026, 04:30 PM'
  },
  'tm-3': {
    reporteeId: 'tm-3',
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  },
  'tm-4': {
    reporteeId: 'tm-4',
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  },
  'tm-5': {
    reporteeId: 'tm-5',
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  },
  'tm-6': {
    reporteeId: 'tm-6',
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  }
};

export function getStoredManagerSurveys(): Record<string, ManagerSurveyRecord> {
  try {
    const raw = localStorage.getItem(MANAGER_SURVEYS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...INITIAL_MANAGER_SURVEYS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to parse manager surveys from localStorage', e);
  }

  try {
    localStorage.setItem(MANAGER_SURVEYS_STORAGE_KEY, JSON.stringify(INITIAL_MANAGER_SURVEYS));
  } catch {}

  return INITIAL_MANAGER_SURVEYS;
}

export function getStoredManagerSurvey(reporteeId: string): ManagerSurveyRecord {
  const surveys = getStoredManagerSurveys();
  if (surveys[reporteeId]) {
    return surveys[reporteeId];
  }
  return {
    reporteeId,
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  };
}

export function saveManagerSurveyDraft(reporteeId: string, draftRatings: Record<string, number>): ManagerSurveyRecord {
  const allSurveys = getStoredManagerSurveys();
  const existing = allSurveys[reporteeId] || {
    reporteeId,
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  };

  const hasAnyRating = Object.keys(draftRatings).length > 0;
  const status: ManagerSurveyStatus = existing.status === 'Completed' ? 'Completed' : (hasAnyRating ? 'In progress' : 'Not started');

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updated: ManagerSurveyRecord = {
    ...existing,
    status,
    draftRatings: { ...draftRatings },
    updatedAt: formattedTime
  };

  allSurveys[reporteeId] = updated;

  try {
    localStorage.setItem(MANAGER_SURVEYS_STORAGE_KEY, JSON.stringify(allSurveys));
    window.dispatchEvent(new Event('manager-surveys-updated'));
  } catch (e) {
    console.error('Failed to save manager survey draft', e);
  }

  return updated;
}

export function submitManagerSurvey(reporteeId: string, finalRatings: Record<string, number>): ManagerSurveyRecord {
  const allSurveys = getStoredManagerSurveys();
  const existing = allSurveys[reporteeId] || {
    reporteeId,
    status: 'Not started',
    draftRatings: {},
    managerRatings: {}
  };

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updated: ManagerSurveyRecord = {
    ...existing,
    status: 'Completed',
    completedAt: formattedTime,
    draftRatings: { ...finalRatings },
    managerRatings: { ...finalRatings },
    updatedAt: formattedTime
  };

  allSurveys[reporteeId] = updated;

  try {
    localStorage.setItem(MANAGER_SURVEYS_STORAGE_KEY, JSON.stringify(allSurveys));

    // Update Team Member's roleSkills with new managerRating & recalculate readiness
    const members = getStoredTeamMembers();
    const targetMemberIdx = members.findIndex(m => m.id === reporteeId);
    if (targetMemberIdx !== -1) {
      const member = members[targetMemberIdx];
      let totalTarget = 0;
      let totalAchieved = 0;
      const criticalGapsList: string[] = [];

      const updatedSkills = member.roleSkills.map(sk => {
        const rating = finalRatings[sk.id];
        const mRating = rating !== undefined ? rating : sk.managerRating;
        const target = sk.targetLevel || 3;
        totalTarget += target;
        if (mRating !== undefined) {
          totalAchieved += Math.min(mRating, target);
          if (mRating < target) {
            criticalGapsList.push(sk.name);
          }
        }
        return {
          ...sk,
          managerRating: mRating
        };
      });

      const readiness = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : member.readiness;
      const criticalGap = criticalGapsList.length === 0 ? 'None' : (criticalGapsList.length === 1 ? criticalGapsList[0] : `${criticalGapsList.length} Skills Gap`);

      members[targetMemberIdx] = {
        ...member,
        roleSkills: updatedSkills,
        readiness,
        criticalGap
      };

      saveStoredTeamMembers(members);
    }

    window.dispatchEvent(new Event('manager-surveys-updated'));
    window.dispatchEvent(new Event('team-members-updated'));
  } catch (e) {
    console.error('Failed to submit manager survey', e);
  }

  return updated;
}

export function getStoredTeamMembers(): TeamMemberProfile[] {
  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse team members from localStorage', e);
  }

  try {
    localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_TEAM_MEMBERS));
  } catch {}

  return INITIAL_TEAM_MEMBERS;
}

export function saveStoredTeamMembers(members: TeamMemberProfile[]): void {
  try {
    localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('team-members-updated'));
  } catch (e) {
    console.error('Failed to save team members', e);
  }
}

// =========================================================================
// MANAGER SKILL VALIDATIONS DATA MODEL & STORAGE
// =========================================================================

export interface ManagerSkillValidationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeGrade: string;
  employeePhoto: string;
  department?: string;
  employeeDepartment?: string;
  skillId: string;
  skillName: string;
  skillType?: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  type?: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category?: string;
  criticality?: 'Critical' | 'High' | 'Medium' | 'Low';
  proficiencyLevel?: number; // 1 to 4
  selectedLevel?: number;
  levelName?: string;
  levelDescription?: string;
  validatedProficiencyLevel?: number;
  submittedDate?: string;
  applicationText?: string;
  applicationStatement?: string;
  skillDescription?: string;
  experienceYears?: string;
  status: 'Pending' | 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant';
  managerComment?: string;
  managerFeedback?: string;
  managerNotes?: string;
  validatedAt?: string;
  decidedAt?: string;
  evidences?: EvidenceItem[];
  evidenceDocs?: EvidenceItem[];
}

export const VALIDATIONS_STORAGE_KEY = 'jio_learning_skill_validations_v1';

export const INITIAL_MANAGER_VALIDATIONS: ManagerSkillValidationItem[] = [
  {
    id: 'val-1',
    employeeId: 'tm-1',
    employeeName: 'Priya Sharma',
    employeeRole: 'Staff Software Engineer',
    employeeGrade: 'Grade E4',
    employeePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
    department: 'Platform Tech',
    skillId: 'ps-add-1',
    skillName: 'Apache Kafka & Event Streaming',
    skillType: 'Technical',
    category: 'Data & Event Streaming',
    criticality: 'High',
    proficiencyLevel: 3,
    submittedDate: '14 Sep 2026',
    experienceYears: '3 Years',
    applicationText: 'Implemented high-volume message partitioning and idempotent producer streams handling 50k msgs/sec for telecom billing. Configured schema registry with Avro serialization and mirror-maker replication across multi-region availability zones.',
    status: 'Pending',
    evidences: [
      {
        id: 'ev-ps-1',
        type: 'Certification',
        title: 'Confluent Certified Developer for Apache Kafka (CCDAK)',
        issuer: 'Confluent Inc.',
        issueDate: 'August 2025',
        credentialId: 'CCDAK-984214',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        description: 'Official credential demonstrating expertise in Kafka Streams API, consumer group rebalancing, Avro serialization schemas, and high-throughput low-latency partition topologies.',
        skills: ['Apache Kafka', 'Distributed Streaming', 'Avro Serialization']
      },
      {
        id: 'ev-ps-2',
        type: 'Project',
        title: 'Telecom Stream Slicing Pipeline Architecture & Benchmarks Doc',
        issuer: 'Jio 5G Platform Engineering',
        issueDate: 'June 2026',
        description: 'Production technical document, latency test logs (p99 < 12ms), and Grafana metrics dashboard snapshots for CDR event ingestion.',
        skills: ['Kafka Streams', 'Prometheus Kafka Exporter', 'Grafana']
      }
    ]
  },
  {
    id: 'val-2',
    employeeId: 'tm-3',
    employeeName: 'Vikram Verma',
    employeeRole: 'Senior Developer',
    employeeGrade: 'Grade E4',
    employeePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    department: '5G RAN Engineering',
    skillId: 'vv-add-1',
    skillName: 'Open RAN (O-RAN) Architecture',
    skillType: 'Technical',
    category: 'Telecom Standards',
    criticality: 'High',
    proficiencyLevel: 3,
    submittedDate: '12 Sep 2026',
    experienceYears: '2.5 Years',
    applicationText: 'Spearheaded O-DU and O-CU functional split testing over 7.2x Fronthaul interfaces and E2 interface telemetry integration with near-RT RIC controller to automate cell load balancing.',
    status: 'Pending',
    evidences: [
      {
        id: 'ev-vv-1',
        type: 'Certification',
        title: 'O-RAN Alliance Certified Engineer',
        issuer: 'O-RAN Software Community / Linux Foundation',
        issueDate: 'May 2026',
        credentialId: 'ORAN-CERT-44120',
        fileUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        description: 'Mastery over O-RAN disaggregated architecture, near-RT RIC, and xApps deployment for automated cellular networks.',
        skills: ['O-RAN Architecture', 'Near-RT RIC', 'E2 / A1 Interfaces']
      },
      {
        id: 'ev-vv-2',
        type: 'Project',
        title: 'Fronthaul Latency Analysis Whitepaper & Lab Test Results',
        issuer: 'Jio 5G Lab Core Group',
        issueDate: 'July 2026',
        description: 'Comprehensive timing synchronization and eCPRI throughput performance validation logs across simulated gNodeBs.',
        skills: ['eCPRI Fronthaul', 'SyncE / IEEE 1588v2', 'Wireshark Protocol Analysis']
      }
    ]
  },
  {
    id: 'val-3',
    employeeId: 'tm-5',
    employeeName: 'Siddharth Rao',
    employeeRole: 'DevOps Lead',
    employeeGrade: 'Grade E4',
    employeePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    department: 'SRE & Reliability',
    skillId: 'sr-add-1',
    skillName: 'ArgoCD & Progressive Delivery',
    skillType: 'Technical',
    category: 'GitOps & CI/CD',
    criticality: 'High',
    proficiencyLevel: 4,
    submittedDate: '10 Sep 2026',
    experienceYears: '3 Years',
    applicationText: 'Configured multi-tenant GitOps rollouts using Argo Rollouts with automated blue/green canary analysis with Prometheus metrics, automated rollback triggers, and sealed secrets orchestration.',
    status: 'Pending',
    evidences: [
      {
        id: 'ev-sr-1',
        type: 'Certification',
        title: 'GitOps Certified Practitioner with ArgoCD',
        issuer: 'Codefresh & Linux Foundation',
        issueDate: 'April 2026',
        credentialId: 'GITOPS-ARGO-11029',
        fileUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        description: 'Declarative cluster management, sync waves, sealed secrets, and automated canary analysis with Argo Rollouts.',
        skills: ['ArgoCD', 'GitOps', 'Canary Deployments', 'Kubernetes']
      }
    ]
  },
  {
    id: 'val-4',
    employeeId: 'tm-1',
    employeeName: 'Priya Sharma',
    employeeRole: 'Staff Software Engineer',
    employeeGrade: 'Grade E4',
    employeePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
    department: 'Platform Tech',
    skillId: 'ps-add-2',
    skillName: 'GraphQL API Federation',
    skillType: 'Technical',
    category: 'Backend Architecture',
    criticality: 'Medium',
    proficiencyLevel: 3,
    validatedProficiencyLevel: 3,
    submittedDate: '01 Sep 2026',
    validatedAt: '03 Sep 2026, 03:15 PM',
    experienceYears: '2 Years',
    applicationText: 'Migrated 12 legacy REST microservices into a unified GraphQL subgraph gateway reducing client round-trips by 65%.',
    status: 'Relevant',
    managerComment: 'Verified production schema federation setup and Apollo router configurations across subscriber microservices. Solid practitioner delivery.',
    evidences: [
      {
        id: 'ev-ps-3',
        type: 'Training',
        title: 'Apollo GraphQL Enterprise Federation Professional',
        issuer: 'Apollo GraphQL',
        issueDate: 'January 2026',
        credentialId: 'AGQL-77812',
        description: 'Federated schema design, entity resolvers, and subgraphs caching.'
      }
    ]
  },
  {
    id: 'val-5',
    employeeId: 'tm-2',
    employeeName: 'Rohan Mehta',
    employeeRole: 'Lead Architect',
    employeeGrade: 'Grade E5',
    employeePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
    department: 'Cloud Infra',
    skillId: 'rm-add-1',
    skillName: 'Generative AI Architecture & LLM Orchestration',
    skillType: 'Technical',
    category: 'Artificial Intelligence',
    criticality: 'Critical',
    proficiencyLevel: 4,
    validatedProficiencyLevel: 4,
    submittedDate: '28 Aug 2026',
    validatedAt: '30 Aug 2026, 11:20 AM',
    experienceYears: '2 Years',
    applicationText: 'Engineered vector database indexing pipeline with Milvus and LangChain for enterprise internal knowledge retrieval.',
    status: 'Relevant',
    managerComment: 'Exceptional architectural delivery of RAG search indexing and Gemini enterprise gateway across our cloud footprint.',
    evidences: [
      {
        id: 'ev-rm-1',
        type: 'Certification',
        title: 'Google Cloud Professional Machine Learning Engineer',
        issuer: 'Google Cloud',
        issueDate: 'October 2025',
        credentialId: 'GCP-MLE-88190',
        description: 'Architecting enterprise GenAI solutions, embeddings models, and vector storage.'
      }
    ]
  },
  {
    id: 'val-6',
    employeeId: 'tm-4',
    employeeName: 'Ananya Roy',
    employeeRole: 'Full Stack Engineer',
    employeeGrade: 'Grade E3',
    employeePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80',
    department: 'Consumer Platform',
    skillId: 'ar-add-1',
    skillName: 'Tailwind CSS & Design Systems Engineering',
    skillType: 'Technical',
    category: 'Design Engineering',
    criticality: 'High',
    proficiencyLevel: 4,
    validatedProficiencyLevel: 4,
    submittedDate: '25 Aug 2026',
    validatedAt: '27 Aug 2026, 04:45 PM',
    experienceYears: '3 Years',
    applicationText: 'Built accessible UI primitive tokens, dark-mode themes, and Storybook components for Jio Consumer Web apps.',
    status: 'Relevant',
    managerComment: 'Authored company design token package and built reusable component library used by 5 squads.',
    evidences: [
      {
        id: 'ev-ar-1',
        type: 'Project',
        title: 'Jio Unified Design System Token Package & NPM Registry',
        issuer: 'Jio Frontend Center of Excellence',
        issueDate: 'March 2026',
        description: 'Component documentation, unit tests, and accessibility audit report passing WCAG AA.'
      }
    ]
  },
  {
    id: 'val-7',
    employeeId: 'tm-4',
    employeeName: 'Ananya Roy',
    employeeRole: 'Full Stack Engineer',
    employeeGrade: 'Grade E3',
    employeePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80',
    department: 'Consumer Platform',
    skillId: 'ar-add-2',
    skillName: 'Rust Systems Programming',
    skillType: 'Technical',
    category: 'Low-Level Programming',
    criticality: 'Medium',
    proficiencyLevel: 2,
    submittedDate: '20 Aug 2026',
    validatedAt: '22 Aug 2026, 10:10 AM',
    experienceYears: '1 Year',
    applicationText: 'Built CLI log analyzer and WebAssembly micro-parser in Rust for high-speed client data transformations.',
    status: 'Need More Evidence',
    managerComment: 'Promising self-learning progress. Please submit code repository or production project sample for Level 3 validation.',
    evidences: [
      {
        id: 'ev-ar-2',
        type: 'Training',
        title: 'Rust Fundamentals & Memory Safety Certificate',
        issuer: 'The Rust Foundation Education Track',
        issueDate: 'February 2026',
        description: 'Ownership models, lifetimes, concurrency, and WebAssembly compilation.'
      }
    ]
  }
];

export function getStoredManagerValidations(): ManagerSkillValidationItem[] {
  try {
    const raw = localStorage.getItem(VALIDATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse manager validations from localStorage', e);
  }

  try {
    localStorage.setItem(VALIDATIONS_STORAGE_KEY, JSON.stringify(INITIAL_MANAGER_VALIDATIONS));
  } catch {}

  return INITIAL_MANAGER_VALIDATIONS;
}

export function saveStoredManagerValidations(validations: ManagerSkillValidationItem[]): void {
  try {
    localStorage.setItem(VALIDATIONS_STORAGE_KEY, JSON.stringify(validations));
    window.dispatchEvent(new Event('manager-validations-updated'));
  } catch (e) {
    console.error('Failed to save manager validations', e);
  }
}

export function updateManagerValidationDecision(
  validationId: string,
  decisionOrStatus: 'Pending' | 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant' | {
    status: 'Pending' | 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant';
    managerComment?: string;
    managerNotes?: string;
    validatedProficiencyLevel?: number;
  },
  managerCommentParam?: string,
  validatedProficiencyLevelParam?: number
): ManagerSkillValidationItem | null {
  const validations = getStoredManagerValidations();
  const index = validations.findIndex(v => v.id === validationId);
  if (index === -1) return null;

  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let status: 'Pending' | 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant' = 'Pending';
  let managerComment = '';
  let validatedProficiencyLevel: number | undefined = undefined;

  if (typeof decisionOrStatus === 'object') {
    status = decisionOrStatus.status;
    managerComment = decisionOrStatus.managerComment || decisionOrStatus.managerNotes || '';
    validatedProficiencyLevel = decisionOrStatus.validatedProficiencyLevel;
  } else {
    status = decisionOrStatus;
    managerComment = managerCommentParam || '';
    validatedProficiencyLevel = validatedProficiencyLevelParam;
  }

  const updated: ManagerSkillValidationItem = {
    ...validations[index],
    status,
    managerComment,
    validatedProficiencyLevel: validatedProficiencyLevel || validations[index].proficiencyLevel,
    validatedAt: formattedTime
  };

  validations[index] = updated;
  saveStoredManagerValidations(validations);

  // Synchronize with team member's additional skill if present
  try {
    const members = getStoredTeamMembers();
    const mIdx = members.findIndex(m => m.id === updated.employeeId);
    if (mIdx !== -1 && members[mIdx].additionalSkills) {
      const addSkillIdx = members[mIdx].additionalSkills!.findIndex(s => s.id === updated.skillId || s.name === updated.skillName);
      if (addSkillIdx !== -1) {
        members[mIdx].additionalSkills![addSkillIdx] = {
          ...members[mIdx].additionalSkills![addSkillIdx],
          validationStatus: status,
          managerComment: managerComment,
          validatedProficiencyLevel: updated.validatedProficiencyLevel,
          underRevalidation: false
        };
        saveStoredTeamMembers(members);
      }
    }
  } catch (e) {
    console.error('Error synchronizing team member additional skill', e);
  }

  return updated;
}


