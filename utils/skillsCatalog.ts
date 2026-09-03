// utils/skillsCatalog.ts
import { getStoredAdditionalSkills } from './skillsData';

export interface LevelDescriptor {
  level: number;
  name: string;
  shortDesc: string;
  detailedExpectation: string;
  coreCompetencies: string[];
  keyDeliverables: string[];
  assessmentCriteria: string;
  isCurrent?: boolean;
  isTarget?: boolean;
}

export interface RelatedSkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category: string;
  level: string;
  relation: string;
  relevanceScore: number;
}

export interface AssessmentTileItem {
  id: string;
  title: string;
  type: 'MCQ Diagnostic' | 'Scenario Simulation' | 'Hands-on Lab' | 'Proctored Adaptive Exam';
  questionsCount: number;
  duration: string;
  passingScore: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'Mastery';
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  score?: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  description: string;
  topicsCovered: string[];
  proctored: boolean;
  unlockedBy?: string;
}

export interface AssessmentSection {
  sectionNumber: number;
  sectionTitle: string;
  sectionSubtitle: string;
  estimatedTime: string;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  assessments: AssessmentTileItem[];
}

export interface YouTubeCourseVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  channelName: string;
  channelAvatar: string;
  isVerifiedChannel: boolean;
  views: string;
  uploadedDate: string;
  rating: number;
  reviewsCount: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  categoryTag: string;
  description: string;
  courseModulesCount: number;
  badge?: string;
}

export interface SkillDetailedInfo {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category: string;
  criticality: 'Critical' | 'High' | 'Medium';
  targetLevel: number;
  currentLevel: number;
  selfRating: number;
  managerRating: number;
  status: string;
  staleText?: string;
  skillMeaning: string;
  fullDescription: string;
  businessImpact: string;
  keyToolsAndFrameworks: string[];
  levels: LevelDescriptor[];
  relatedSkills: RelatedSkillItem[];
  assessmentJourney: {
    totalSections: number;
    totalAssessments: number;
    completedAssessments: number;
    targetScore: string;
    sections: AssessmentSection[];
  };
  youtubeCourses: YouTubeCourseVideo[];
}

export const DETAILED_SKILLS_DATABASE: Record<string, SkillDetailedInfo> = {
  'sk-1': {
    id: 'sk-1',
    name: 'eNB / gNB Config & Commissioning',
    type: 'Technical',
    category: 'Connectivity',
    criticality: 'High',
    targetLevel: 3,
    currentLevel: 3,
    selfRating: 4,
    managerRating: 3,
    status: 'Met',
    skillMeaning: 'Configuring, integrating and commissioning base station nodes (4G eNB & 5G gNB), and bringing them on air to strict acceptance standards.',
    fullDescription: 'Base station configuration and commissioning form the operational bedrock of nationwide cellular telecommunications. This competency encompasses loading site-specific parameter configuration scripts (XML/JSON), integrating gNodeB radio units (O-RU/D-RU) with Distributed Units (DU) and Centralized Units (CU), verifying optical SFP connectivity, validating CPRI/eCPRI timing synchronization, and resolving initial field handover faults to ensure zero dropouts upon commercial on-air transition.',
    businessImpact: 'Accelerates field site rollout cycles from 3 days to under 4 hours per cell site, eliminating field truck rolls and guaranteeing 99.999% site acceptance compliance.',
    keyToolsAndFrameworks: ['Ericsson OSS-RC', 'Nokia NetAct', 'Samsung ESM', 'Wireshark ASN.1 Parser', 'GPS 1PPS Sync Checkers', 'eCPRI Protocol Analyzers'],
    levels: [
      {
        level: 1,
        name: 'Awareness',
        shortDesc: 'Assists commissioning under supervision, following the standard baseline checklist.',
        detailedExpectation: 'Understands fundamental RAN cell site topology, antenna connections, power modules, and follows pre-configured scripted checklist steps with direct team lead supervision.',
        coreCompetencies: ['Basic RAN site hardware safety', 'Cable labeling & optical patch inspection', 'Standard CLI parameter verification', 'Ping test execution'],
        keyDeliverables: ['Physical inventory checklist', 'Initial power-on diagnostic log'],
        assessmentCriteria: 'Passes basic RAN site hygiene and terminal login safety test.'
      },
      {
        level: 2,
        name: 'Working',
        shortDesc: 'Commissions standard nodes end-to-end and closes routine integration faults.',
        detailedExpectation: 'Independently provisions standard macro cell configurations, executes remote software loads, validates IP routing to the Core User Plane, and closes routine SFP/VSWR alarms.',
        coreCompetencies: ['Static IP/VLAN binding on gNB', 'Firmware loading & patch deployment', 'Basic VSWR & Return Loss troubleshooting', 'Clock synchronization (PTP/SyncE)'],
        keyDeliverables: ['Site acceptance certificate document', 'Initial on-air RF test report'],
        assessmentCriteria: 'Successfully provisions a virtual gNB testbed and clears induced IP misconfiguration.'
      },
      {
        level: 3,
        name: 'Practitioner',
        shortDesc: 'Commissions and integrates independently, including non-standard and multi-vendor configurations.',
        detailedExpectation: 'Executes complex multi-sector, multi-carrier Massive MIMO and multi-vendor hybrid RAN integration. Configures advanced beam patterns, NSA Dual Connectivity (EN-DC), and handles escalated integration failures.',
        coreCompetencies: ['EN-DC Dual Connectivity calibration', 'Massive MIMO 64T64R beam script configuration', 'Multi-vendor O-RAN split-7.2x validation', 'Automated Python/Ansible provisioning scripts'],
        keyDeliverables: ['Multi-band cluster acceptance package', 'Zero-defect commissioning sign-off'],
        assessmentCriteria: 'Passes complex multi-vendor NSA/SA integration scenario with full protocol trace analysis.',
        isCurrent: true,
        isTarget: true
      },
      {
        level: 4,
        name: 'Expert',
        shortDesc: 'Owns the commissioning standard. Resolves escalated integration failures and audits nationwide quality.',
        detailedExpectation: 'Authors enterprise-wide Golden Configuration templates, architect automated zero-touch provisioning (ZTP) systems, and audits nationwide RAN deployment quality across all telecom circles.',
        coreCompetencies: ['Zero-Touch Provisioning (ZTP) architecture', 'Enterprise Golden Template governance', 'Root cause post-mortems of system outages', 'Patent & next-gen 6G testbed blueprints'],
        keyDeliverables: ['Enterprise RAN Commissioning Standard V4', 'Automated ZTP CI/CD Pipeline blueprint'],
        assessmentCriteria: 'Successfully conducts Circle Architecture Audit and architects disaster recovery procedures.'
      }
    ],
    relatedSkills: [
      { id: 'sk-3', name: '5G NR Radio Access', type: 'Technical', category: 'RF Engineering', level: 'L2 Working', relation: 'Direct Prerequisite', relevanceScore: 96 },
      { id: 'sk-2', name: 'Small Cell & In-Building Solutions', type: 'Technical', category: 'RF Engineering', level: 'L3 Practitioner', relation: 'Adjacent Specialization', relevanceScore: 91 },
      { id: 'sk-4', name: 'RF Optimisation & Drive Test', type: 'Technical', category: 'RF Engineering', level: 'L3 Practitioner', relation: 'Downstream Verification', relevanceScore: 88 },
      { id: 'sk-9', name: '5G Core Slicing & Edge Protocol', type: 'Domain', category: 'Telecom Engineering', level: 'L2 Working', relation: 'Upstream Core Interface', relevanceScore: 84 }
    ],
    assessmentJourney: {
      totalSections: 4,
      totalAssessments: 8,
      completedAssessments: 6,
      targetScore: '85% Target Level 3 Pass',
      sections: [
        {
          sectionNumber: 1,
          sectionTitle: 'Section 1: Base Station Topology & Commissioning Basics',
          sectionSubtitle: 'Validates site hardware layout, optical interface standards, and power-up sequences',
          estimatedTime: '35 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-101',
              title: 'gNodeB Hardware Architecture & SFP Link Verification',
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '20 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 95,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Validates RU/DU optical transceiver types, fiber loss budgets, and eCPRI frame structures.',
              topicsCovered: ['eCPRI 2.0', '10G/25G SFP+', '1PPS Sync', 'RU-DU Interconnects'],
              proctored: false
            },
            {
              id: 'asm-102',
              title: 'IP Securing & VLAN Tagging on Base Station Nodes',
              type: 'Scenario Simulation',
              questionsCount: 15,
              duration: '25 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 90,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Interactive troubleshooting of management VLAN trunking and IPsec gateway certificate bindings.',
              topicsCovered: ['IPsec IKEv2', 'VLAN Trunking', 'Subnet Masking', 'Default Gateway Health'],
              proctored: false
            }
          ]
        },
        {
          sectionNumber: 2,
          sectionTitle: 'Section 2: Parameter Scripts & Massive MIMO Calibration',
          sectionSubtitle: 'Validates parameter script parsing, antenna tilt mappings, and beamforming parameters',
          estimatedTime: '50 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-201',
              title: 'XML/JSON Configuration Script Parsing & Parameter Audit',
              type: 'MCQ Diagnostic',
              questionsCount: 25,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'completed',
              score: 88,
              attemptsAllowed: 3,
              attemptsUsed: 2,
              description: 'Audits multi-carrier parameter templates and flags power allocation inconsistencies.',
              topicsCovered: ['Carrier Aggregation XML', 'PCI Collision Rules', 'TAC Mapping', 'Power Spectral Density'],
              proctored: false
            },
            {
              id: 'asm-202',
              title: '64T64R Beam Weight & Digital Tilt Configuration Lab',
              type: 'Hands-on Lab',
              questionsCount: 12,
              duration: '35 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'completed',
              score: 92,
              attemptsAllowed: 2,
              attemptsUsed: 1,
              description: 'Interactive simulated CLI terminal to configure SSB beam grid azimuth and elevation sweeps.',
              topicsCovered: ['SSB Beamforming', 'Broadcast Beams', 'CSI-RS Configuration', 'Antenna Array Calibration'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 3,
          sectionTitle: 'Section 3: Multi-Vendor Integration & Dual Connectivity (EN-DC)',
          sectionSubtitle: 'Focuses on 4G anchor eNB + 5G gNB dual connectivity and X2/Xn interface signaling',
          estimatedTime: '60 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-301',
              title: 'EN-DC Option 3x Call Flow & X2 Handshake Diagnostic',
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '25 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'completed',
              score: 87,
              attemptsAllowed: 2,
              attemptsUsed: 1,
              description: 'Examines S1-U and S1-MME routing during Secondary Node Addition in 5G Non-Standalone networks.',
              topicsCovered: ['SgNB Addition Request', 'X2 Setup', 'B1 Measurement Reporting', 'Split Bearer Routing'],
              proctored: true
            },
            {
              id: 'asm-302',
              title: 'Multi-Vendor O-RAN Split 7.2x Synchronization Lab',
              type: 'Hands-on Lab',
              questionsCount: 10,
              duration: '40 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'completed',
              score: 91,
              attemptsAllowed: 2,
              attemptsUsed: 1,
              description: 'Simulates interoperability debugging between Vendor A O-DU and Vendor B O-RU using Open FH specs.',
              topicsCovered: ['O-RAN C/U/S/M Planes', 'PTP Telecom Profile G.8275.1', 'Delay Management', 'CU-DU F1 API'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 4,
          sectionTitle: 'Section 4: Comprehensive Level 3 Practitioner Proctored Exam',
          sectionSubtitle: 'Final proctored multi-domain assessment required for certified Level 3 & Level 4 progression',
          estimatedTime: '75 Mins',
          status: 'available',
          assessments: [
            {
              id: 'asm-401',
              title: 'Level 3 RAN Commissioning Certified Practicum (Proctored)',
              type: 'Proctored Adaptive Exam',
              questionsCount: 35,
              duration: '50 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'High-stakes adaptive assessment testing live fault isolation, automated parameter push, and SLA acceptance verification.',
              topicsCovered: ['End-to-end Call Traces', 'Dynamic Retune Automation', 'Disaster Recovery Failover', 'Root Cause Analysis'],
              proctored: true
            },
            {
              id: 'asm-402',
              title: 'Zero-Touch Provisioning (ZTP) Automated Pipeline Capstone',
              type: 'Hands-on Lab',
              questionsCount: 8,
              duration: '45 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Author a complete Python/Ansible deployment playbook to commission 5 simulated gNodeB nodes simultaneously.',
              topicsCovered: ['Ansible RAN Automation', 'JSON Schema Validation', 'Zero-Touch Rollout', 'Automated Health Sign-off'],
              proctored: true
            }
          ]
        }
      ]
    },
    youtubeCourses: [
      {
        id: 'crs-yt-101',
        title: 'Complete 5G gNB Node Integration & Multi-Vendor Setup Masterclass',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        duration: '48:20',
        channelName: 'Jio 5G Academy',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '42.8K learners',
        uploadedDate: '2 weeks ago',
        rating: 4.9,
        reviewsCount: '2.4K',
        difficulty: 'Advanced',
        categoryTag: 'Hands-on Lab',
        badge: 'Top Pick',
        courseModulesCount: 8,
        description: 'Comprehensive walkthrough of 5G Standalone and NSA base station commissioning, beamforming script validation, and zero-touch rollout.'
      },
      {
        id: 'crs-yt-102',
        title: 'Base Station Acceptance Protocol & Field RF Audit Best Practices',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        duration: '1:15:30',
        channelName: 'Telecom Engineering Central',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '28.1K learners',
        uploadedDate: '1 month ago',
        rating: 4.8,
        reviewsCount: '1.2K',
        difficulty: 'Intermediate',
        categoryTag: 'Field Operations',
        badge: 'Recommended',
        courseModulesCount: 6,
        description: 'Step-by-step guidance on validating VSWR, optical return loss, GPS 1PPS time sync, and passing circle audit requirements.'
      },
      {
        id: 'crs-yt-103',
        title: 'O-RAN 7.2x Open Fronthaul Interface Debugging & Timing Analysis',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        duration: '36:45',
        channelName: 'Open RAN Alliance Labs',
        channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '19.5K learners',
        uploadedDate: '3 weeks ago',
        rating: 4.9,
        reviewsCount: '950',
        difficulty: 'Advanced',
        categoryTag: 'Architecture',
        badge: 'Trending',
        courseModulesCount: 5,
        description: 'Deep dive into C/U/S-plane message structures, PTP Telecom profiles (G.8275.1), and multi-vendor packet delay variation resolution.'
      },
      {
        id: 'crs-yt-104',
        title: 'Zero-Touch RAN Automation using Python, Ansible & Netconf/YANG',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        duration: '54:10',
        channelName: 'DevOps for Telco',
        channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: false,
        views: '15.3K learners',
        uploadedDate: '2 months ago',
        rating: 4.7,
        reviewsCount: '620',
        difficulty: 'Advanced',
        categoryTag: 'Automation & Scripting',
        courseModulesCount: 7,
        description: 'Automate mass gNB provisioning across 1,000+ sites with declarative Ansible playbooks and automated rollback guardrails.'
      }
    ]
  },

  'sk-3': {
    id: 'sk-3',
    name: '5G NR Radio Access',
    type: 'Technical',
    category: 'RF Engineering',
    criticality: 'Critical',
    targetLevel: 3,
    currentLevel: 2,
    selfRating: 3,
    managerRating: 2,
    status: '1 level short',
    skillMeaning: 'Understanding and configuring 5G New Radio (NR) protocols, subcarrier spacing (SCS), beamforming, Massive MIMO, and spectrum allocation.',
    fullDescription: '5G New Radio (NR) represents the global 3GPP wireless standard designed for ultra-high throughput, massive machine connectivity, and ultra-reliable low latency (URLLC). Mastering this discipline demands profound insight into flexible numerology (15kHz to 240kHz SCS), Orthogonal Frequency Division Multiplexing (CP-OFDM), 3D spatial beamforming, Channel State Information (CSI) feedback calculation, Carrier Aggregation across FR1 and FR2 millimeter wave bands, and physical layer scheduling optimizations.',
    businessImpact: 'Unlocks up to 1.8 Gbps average user downlink throughput, slashes radio latency below 8ms, and powers mission-critical industrial enterprise private 5G networks.',
    keyToolsAndFrameworks: ['MATLAB 5G Toolbox', 'Keysight Nemo Outdoor', 'Qualcomm QXDM Trace Parser', 'Atoll RF Planning Tool', 'Rohde & Schwarz Spectrum Analyzers'],
    levels: [
      {
        level: 1,
        name: 'Awareness',
        shortDesc: 'Understands 5G NR frame structure, numerology, and frequency bands.',
        detailedExpectation: 'Familiar with 3GPP Release 15/16/17 foundations, FR1 (Sub-6 GHz) vs FR2 (mmWave) band classifications, and basic slot timing.',
        coreCompetencies: ['Frame structure (10ms radio frame, 1ms subframe)', 'Flexible subcarrier spacing (mu = 0 to 4)', 'FDD vs TDD frame configurations', 'SSB block transmission structure'],
        keyDeliverables: ['Physical layer parameters cheatsheet', 'Numerology comparison brief'],
        assessmentCriteria: 'Passes basic 5G NR physical layer terminology and numerology test.'
      },
      {
        level: 2,
        name: 'Working',
        shortDesc: 'Configures basic 5G NR gNB parameters and handles routine radio troubleshooting.',
        detailedExpectation: 'Configures bandwidth parts (BWP), initial synchronization channels (PSS/SSS/PBCH), and isolates routine physical layer degradation such as high BLER or low throughput.',
        coreCompetencies: ['BWP (Bandwidth Part) switching configuration', 'Physical Cell ID (PCI) planning & mod3 rules', 'PUSCH/PDSCH MCS table selection', 'Initial RACH preamble calibration'],
        keyDeliverables: ['Cluster radio parameter workbook', 'Physical layer BLER investigation log'],
        assessmentCriteria: 'Calculates correct PRACH root sequence planning and resolves PCI collision scenario.',
        isCurrent: true
      },
      {
        level: 3,
        name: 'Practitioner',
        shortDesc: 'Optimizes Massive MIMO, beamforming vectors, and carrier aggregation in live networks.',
        detailedExpectation: 'Tunes 3D spatial beam weights, MU-MIMO user pairing algorithms, Carrier Aggregation scheduling across non-contiguous frequency bands, and dynamic power boosting.',
        coreCompetencies: ['Massive MIMO MU-MIMO rank indicator pairing', 'CSI-RS resource mapping & precoding matrix (PMI) tuning', 'Dynamic spectrum sharing (DSS) 4G/5G coexistence', 'Cross-carrier scheduling & supplemental uplink (SUL)'],
        keyDeliverables: ['High-density stadium 5G NR optimization blueprint', 'Multi-band carrier aggregation audit report'],
        assessmentCriteria: 'Passes live cluster optimization scenario elevating cell edge throughput by >25% in simulation.',
        isTarget: true
      },
      {
        level: 4,
        name: 'Expert',
        shortDesc: 'Defines 5G NR radio algorithms and spectrum allocation strategy across nationwide enterprise deployments.',
        detailedExpectation: 'Authors corporate 3GPP algorithm enhancements, authors standard whitepapers, designs AI-driven beam management, and sets enterprise radio spectrum roadmap.',
        coreCompetencies: ['AI/ML-based beam prediction algorithms', 'mmWave beam recovery & fast handoff architecture', '3GPP standards contributions & IPR creation', 'Macro & small cell heterogeneous coordination'],
        keyDeliverables: ['Nationwide 5G NR Spectrum Strategy 2027', 'AI Self-Optimizing Radio Network Patent Blueprint'],
        assessmentCriteria: 'Authoring novel algorithm standard approved by Executive Technical Council.'
      }
    ],
    relatedSkills: [
      { id: 'sk-1', name: 'eNB / gNB Config & Commissioning', type: 'Technical', category: 'Connectivity', level: 'L3 Practitioner', relation: 'Operational Execution', relevanceScore: 94 },
      { id: 'sk-4', name: 'RF Optimisation & Drive Test', type: 'Technical', category: 'RF Engineering', level: 'L3 Practitioner', relation: 'Field Validation & Tuning', relevanceScore: 92 },
      { id: 'sk-2', name: 'Small Cell & In-Building Solutions', type: 'Technical', category: 'RF Engineering', level: 'L3 Practitioner', relation: 'Indoor Radio Densification', relevanceScore: 86 },
      { id: 'sk-9', name: '5G Core Slicing & Edge Protocol Architecture', type: 'Domain', category: 'Telecom Engineering', level: 'L2 Working', relation: 'End-to-End Quality of Service', relevanceScore: 89 }
    ],
    assessmentJourney: {
      totalSections: 4,
      totalAssessments: 8,
      completedAssessments: 3,
      targetScore: '85% Target Level 3 Pass',
      sections: [
        {
          sectionNumber: 1,
          sectionTitle: 'Section 1: 5G NR Numerology & Frame Timing Foundations',
          sectionSubtitle: 'Validates fundamental numerology, slot allocations, and synchronization signal blocks (SSB)',
          estimatedTime: '40 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-311',
              title: 'Numerology, Subcarrier Spacing & Slot Structure Diagnostic',
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '20 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 92,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Tests mathematical calculations for slot duration, symbol cyclic prefix, and RB grid sizing.',
              topicsCovered: ['15/30/60/120 kHz SCS', 'Resource Blocks (RB)', 'Slot Timings', 'TDD Frame Alignment'],
              proctored: false
            },
            {
              id: 'asm-312',
              title: 'SSB Grid Mapping & PBCH Broadcast Parameters',
              type: 'Scenario Simulation',
              questionsCount: 15,
              duration: '20 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 88,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Validates calculation of SSB burst periodicity, subcarrier offset kSSB, and MIB decoding.',
              topicsCovered: ['PSS/SSS', 'PBCH Payload', 'kSSB Frequency Offset', 'RMSI Scheduling'],
              proctored: false
            }
          ]
        },
        {
          sectionNumber: 2,
          sectionTitle: 'Section 2: Physical Layer Channels & RACH Procedures',
          sectionSubtitle: 'Focuses on PRACH preambles, PDSCH/PUSCH DMRS mapping, and channel state feedback',
          estimatedTime: '45 Mins',
          status: 'in_progress',
          assessments: [
            {
              id: 'asm-321',
              title: '5G RACH Preamble Format & 4-Step / 2-Step Procedures',
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '25 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'completed',
              score: 86,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Examines Msg1 to Msg4 signalling flow, Contention Resolution, and 2-Step CBRA enhancements.',
              topicsCovered: ['Msg1 Preamble', 'Msg2 RAR', 'Msg3 RRC Setup', 'Msg4 Contention Resolution'],
              proctored: false
            },
            {
              id: 'asm-322',
              title: 'PDSCH Modulation & MCS Table Calibration Lab',
              type: 'Hands-on Lab',
              questionsCount: 12,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Interactive tuning of 256-QAM and 64-QAM table transitions under varying SINR conditions.',
              topicsCovered: ['256QAM vs 64QAM', 'CQI / PMI / RI Mapping', 'CSI-RS Codebook', 'Target BLER 10%'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 3,
          sectionTitle: 'Section 3: Massive MIMO Beamforming & Carrier Aggregation (Level 3 Target)',
          sectionSubtitle: 'Core requirements to bridge your 1-level gap to Level 3 Practitioner',
          estimatedTime: '60 Mins',
          status: 'available',
          assessments: [
            {
              id: 'asm-331',
              title: 'Massive MIMO Spatial Multiplexing & MU-MIMO User Pairing',
              type: 'Scenario Simulation',
              questionsCount: 20,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Simulates high-load urban macro scenario where 16 layers must be scheduled across 8 concurrent user devices.',
              topicsCovered: ['Zero-Forcing Beamforming', 'SRS reciprocity-based scheduling', 'CSI-RS Codebook Type II', 'Inter-beam Interference'],
              proctored: true
            },
            {
              id: 'asm-332',
              title: 'Multi-Band 5G Carrier Aggregation & Dynamic Spectrum Sharing (DSS)',
              type: 'Hands-on Lab',
              questionsCount: 15,
              duration: '35 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Configure and verify 3CC DL Carrier Aggregation (N78 + N28 + N3) with cross-carrier scheduling.',
              topicsCovered: ['Pcell & Scell Activation', 'Cross-carrier DCI', 'DSS MBSFN Rate Matching', 'Dynamic Power Sharing'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 4,
          sectionTitle: 'Section 4: Comprehensive Level 3 Certification Exam',
          sectionSubtitle: 'Final Proctored Evaluation certifying full Level 3 Practitioner promotion',
          estimatedTime: '70 Mins',
          status: 'locked',
          assessments: [
            {
              id: 'asm-341',
              title: '5G NR Radio Access Specialist Practicum (Proctored Final)',
              type: 'Proctored Adaptive Exam',
              questionsCount: 40,
              duration: '60 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'AI-monitored comprehensive assessment covering beam sweeps, interference cancelation, and multi-vendor RF traces.',
              topicsCovered: ['Full Layer 1-3 Protocol Stack', 'Massive MIMO RF Tuning', 'mmWave Beam Recovery', 'Circle KPI Optimization'],
              proctored: true
            },
            {
              id: 'asm-342',
              title: 'Advanced Radio Optimization Case Study & Defect Triage',
              type: 'Hands-on Lab',
              questionsCount: 6,
              duration: '45 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Solve real-world degraded cluster case study with complex pilot contamination and antenna cross-polarization.',
              topicsCovered: ['Pilot Contamination', 'Tilt Misalignment', 'High SINR / Low Throughput Root Cause', 'SON Configuration'],
              proctored: true
            }
          ]
        }
      ]
    },
    youtubeCourses: [
      {
        id: 'crs-yt-301',
        title: '5G NR Massive MIMO & 3D Beamforming Deep Dive: From Theory to Field Optimization',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
        duration: '1:08:45',
        channelName: 'Jio 5G Lab & RF Academy',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '54.2K learners',
        uploadedDate: '1 week ago',
        rating: 4.9,
        reviewsCount: '3.1K',
        difficulty: 'Advanced',
        categoryTag: 'Architecture Deep Dive',
        badge: 'Staff Pick',
        courseModulesCount: 10,
        description: 'Comprehensive masterclass covering 64T64R antenna panels, digital vs hybrid beamforming, SRS reciprocity weights, and MU-MIMO rank pairing.'
      },
      {
        id: 'crs-yt-302',
        title: 'Radio Access Network Optimization Essentials & Physical Layer Protocol Tracing',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
        duration: '45:15',
        channelName: 'Telecom Tech Network',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '33.9K learners',
        uploadedDate: '3 weeks ago',
        rating: 4.8,
        reviewsCount: '1.4K',
        difficulty: 'Intermediate',
        categoryTag: 'Hands-on Lab',
        badge: 'Recommended',
        courseModulesCount: 6,
        description: 'Learn to decode QXDM and Wireshark Layer 1/2 traces, isolate BLER spikes, and optimize PDSCH 256-QAM modulation efficiency in live networks.'
      },
      {
        id: 'crs-yt-303',
        title: '5G Dynamic Spectrum Sharing (DSS) & Multi-Band Carrier Aggregation',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        duration: '52:30',
        channelName: 'Global Telecom Standards Hub',
        channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '22.1K learners',
        uploadedDate: '1 month ago',
        rating: 4.9,
        reviewsCount: '870',
        difficulty: 'Advanced',
        categoryTag: 'Certification Prep',
        badge: 'Trending',
        courseModulesCount: 7,
        description: 'Understand 4G/5G dynamic resource sharing at sub-millisecond granularity, MBSFN configurations, and cross-carrier scheduling setups.'
      },
      {
        id: 'crs-yt-304',
        title: '5G NR Standalone (SA) vs Non-Standalone (NSA) Signaling Call Flow Walkthrough',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        duration: '41:10',
        channelName: 'Jio 5G Academy',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '41.6K learners',
        uploadedDate: '2 months ago',
        rating: 4.8,
        reviewsCount: '1.9K',
        difficulty: 'Intermediate',
        categoryTag: 'Call Flow & Signaling',
        courseModulesCount: 5,
        description: 'Complete step-by-step visual animation of Option 3x NSA vs Option 2 Standalone registration, PDU session establishment, and handovers.'
      }
    ]
  },

  'sk-6': {
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
    skillMeaning: 'Designing resilient, decoupled microservices, gRPC communication contracts, distributed caching topologies, and event-driven architectures.',
    fullDescription: 'Enterprise distributed systems architecture requires designing highly scalable, stateless, and fault-tolerant software services. This discipline covers asynchronous event streaming using Apache Kafka, idempotent command handling, Saga pattern orchestration, distributed transaction management, circuit breakers, rate limiting gateways, and comprehensive distributed tracing using OpenTelemetry and Jaeger.',
    businessImpact: 'Maintains 99.999% platform availability across 400M+ active subscriber transactions while enabling zero-downtime rolling canary deployments.',
    keyToolsAndFrameworks: ['Apache Kafka', 'gRPC / Protocol Buffers', 'Redis Enterprise Cluster', 'Envoy Proxy / Istio', 'OpenTelemetry', 'PostgreSQL / CockroachDB'],
    levels: [
      {
        level: 1,
        name: 'Awareness',
        shortDesc: 'Understands basic REST APIs and stateless service containerization.',
        detailedExpectation: 'Builds simple HTTP REST services, writes Dockerfiles, and understands basic HTTP status codes and JSON payload contracts.',
        coreCompetencies: ['RESTful API principles', 'Docker container creation', 'Basic relational CRUD queries', 'Git version control workflows'],
        keyDeliverables: ['Single container REST service', 'API documentation via OpenAPI 3.0'],
        assessmentCriteria: 'Passes basic HTTP and Docker containerization test.'
      },
      {
        level: 2,
        name: 'Working',
        shortDesc: 'Develops and tests microservices with database connection pooling and structured logging.',
        detailedExpectation: 'Implements production-ready services with connection pools, graceful shutdown handlers, structured JSON logging, and unit/integration tests.',
        coreCompetencies: ['Database connection pool tuning', 'Structured logging (Winston/Zap)', 'JWT authentication middleware', 'Async background jobs (BullMQ/Celery)'],
        keyDeliverables: ['Production-ready CRUD microservice', 'Automated test suite with >80% code coverage'],
        assessmentCriteria: 'Passes code review for connection leakage and async race conditions.'
      },
      {
        level: 3,
        name: 'Practitioner',
        shortDesc: 'Architects event-driven microservices with saga patterns, distributed tracing, and retry policies.',
        detailedExpectation: 'Designs event-driven message queues with Apache Kafka, implements compensating transactions via Saga orchestrators, and sets up OpenTelemetry tracing.',
        coreCompetencies: ['Apache Kafka partitioned consumers', 'Saga pattern choreography & orchestration', 'OpenTelemetry context propagation', 'Resilience4j / Circuit Breaker policies'],
        keyDeliverables: ['Event-driven order checkout architecture', 'Distributed tracing topology blueprint'],
        assessmentCriteria: 'Implements resilient Saga workflow surviving unexpected worker crashes without data loss.',
        isCurrent: true
      },
      {
        level: 4,
        name: 'Expert',
        shortDesc: 'Sets enterprise microservice design standards, zero-trust service mesh, and global high-availability blueprints.',
        detailedExpectation: 'Owns enterprise architecture standards across 50+ squads, designs multi-region active-active database replication, and zero-trust mTLS service mesh.',
        coreCompetencies: ['Active-Active multi-datacenter replication', 'Istio Service Mesh mTLS & authorization policies', 'Disaster Recovery RPO=0 / RTO<30s', 'Enterprise Architecture Review Board leadership'],
        keyDeliverables: ['Enterprise Microservices Blueprint 2027', 'Global Active-Active Resiliency Standard'],
        assessmentCriteria: 'Defends multi-region active-active architecture before Enterprise Architecture Review Board.',
        isTarget: true
      }
    ],
    relatedSkills: [
      { id: 'lib-1', name: 'Kubernetes & Container Orchestration', type: 'Technical', category: 'DevOps & Infrastructure', level: 'L3 Practitioner', relation: 'Runtime Platform', relevanceScore: 95 },
      { id: 'lib-2', name: 'Cloud Architecture (AWS / GCP / Azure)', type: 'Technical', category: 'Cloud Infrastructure', level: 'L3 Practitioner', relation: 'Infrastructure Layer', relevanceScore: 93 },
      { id: 'lib-10', name: 'RESTful API & GraphQL Design', type: 'Technical', category: 'Software Architecture', level: 'L4 Expert', relation: 'API Surface Design', relevanceScore: 90 },
      { id: 'sk-5', name: 'Fault Management & Troubleshooting', type: 'Functional', category: 'Operations', level: 'L3 Practitioner', relation: 'Operational Resiliency', relevanceScore: 85 }
    ],
    assessmentJourney: {
      totalSections: 4,
      totalAssessments: 8,
      completedAssessments: 5,
      targetScore: '90% Target Level 4 Mastery',
      sections: [
        {
          sectionNumber: 1,
          sectionTitle: 'Section 1: Microservice Boundaries & Communication Protocols',
          sectionSubtitle: 'Validates Domain-Driven Design (DDD), gRPC vs REST, and contract testing',
          estimatedTime: '40 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-611',
              title: 'Domain-Driven Design (DDD) Bounded Contexts & API Contracts',
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '25 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'completed',
              score: 94,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Validates bounded context separation, aggregate roots, and anti-corruption layers.',
              topicsCovered: ['Aggregate Roots', 'Domain Events', 'Protobuf 3 Contracts', 'Pact Contract Testing'],
              proctored: false
            },
            {
              id: 'asm-612',
              title: 'High-Performance gRPC Streaming & Multiplexing Lab',
              type: 'Hands-on Lab',
              questionsCount: 10,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: 'completed',
              score: 90,
              attemptsAllowed: 2,
              attemptsUsed: 1,
              description: 'Implement bidirectional gRPC streaming with keepalive pings and dead-letter channels.',
              topicsCovered: ['HTTP/2 Streams', 'Protobuf Marshalling', 'gRPC Interceptors', 'Flow Control'],
              proctored: false
            }
          ]
        },
        {
          sectionNumber: 2,
          sectionTitle: 'Section 2: Event-Driven Systems & Apache Kafka Partitions',
          sectionSubtitle: 'Focuses on exactly-once semantics, consumer rebalances, and schema evolution',
          estimatedTime: '55 Mins',
          status: 'completed',
          assessments: [
            {
              id: 'asm-621',
              title: 'Kafka Partitions, Consumer Groups & Exactly-Once Semantics (EOS)',
              type: 'MCQ Diagnostic',
              questionsCount: 25,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'completed',
              score: 88,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Examines transactional producer IDs, idempotent writes, and partition rebalance protocols.',
              topicsCovered: ['Transactional ID', 'Kafka Streams', 'Avro Schema Registry', 'Compacted Topics'],
              proctored: false
            },
            {
              id: 'asm-622',
              title: 'Saga Pattern Distributed Transaction Orchestrator Lab',
              type: 'Hands-on Lab',
              questionsCount: 8,
              duration: '35 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: 'completed',
              score: 93,
              attemptsAllowed: 2,
              attemptsUsed: 1,
              description: 'Implement an asynchronous Saga orchestrator with compensating rollbacks upon payment failure.',
              topicsCovered: ['Saga State Machine', 'Compensating Transactions', 'Outbox Pattern', 'Idempotency Keys'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 3,
          sectionTitle: 'Section 3: Zero-Trust Service Mesh & Distributed Resiliency (Level 4 Focus)',
          sectionSubtitle: 'Deep dive into Istio mTLS, circuit breaker cascades, and OpenTelemetry',
          estimatedTime: '60 Mins',
          status: 'in_progress',
          assessments: [
            {
              id: 'asm-631',
              title: 'Istio Envoy Service Mesh, Circuit Breakers & Rate Limiting',
              type: 'Scenario Simulation',
              questionsCount: 18,
              duration: '30 Mins',
              passingScore: '90%',
              difficulty: 'Advanced',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Configure Envoy outlier detection, token bucket rate limiting, and mTLS peer authentication.',
              topicsCovered: ['Envoy Outlier Detection', 'mTLS STRICT mode', 'Global Rate Limiting', 'Chaos Mesh Testing'],
              proctored: true
            },
            {
              id: 'asm-632',
              title: 'OpenTelemetry Trace Propagation & Anomaly Detection',
              type: 'Hands-on Lab',
              questionsCount: 10,
              duration: '35 Mins',
              passingScore: '90%',
              difficulty: 'Advanced',
              status: 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Instrument W3C traceparent propagation across asynchronous message queues and cache lookups.',
              topicsCovered: ['W3C Trace Context', 'Span Attributes', 'Jaeger Collector', 'Latency Percentile p99'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 4,
          sectionTitle: 'Section 4: Enterprise Grade E5 Level 4 Architect Certification',
          sectionSubtitle: 'High-stakes final proctored exam for Staff & Lead Architect qualification',
          estimatedTime: '80 Mins',
          status: 'locked',
          assessments: [
            {
              id: 'asm-641',
              title: 'Multi-Region Active-Active Distributed Systems Architecture (Proctored)',
              type: 'Proctored Adaptive Exam',
              questionsCount: 35,
              duration: '55 Mins',
              passingScore: '92%',
              difficulty: 'Mastery',
              status: 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Evaluates global consensus protocols (Raft/Paxos), multi-master database conflict resolution, and RPO=0 disaster recovery.',
              topicsCovered: ['Conflict-Free Replicated Data Types (CRDT)', 'Global Traffic Routing', 'Raft Consensus', 'RPO=0 DR Strategy'],
              proctored: true
            },
            {
              id: 'asm-642',
              title: 'Enterprise Architecture Review Board System Design Defense',
              type: 'Scenario Simulation',
              questionsCount: 5,
              duration: '45 Mins',
              passingScore: '92%',
              difficulty: 'Mastery',
              status: 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Architect and defend a mission-critical billing settlement architecture handling 50,000 TPS under extreme network partition.',
              topicsCovered: ['CAP Theorem Tradeoffs', 'High-Throughput Ledger', 'Multi-Region Sharding', 'Cost Optimization'],
              proctored: true
            }
          ]
        }
      ]
    },
    youtubeCourses: [
      {
        id: 'crs-yt-601',
        title: 'Cloud-Native Distributed Systems & Resiliency Patterns: Saga, Outbox & Event Sourcing',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        duration: '1:14:20',
        channelName: 'Enterprise Cloud Architecture',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '68.4K learners',
        uploadedDate: '2 weeks ago',
        rating: 4.9,
        reviewsCount: '4.2K',
        difficulty: 'Advanced',
        categoryTag: 'Architecture Deep Dive',
        badge: 'Top Rated',
        courseModulesCount: 12,
        description: 'Master practical implementation of distributed transactions, asynchronous Kafka pipelines, transactional outbox pattern, and idempotency guarantees.'
      },
      {
        id: 'crs-yt-602',
        title: 'Apache Kafka Mastery: Partitions, Exactly-Once Semantics & Production Scaling',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        duration: '58:40',
        channelName: 'Data Engineering Network',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '45.1K learners',
        uploadedDate: '1 month ago',
        rating: 4.8,
        reviewsCount: '2.1K',
        difficulty: 'Advanced',
        categoryTag: 'Hands-on Lab',
        badge: 'Popular',
        courseModulesCount: 8,
        description: 'Deep dive into Kafka broker internals, consumer group rebalance mechanics, Avro schema evolution, and tuning for zero message loss.'
      },
      {
        id: 'crs-yt-603',
        title: 'Zero-Trust Istio Service Mesh & OpenTelemetry Distributed Tracing in Production',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        duration: '49:15',
        channelName: 'DevOps & Cloud Native World',
        channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '31.2K learners',
        uploadedDate: '3 weeks ago',
        rating: 4.9,
        reviewsCount: '1.5K',
        difficulty: 'Advanced',
        categoryTag: 'Security & Observability',
        badge: 'Staff Pick',
        courseModulesCount: 7,
        description: 'Secure microservice-to-microservice traffic with automated mTLS rotation, granular authorization policies, and distributed OpenTelemetry context propagation.'
      }
    ]
  }
};

/**
 * Generate a dynamic full detailed skill object for any skill ID or Name
 */
export function getSkillDetailedInfo(skillIdOrName: string): SkillDetailedInfo {
  // 1. Direct database lookup
  if (DETAILED_SKILLS_DATABASE[skillIdOrName]) {
    return DETAILED_SKILLS_DATABASE[skillIdOrName];
  }

  // 2. Check by name in database
  const matchByName = Object.values(DETAILED_SKILLS_DATABASE).find(
    s => s.name.toLowerCase() === skillIdOrName.toLowerCase() || s.id.toLowerCase() === skillIdOrName.toLowerCase()
  );
  if (matchByName) return matchByName;

  // 3. Check stored additional skills
  const stored = getStoredAdditionalSkills();
  const matchedStored = stored.find(s => s.id === skillIdOrName || s.name.toLowerCase() === skillIdOrName.toLowerCase());

  const skillName = matchedStored ? matchedStored.name : (skillIdOrName.startsWith('sk-') ? `Skill (${skillIdOrName})` : skillIdOrName);
  const skillType = matchedStored ? matchedStored.type : 'Technical';
  const skillCategory = matchedStored?.category || 'Platform & Engineering';
  const criticality: 'Critical' | 'High' | 'Medium' = (matchedStored?.criticality === 'Low' ? 'Medium' : matchedStored?.criticality) || 'Critical';
  const targetLevel: number = 3;
  const currentLevel: number = matchedStored?.proficiencyLevel || 2;

  // 4. Construct high-fidelity dynamic skill info
  return {
    id: skillIdOrName,
    name: skillName,
    type: skillType,
    category: skillCategory,
    criticality: criticality,
    targetLevel: targetLevel,
    currentLevel: currentLevel,
    selfRating: currentLevel,
    managerRating: Math.max(1, currentLevel - 1),
    status: currentLevel >= targetLevel ? 'Met' : `${targetLevel - currentLevel} level short`,
    skillMeaning: `Strategic mastery and operational application of ${skillName} in enterprise telecommunications and platform infrastructure.`,
    fullDescription: `${skillName} represents a key organizational capability within ${skillCategory}. Mastering this competency empowers engineers to design, build, optimize, and troubleshoot production systems, adhering to strict architectural best practices, high-availability SLAs, and zero-defect quality benchmarks.`,
    businessImpact: `Elevates team velocity, decreases operational incident recovery time, and drives scalable technological execution across enterprise digital infrastructure.`,
    keyToolsAndFrameworks: ['Internal Platform CLI', 'Enterprise Monitoring Console', 'Automated CI/CD Pipelines', 'Performance Benchmark Suites'],
    levels: [
      {
        level: 1,
        name: 'Awareness',
        shortDesc: `Understands fundamental principles, core terminology, and baseline concepts of ${skillName}.`,
        detailedExpectation: `Understands the theoretical domain foundation, standard vocabulary, and executes basic routines with guidance.`,
        coreCompetencies: [`Core terminology and standards`, `Standard operating procedures`, `Routine validation checklists`],
        keyDeliverables: [`Foundational verification checklist`, `Initial configuration log`],
        assessmentCriteria: `Demonstrates conceptual knowledge of core definitions and guidelines.`
      },
      {
        level: 2,
        name: 'Working',
        shortDesc: `Applies ${skillName} independently to standard operational scenarios and resolves routine anomalies.`,
        detailedExpectation: `Executes end-to-end tasks, isolates regular operational bugs, and maintains clean operational logs without supervision.`,
        coreCompetencies: [`Independent routine execution`, `Standard issue troubleshooting`, `Tooling and instrumentation calibration`],
        keyDeliverables: [`Standard delivery documentation`, `Incident resolution summary`],
        assessmentCriteria: `Successfully solves practical scenarios within expected timeframes.`,
        isCurrent: currentLevel === 2
      },
      {
        level: 3,
        name: 'Practitioner',
        shortDesc: `Executes complex, non-standard, and multi-domain initiatives involving ${skillName}.`,
        detailedExpectation: `Solves multi-faceted edge cases, optimizes system metrics, and mentors peer developers in best engineering craft.`,
        coreCompetencies: [`Complex system optimization`, `Multi-vendor integration`, `Root-cause failure analysis`, `Automated testing and scripting`],
        keyDeliverables: [`Optimization workbook`, `Cluster acceptance sign-off`],
        assessmentCriteria: `Passes rigorous technical simulation with complete protocol and trace diagnostics.`,
        isCurrent: currentLevel === 3,
        isTarget: targetLevel === 3
      },
      {
        level: 4,
        name: 'Expert',
        shortDesc: `Establishes enterprise standards, authors architectural blueprints, and directs strategic evolution.`,
        detailedExpectation: `Defines corporate policies, drives technology innovation, audits nationwide implementations, and authors industry patents.`,
        coreCompetencies: [`Enterprise architectural governance`, `Technology roadmap authoring`, `Advanced innovation & patent development`],
        keyDeliverables: [`Enterprise Architecture Standard`, `Innovation Patent Blueprint`],
        assessmentCriteria: `Authors enterprise standards approved by Technical Leadership Council.`,
        isCurrent: currentLevel === 4,
        isTarget: targetLevel === 4
      }
    ],
    relatedSkills: [
      { id: 'sk-1', name: 'eNB / gNB Config & Commissioning', type: 'Technical', category: 'Connectivity', level: 'L3 Practitioner', relation: 'Operational Prerequisite', relevanceScore: 92 },
      { id: 'sk-3', name: '5G NR Radio Access', type: 'Technical', category: 'RF Engineering', level: 'L2 Working', relation: 'Direct Domain Interface', relevanceScore: 89 },
      { id: 'sk-6', name: 'Microservices & Distributed Systems', type: 'Technical', category: 'Software Architecture', level: 'L3 Practitioner', relation: 'Platform Foundation', relevanceScore: 85 }
    ],
    assessmentJourney: {
      totalSections: 4,
      totalAssessments: 8,
      completedAssessments: Math.min(8, currentLevel * 2),
      targetScore: '85% Target Level 3 Pass',
      sections: [
        {
          sectionNumber: 1,
          sectionTitle: `Section 1: ${skillName} Foundations & Diagnostic Basics`,
          sectionSubtitle: 'Validates fundamental concepts, architecture taxonomy, and operational guidelines',
          estimatedTime: '35 Mins',
          status: 'completed',
          assessments: [
            {
              id: `asm-${skillIdOrName}-101`,
              title: `${skillName} Core Concepts & Taxonomy Diagnostic`,
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '20 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 92,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: `Comprehensive diagnostic testing the architectural building blocks of ${skillName}.`,
              topicsCovered: ['Fundamental Architecture', 'Standard Protocols', 'Terminology', 'Security Baseline'],
              proctored: false
            },
            {
              id: `asm-${skillIdOrName}-102`,
              title: `${skillName} Baseline Practical Verification`,
              type: 'Scenario Simulation',
              questionsCount: 15,
              duration: '25 Mins',
              passingScore: '80%',
              difficulty: 'Foundational',
              status: 'completed',
              score: 88,
              attemptsAllowed: 3,
              attemptsUsed: 1,
              description: 'Scenario evaluation measuring your ability to isolate basic configuration discrepancies.',
              topicsCovered: ['Parameter Verification', 'Error Code Mapping', 'Health Check Execution'],
              proctored: false
            }
          ]
        },
        {
          sectionNumber: 2,
          sectionTitle: `Section 2: Practical Implementation & Problem Solving`,
          sectionSubtitle: 'Focuses on practical implementation, parameter tuning, and troubleshooting',
          estimatedTime: '45 Mins',
          status: currentLevel >= 2 ? 'completed' : 'in_progress',
          assessments: [
            {
              id: `asm-${skillIdOrName}-201`,
              title: `${skillName} Intermediate Diagnostic Quiz`,
              type: 'MCQ Diagnostic',
              questionsCount: 20,
              duration: '25 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: currentLevel >= 2 ? 'completed' : 'in_progress',
              score: currentLevel >= 2 ? 86 : undefined,
              attemptsAllowed: 3,
              attemptsUsed: currentLevel >= 2 ? 1 : 0,
              description: 'Evaluates intermediate logic, failure recovery paths, and optimization options.',
              topicsCovered: ['Advanced Parameters', 'Resiliency Strategies', 'System Integrations'],
              proctored: false
            },
            {
              id: `asm-${skillIdOrName}-202`,
              title: `${skillName} Hands-on Simulation Lab`,
              type: 'Hands-on Lab',
              questionsCount: 10,
              duration: '35 Mins',
              passingScore: '85%',
              difficulty: 'Intermediate',
              status: currentLevel >= 2 ? 'completed' : 'available',
              score: currentLevel >= 2 ? 90 : undefined,
              attemptsAllowed: 2,
              attemptsUsed: currentLevel >= 2 ? 1 : 0,
              description: 'Interactive simulated terminal to configure parameters and verify operational health.',
              topicsCovered: ['CLI Configuration', 'Telemetry Inspection', 'Validation Testing'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 3,
          sectionTitle: `Section 3: Advanced Optimization & Specialization (Target Level)`,
          sectionSubtitle: 'Core assessments required to achieve your target proficiency milestone',
          estimatedTime: '60 Mins',
          status: currentLevel >= 3 ? 'completed' : 'available',
          assessments: [
            {
              id: `asm-${skillIdOrName}-301`,
              title: `${skillName} Practitioner Case Study Analysis`,
              type: 'Scenario Simulation',
              questionsCount: 18,
              duration: '30 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: currentLevel >= 3 ? 'completed' : 'available',
              score: currentLevel >= 3 ? 91 : undefined,
              attemptsAllowed: 2,
              attemptsUsed: currentLevel >= 3 ? 1 : 0,
              description: 'Examines high-complexity production incident resolution and bottleneck remediation.',
              topicsCovered: ['Bottleneck Analysis', 'Latency Optimization', 'Multi-Node Failover'],
              proctored: true
            },
            {
              id: `asm-${skillIdOrName}-302`,
              title: `${skillName} Deep Architecture Troubleshooting Lab`,
              type: 'Hands-on Lab',
              questionsCount: 8,
              duration: '40 Mins',
              passingScore: '85%',
              difficulty: 'Advanced',
              status: currentLevel >= 3 ? 'completed' : 'available',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Troubleshoot complex simulated outages and author automated health recovery scripts.',
              topicsCovered: ['Automated Recovery', 'Log Correlation', 'Disaster Failover'],
              proctored: true
            }
          ]
        },
        {
          sectionNumber: 4,
          sectionTitle: `Section 4: Comprehensive Level ${targetLevel} Proctored Certification Exam`,
          sectionSubtitle: 'High-stakes proctored evaluation validating complete domain proficiency',
          estimatedTime: '75 Mins',
          status: currentLevel >= 4 ? 'completed' : 'locked',
          assessments: [
            {
              id: `asm-${skillIdOrName}-401`,
              title: `${skillName} Certified Specialist Practicum (Proctored)`,
              type: 'Proctored Adaptive Exam',
              questionsCount: 35,
              duration: '50 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: currentLevel >= 4 ? 'completed' : 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'AI-proctored adaptive final exam covering full spectrum domain knowledge and real-world execution.',
              topicsCovered: ['Comprehensive Theory', 'Production Forensics', 'Capacity Planning', 'SLA Governance'],
              proctored: true
            },
            {
              id: `asm-${skillIdOrName}-402`,
              title: `${skillName} Enterprise Architecture Capstone Project`,
              type: 'Hands-on Lab',
              questionsCount: 5,
              duration: '45 Mins',
              passingScore: '90%',
              difficulty: 'Mastery',
              status: currentLevel >= 4 ? 'completed' : 'locked',
              attemptsAllowed: 2,
              attemptsUsed: 0,
              description: 'Design and deliver an enterprise architectural framework compliant with nationwide scalability standards.',
              topicsCovered: ['Enterprise Architecture', 'High Availability Design', 'Automated Rollout'],
              proctored: true
            }
          ]
        }
      ]
    },
    youtubeCourses: [
      {
        id: `crs-yt-${skillIdOrName}-1`,
        title: `Mastering ${skillName}: Complete Technical Masterclass & Field Architecture`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        duration: '52:15',
        channelName: 'Jio Technology Academy',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '38.4K learners',
        uploadedDate: '2 weeks ago',
        rating: 4.9,
        reviewsCount: '2.1K',
        difficulty: 'Advanced',
        categoryTag: 'Architecture Deep Dive',
        badge: 'Most Popular',
        courseModulesCount: 8,
        description: `Comprehensive video masterclass covering practical foundations, best practices, and production implementations of ${skillName}.`
      },
      {
        id: `crs-yt-${skillIdOrName}-2`,
        title: `${skillName} Hands-On Troubleshooting & Live Diagnostic Lab`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        duration: '41:30',
        channelName: 'Engineering Excellence Hub',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '24.9K learners',
        uploadedDate: '1 month ago',
        rating: 4.8,
        reviewsCount: '1.3K',
        difficulty: 'Intermediate',
        categoryTag: 'Hands-on Lab',
        badge: 'Recommended',
        courseModulesCount: 6,
        description: `Real-world diagnostic walkthroughs, log parsing techniques, and incident resolution for ${skillName}.`
      },
      {
        id: `crs-yt-${skillIdOrName}-3`,
        title: `${skillName} Certification Preparation & Practice Exam Review`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        duration: '1:04:10',
        channelName: 'Global Tech Certifications',
        channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80',
        isVerifiedChannel: true,
        views: '19.2K learners',
        uploadedDate: '3 weeks ago',
        rating: 4.9,
        reviewsCount: '980',
        difficulty: 'Advanced',
        categoryTag: 'Certification Prep',
        badge: 'Trending',
        courseModulesCount: 9,
        description: `Exam strategy, high-yield practice scenarios, and deep dive into certification criteria for ${skillName}.`
      }
    ]
  };
}
