// utils/skillsData.ts
import { ValidationStatus } from '../pages/SkillsPage';

export type EvidenceType = 'certificate' | 'project' | 'assessment' | 'link' | 'document';

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
  addedDate: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Requires Review';
}

export interface AdditionalSkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category?: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  proficiencyLevel?: number; // 1: Awareness, 2: Working, 3: Practitioner, 4: Expert
  addedDate: string;
  validationStatus: ValidationStatus;
  evidences: EvidenceItem[];
  managerComment?: string;
  experienceYears?: string;
  notes?: string;
  applicationSummaries?: string[];
  explored?: boolean;
  skillScore?: number;
}

const STORAGE_KEY = 'jio_learning_additional_skills_v2';

export const INITIAL_ADDITIONAL_SKILLS_DATA: AdditionalSkillItem[] = [
  {
    id: 'add-1',
    name: 'Kubernetes & Cloud Native Systems',
    type: 'Technical',
    category: 'Cloud Infrastructure',
    criticality: 'High',
    proficiencyLevel: 3,
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
    criticality: 'Critical',
    proficiencyLevel: 4,
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
    notes: 'Explored Go channels, select statements, goroutines, and standard library HTTP server creation. Scored 82% in competency test.',
    evidences: [],
    explored: true,
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
    notes: 'Explored Vue 3 Composition API basics and state management using Pinia. Scored 68% in competency test.',
    evidences: [],
    explored: true,
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
        const updated = [...parsed];
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
        return parsed;
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
