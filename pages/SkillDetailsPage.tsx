import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSkillDetailedInfo, 
  SkillDetailedInfo, 
  AssessmentSection 
} from '../utils/skillsCatalog';
import { 
  ArrowLeftIcon,
  ZapIcon,
  AwardIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  LockIcon,
  PlayIcon,
  CheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  SparklesIcon,
  UploadIcon,
  Trash2Icon,
  LinkIcon,
  PaperclipIcon,
  FileTextIcon
} from '../components/Icons';

// High-fidelity domain-specific questions database for major skills
const SKILLS_QUIZ_QUESTIONS: Record<string, Record<number, Array<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}>>> = {
  'sk-1': { // eNB / gNB Config & Commissioning
    1: [
      {
        question: "Which optical interface protocol is primarily used for high-bandwidth connectivity between the gNodeB Centralized Unit (CU) and Distributed Unit (DU)?",
        options: ["CPRI v7.0", "eCPRI (Ethernet-based CPRI)", "CPRI-over-OTN", "Common Public Radio Interface v3.0"],
        correctAnswer: "eCPRI (Ethernet-based CPRI)",
        explanation: "eCPRI splits physical layers and encapsulates radio data in Ethernet, dramatically increasing throughput and scalability in 5G RAN."
      },
      {
        question: "When powering on a base station node, which diagnostic step must be verified first before loading parameter scripts?",
        options: ["SFP optical laser path power levels", "Antenna azimuth calibration", "X2 interface heartbeat", "5G Core AMF registration"],
        correctAnswer: "SFP optical laser path power levels",
        explanation: "Hardware level physical connectivity and fiber power budget (laser levels) must be clean to prevent protocol flap errors."
      },
      {
        question: "What is the primary role of the 1PPS signal in telecom clock distribution?",
        options: ["Power amplification trigger", "Phase synchronization timing reference", "User plane payload routing", "Radio channel coding header"],
        correctAnswer: "Phase synchronization timing reference",
        explanation: "One Pulse Per Second (1PPS) ensures tight phase alignment across distributed radio nodes, essential for TDD frame structures."
      }
    ],
    2: [
      {
        question: "What is the main purpose of configuring beam tilt in a Massive MIMO 64T64R antenna array?",
        options: ["Increasing RF coaxial cable physical length", "Optimizing spatial multiplexing and controlling inter-cell interference", "Reducing digital power consumption of the DU", "Splitting physical cells into separate FDD channels"],
        correctAnswer: "Optimizing spatial multiplexing and controlling inter-cell interference",
        explanation: "Adjusting digital and electrical tilt shapes the 3D beams towards user hotspots, keeping energy within the cell boundary and avoiding neighbor interference."
      },
      {
        question: "Which protocol is utilized to transfer and parse configuration XML scripts over the NETCONF session?",
        options: ["SSH / YANG", "Telnet / SNMP", "HTTP / REST", "FTP / TFTP"],
        correctAnswer: "SSH / YANG",
        explanation: "NETCONF operates over SSH and uses YANG data schemas to describe base station configurations securely and structurally."
      }
    ],
    3: [
      {
        question: "During a 5G Non-Standalone (NSA) EN-DC Option 3x connection, which interface is used for direct control-plane signaling between the anchor 4G eNB and the 5G gNB?",
        options: ["S1-MME", "S1-U", "X2-C", "Ng-C"],
        correctAnswer: "X2-C",
        explanation: "X2 Control Plane (X2-C) manages secondary node addition, modification, and release between 4G and 5G base stations."
      },
      {
        question: "What is the main advantage of O-RAN Split Option 7.2x over standard CPRI?",
        options: ["It completely removes the DU component", "It allows a standard Ethernet-based Fronthaul with logical layer-2 split", "It converts LTE traffic into 5G natively", "It replaces the need for GPS clock synchronization"],
        correctAnswer: "It allows a standard Ethernet-based Fronthaul with logical layer-2 split",
        explanation: "Option 7.2x splits the physical layer, keeping complexity low at the O-RU while dramatically saving fronthaul bandwidth."
      }
    ],
    4: [
      {
        question: "In a zero-touch provisioning (ZTP) pipeline, which protocol is typically used to safely pull golden parameter configuration templates over a secure IPSec backhaul?",
        options: ["FTP", "HTTPS / SFTP", "Telnet", "TFTP"],
        correctAnswer: "HTTPS / SFTP",
        explanation: "Zero-Touch Provisioning systems utilize secure HTTPS or SFTP requests to fetch target software and configurations over IPSec tunnels."
      },
      {
        question: "When a multi-vendor RAN cluster experiences X2 connection setup failures, which parameter is the most common mismatch?",
        options: ["SCTP destination port and IP Security (IPSec) association keys", "Antenna gain tilt index", "Fronthaul optical fiber wavelength", "Paging cycle frame length"],
        correctAnswer: "SCTP destination port and IP Security (IPSec) association keys",
        explanation: "X2 interfaces run over SCTP. Security policy discrepancies or blocked SCTP ports in the firewall cause setup failure."
      }
    ]
  },
  'sk-3': { // 5G NR Radio Access
    1: [
      {
        question: "What is the subcarrier spacing (SCS) for 5G NR numerology mu = 1?",
        options: ["15 kHz", "30 kHz", "60 kHz", "120 kHz"],
        correctAnswer: "30 kHz",
        explanation: "Numerology 1 doubles the baseline 15 kHz spacing (mu = 0) to 30 kHz, shrinking the slot duration to 0.5ms."
      },
      {
        question: "Which of the following describes the SSB (Synchronization Signal Block) transmission interval?",
        options: ["Configurable up to 160ms, with a default of 20ms", "Always fixed at 5ms", "Always fixed at 10ms", "Varies from 1 slot to 1 frame dynamically"],
        correctAnswer: "Configurable up to 160ms, with a default of 20ms",
        explanation: "The SSB periodic window is configurable up to 160ms to save energy, but devices search it every 20ms by default during initial search."
      }
    ],
    2: [
      {
        question: "In the 5G NR random access (RACH) procedure, what is the role of Msg2?",
        options: ["Random Access Preamble", "Random Access Response (RAR)", "RRC Connection Setup Request", "Contention Resolution"],
        correctAnswer: "Random Access Response (RAR)",
        explanation: "Msg2 is the RAR sent by the gNodeB on the DL-SCH, containing the temporary C-RNTI and uplink timing advance."
      },
      {
        question: "Which physical channel carries the Downlink Control Information (DCI) containing scheduling grants?",
        options: ["PDSCH", "PDCCH", "PBCH", "PUCCH"],
        correctAnswer: "PDCCH",
        explanation: "The Physical Downlink Control Channel (PDCCH) carries DCI messages containing resource allocation for downlink and uplink transmissions."
      }
    ],
    3: [
      {
        question: "Which SRS parameter is critical for reciprocity-based Massive MIMO beamforming downlinks?",
        options: ["SRS comb size", "Sounding Reference Signal transmission periodicity", "Uplink channel sounding phase coherence", "CSI-RS feedback delay"],
        correctAnswer: "Uplink channel sounding phase coherence",
        explanation: "Reciprocity relies on uplink SRS phase measurements to predict downlink channel conditions, requiring tight phase coherence."
      },
      {
        question: "Which technology allows 4G LTE and 5G NR to coexist dynamically in the same frequency spectrum block?",
        options: ["FDD Coexistence", "Dynamic Spectrum Sharing (DSS)", "Carrier Aggregation Option 3", "Dual Connectivity (EN-DC)"],
        correctAnswer: "Dynamic Spectrum Sharing (DSS)",
        explanation: "DSS schedules LTE and 5G subcarriers on a millisecond-by-millisecond basis within the exact same channel bandwidth."
      }
    ],
    4: [
      {
        question: "In 5G NR, what is the theoretical maximum bandwidth supported for a single carrier in Frequency Range 2 (FR2)?",
        options: ["100 MHz", "200 MHz", "400 MHz", "800 MHz"],
        correctAnswer: "400 MHz",
        explanation: "FR2 (millimeter-wave) supports channel bandwidths up to 400 MHz on a single carrier component."
      }
    ]
  },
  'sk-6': { // Microservices & Distributed Systems Architecture
    1: [
      {
        question: "Which design pattern is most appropriate for maintaining transaction consistency across decoupled microservices without a shared database?",
        options: ["Two-Phase Commit (2PC)", "Saga Pattern", "Database Sharding", "Outbox Pattern"],
        correctAnswer: "Saga Pattern",
        explanation: "The Saga pattern orchestrates a series of local transactions with compensating rollbacks, avoiding locking resources like in 2PC."
      },
      {
        question: "What is the primary advantage of gRPC over REST with JSON in microservices inter-service communications?",
        options: ["Requires less firewall configuration", "Binary serialization via Protobuf over HTTP/2 for high-speed, compact transport", "Enforces rigid client-side database schemas", "Allows synchronous blocking calls exclusively"],
        correctAnswer: "Binary serialization via Protobuf over HTTP/2 for high-speed, compact transport",
        explanation: "gRPC uses protocol buffers and HTTP/2 stream multiplexing, reducing payload size and latency significantly compared to text-based JSON."
      }
    ],
    2: [
      {
        question: "What happens when a new consumer is added to a Kafka consumer group with fewer partitions than active consumers?",
        options: ["Kafka creates extra partitions dynamically", "The new consumer remains idle and receives no messages", "Kafka multiplexes messages across multiple consumers on the same partition", "A fatal cluster rebalance error is thrown"],
        correctAnswer: "The new consumer remains idle and receives no messages",
        explanation: "Kafka assigns a partition to at most one consumer per group. Any excess consumers over partitions will stay idle."
      },
      {
        question: "To guarantee exactly-once processing in a Kafka producer-consumer pipeline, which configuration is mandatory?",
        options: ["enable.idempotence = true on the producer", "Strict synchronous consumer loops with auto-commit", "Manual database locks on message offsets", "Setting partition count to 1"],
        correctAnswer: "enable.idempotence = true on the producer",
        explanation: "Idempotent producers prevent duplicate writes by appending unique transactional and sequence IDs to message batches."
      }
    ],
    3: [
      {
        question: "In Istio or standard service meshes, which proxy component intercepting pod-to-pod traffic enforces STRICT mutual TLS (mTLS)?",
        options: ["Control Plane Daemon (Istiod)", "Envoy Sidecar Proxy", "Kubernetes API Server", "Ingress Gateway Controller"],
        correctAnswer: "Envoy Sidecar Proxy",
        explanation: "The Envoy sidecar proxy is injected into the application pod, intercepts all network traffic, and validates mTLS certificates peer-to-peer."
      },
      {
        question: "Which pattern is used to track trace propagation context across an asynchronous message queue boundary?",
        options: ["Distributed Saga Context", "W3C Trace Context (traceparent / tracestate headers)", "Jaeger Local Agent Storage", "gRPC Interceptor Metadata"],
        correctAnswer: "W3C Trace Context (traceparent / tracestate headers)",
        explanation: "W3C Trace Context defines standard key headers that are propagated through message headers to stitch distributed asynchronous traces."
      }
    ],
    4: [
      {
        question: "Under the CAP theorem, how does a highly available distributed database handle a network partition?",
        options: ["Returns a database execution error for all read/write queries", "Continues accepting reads and writes locally, sacrificing global consistency", "Replicates all transactions synchronously across partitioned nodes", "Shuts down non-primary nodes immediately"],
        correctAnswer: "Continues accepting reads and writes locally, sacrificing global consistency",
        explanation: "In an AP (Available/Partition-tolerant) system, nodes continue serving requests, which results in temporary data divergence across partitions until synchronization is restored."
      }
    ]
  }
};

// Fallback dynamic question generator
const getQuizQuestions = (skillId: string, sectionNumber: number, skillName: string, sectionTitle: string) => {
  if (SKILLS_QUIZ_QUESTIONS[skillId] && SKILLS_QUIZ_QUESTIONS[skillId][sectionNumber]) {
    return SKILLS_QUIZ_QUESTIONS[skillId][sectionNumber];
  }
  return [
    {
      question: `What is the primary operational challenge when establishing a robust framework for "${skillName}"?`,
      options: [
        "Scalability limitations and unexpected resource constraints",
        "Upstream carrier electromagnetic interference",
        "Lack of standardized protocol versions globally",
        "Manual parameter verification overhead"
      ],
      correctAnswer: "Scalability limitations and unexpected resource constraints",
      explanation: "Handling variable load and provisioning resources dynamically is the core challenge in modern platform engineering architectures."
    },
    {
      question: `How can practitioners optimize latency and throughput during "${sectionTitle}"?`,
      options: [
        "Introducing localized caching, buffer pools, and asynchronous queuing",
        "Increasing physical network hop distance between compute nodes",
        "Deactivating parallel execution threads to simplify state",
        "Transitioning completely to synchronous REST payload calls"
      ],
      correctAnswer: "Introducing localized caching, buffer pools, and asynchronous queuing",
      explanation: "Caching, queue decoupling, and proper buffer management avoid blocking threads and maximize pipeline throughput."
    },
    {
      question: `Which tool is most commonly utilized by engineering teams to audit performance and trace errors during "${sectionTitle}"?`,
      options: [
        "Enterprise-grade performance benchmark suites and distributed tracing tools",
        "Local spreadsheet tracking models and manual tallies",
        "Text log grep filters run on demand",
        "Manual timing tests with stopwatch tools"
      ],
      correctAnswer: "Enterprise-grade performance benchmark suites and distributed tracing tools",
      explanation: "Automated APM telemetry, distributed tracing (such as OpenTelemetry), and standardized load-testing are standard for performance audits."
    }
  ];
};

const SkillDetailsPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const assessmentSectionRef = useRef<HTMLDivElement>(null);

  // Core skill state with local storage loading
  const [skill, setSkill] = useState<SkillDetailedInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'courses' | 'evidence'>('courses');
  const [videoFilter, setVideoFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quiz player states
  const [activeQuizSection, setActiveQuizSection] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Evidence states
  const [submittedEvidences, setSubmittedEvidences] = useState<Array<{
    id: string;
    title: string;
    type: 'Certificate' | 'Project' | 'Document' | 'Link';
    description: string;
    urlOrFile: string;
    date: string;
    status: 'Verified' | 'Pending Review';
  }>>([]);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<'Certificate' | 'Project' | 'Document' | 'Link'>('Certificate');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Toggleable states to simulate endorsement/certification availability
  const [hasManagerEndorsement, setHasManagerEndorsement] = useState(true);
  const [hasPlatformCertification, setHasPlatformCertification] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  // Load and save skill intelligence
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (skillId) {
      const saved = localStorage.getItem(`jio_skill_detail_${skillId}`);
      if (saved) {
        try {
          setSkill(JSON.parse(saved));
        } catch (e) {
          console.error("Error reading saved skill data:", e);
          setSkill(getSkillDetailedInfo(skillId));
        }
      } else {
        setSkill(getSkillDetailedInfo(skillId));
      }

      // Load submitted evidence
      const savedEvidences = localStorage.getItem(`jio_skill_evidence_${skillId}`);
      if (savedEvidences) {
        try {
          setSubmittedEvidences(JSON.parse(savedEvidences));
        } catch (e) {
          console.error("Error loading saved evidence:", e);
        }
      } else {
        const defaultEvs = [
          {
            id: 'ev-1',
            title: '5G Core Network Integration Blueprint',
            type: 'Project' as const,
            description: 'Architected and documented active-active CU-DU signaling paths for Tier-1 circle deployment.',
            urlOrFile: 'https://github.com/reliance-jio/ran-integration-blueprint',
            date: '2026-08-10',
            status: 'Verified' as const
          }
        ];
        setSubmittedEvidences(defaultEvs);
        localStorage.setItem(`jio_skill_evidence_${skillId}`, JSON.stringify(defaultEvs));
      }
    }
  }, [skillId]);

  const saveSkillData = (updatedSkill: SkillDetailedInfo) => {
    setSkill(updatedSkill);
    if (skillId) {
      localStorage.setItem(`jio_skill_detail_${skillId}`, JSON.stringify(updatedSkill));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStartAssessmentClick = () => {
    setActiveTab('assessment');
    setTimeout(() => {
      if (assessmentSectionRef.current) {
        assessmentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-r-blue border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading skill intelligence...</p>
      </div>
    );
  }

  // Filter YouTube courses
  const filteredCourses = skill.youtubeCourses.filter(course => {
    if (videoFilter === 'All') return true;
    return course.categoryTag.toLowerCase().includes(videoFilter.toLowerCase()) ||
           course.difficulty.toLowerCase() === videoFilter.toLowerCase();
  });

  // Calculate scores and progress
  const completedSections = skill.assessmentJourney.sections.filter(s => s.status === 'completed' && s.score !== undefined);
  const avgScore = completedSections.length > 0 
    ? Math.round(completedSections.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSections.length) 
    : 88; // Default initial verified avg score

  // Check if skill is role-mapped (User is Sandeep Gupta, Sr Platform Architect. Skills L3/L4 with sk-* ids are mapped)
  const isRoleMapped = skillId?.startsWith('sk-') || ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7', 'sk-8', 'sk-9'].includes(skillId || '');

  // Dynamic unfinished check
  const hasUnfinishedAssessment = skill.assessmentJourney.sections.some(sec => sec.status === 'in_progress');

  // Triggering the custom Quiz Player for a Section
  const handleOpenQuiz = (section: any) => {
    if (section.status === 'locked') {
      showToast("This milestone section is currently locked. Complete previous sections to unlock.");
      return;
    }
    setActiveQuizSection(section);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setShowLevelUpCelebration(false);
    setShowExplanation(false);
  };

  // Close Quiz
  const handleCloseQuiz = (completed: boolean) => {
    setActiveQuizSection(null);
    if (!completed) {
      showToast("Assessment paused. Your progress has been saved.");
    }
  };

  // Answer selection handler
  const handleSelectAnswer = (choice: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: choice
    }));
    setShowExplanation(true);
  };

  // Submit Section Quiz
  const handleSubmitQuiz = () => {
    const questions = getQuizQuestions(skill.id, activeQuizSection.sectionNumber, skill.name, activeQuizSection.sectionTitle);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setQuizScore(finalScore);
    setQuizFinished(true);

    const passingScoreNum = parseInt(activeQuizSection.assessments?.[0]?.passingScore || '85%');
    const passed = finalScore >= passingScoreNum;

    // Prepare updated sections
    let updatedSections = skill.assessmentJourney.sections.map(sec => {
      if (sec.sectionNumber === activeQuizSection.sectionNumber) {
        return {
          ...sec,
          status: (passed ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'available' | 'locked',
          score: finalScore
        };
      }
      return sec;
    });

    // Unlock next section if passed
    if (passed) {
      updatedSections = updatedSections.map(sec => {
        if (sec.sectionNumber === activeQuizSection.sectionNumber + 1 && sec.status === 'locked') {
          return {
            ...sec,
            status: 'available' as const
          };
        }
        return sec;
      });
    }

    // Calculate completed assessments count based on passed sections
    const completedSecsCount = updatedSections.filter(s => s.status === 'completed').length;

    // Level Promotion Logic
    let newLevel = skill.currentLevel;
    let newStatus = skill.status;
    let promoCelebration = false;

    if (passed) {
      if (activeQuizSection.sectionNumber === 3 && skill.currentLevel < 3) {
        newLevel = 3;
        newStatus = 'Met';
        promoCelebration = true;
      } else if (activeQuizSection.sectionNumber === 4 && skill.currentLevel < 4) {
        newLevel = 4;
        newStatus = 'Met';
        promoCelebration = true;
      }
    }

    const updatedSkill: SkillDetailedInfo = {
      ...skill,
      currentLevel: newLevel,
      status: newStatus,
      assessmentJourney: {
        ...skill.assessmentJourney,
        completedAssessments: completedSecsCount * 2, // Map to equivalent original count
        sections: updatedSections
      }
    };

    saveSkillData(updatedSkill);
    setShowLevelUpCelebration(promoCelebration);
  };

  // Add evidence handlers
  const handleAddEvidence = (title: string, type: 'Certificate' | 'Project' | 'Document' | 'Link', desc: string, url: string) => {
    if (!title.trim()) {
      showToast("Please provide an evidence title.");
      return;
    }
    const newEvidence = {
      id: `ev-${Date.now()}`,
      title,
      type,
      description: desc,
      urlOrFile: url || 'Uploaded Verification Document',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review' as const
    };
    const updated = [newEvidence, ...submittedEvidences];
    setSubmittedEvidences(updated);
    if (skillId) {
      localStorage.setItem(`jio_skill_evidence_${skillId}`, JSON.stringify(updated));
    }
    showToast(`Successfully submitted "${title}" for validation`);
  };

  const handleDeleteEvidence = (id: string, title: string) => {
    const updated = submittedEvidences.filter(ev => ev.id !== id);
    setSubmittedEvidences(updated);
    if (skillId) {
      localStorage.setItem(`jio_skill_evidence_${skillId}`, JSON.stringify(updated));
    }
    showToast(`Removed evidence "${title}"`);
  };

  // File drag & drop logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      simulateFileUpload(file.name);
    }
  };

  const simulateFileUpload = (fileName: string) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            handleAddEvidence(
              `Document: ${fileName}`,
              'Document',
              `Verification file: ${fileName}`,
              `local-file://${fileName}`
            );
          }, 350);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  // Custom Quiz Player Screen
  if (activeQuizSection) {
    const questions = getQuizQuestions(skill.id, activeQuizSection.sectionNumber, skill.name, activeQuizSection.sectionTitle);
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;
    const currentSelection = selectedAnswers[currentQuestionIndex];
    const isCorrectChoice = currentSelection === currentQuestion.correctAnswer;
    const passingScoreNum = parseInt(activeQuizSection.assessments?.[0]?.passingScore || '85%');

    return (
      <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
        {/* Quiz Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCloseQuiz(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-600 border border-transparent hover:border-slate-200"
              title="Pause and Exit"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-r-blue flex items-center gap-1">
                <AwardIcon className="w-3 h-3 text-r-blue animate-pulse" />
                {skill.name} • Section {activeQuizSection.sectionNumber} Assessment
              </span>
              <h1 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 truncate max-w-sm sm:max-w-md">
                {activeQuizSection.sectionTitle}
              </h1>
            </div>
          </div>
          
          <button
            onClick={() => handleCloseQuiz(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all border border-slate-200 cursor-pointer"
          >
            Save & Exit
          </button>
        </header>

        {/* Quiz Progress & Timer Area */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span>Progress:</span>
            <span className="text-r-blue font-extrabold">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="w-28 sm:w-40 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-r-blue h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span>Estimated Duration: {activeQuizSection.estimatedTime}</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700">Passing Score: {passingScoreNum}%</span>
          </div>
        </div>

        {/* Main Quiz Player Stage */}
        <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
            
            {!quizFinished ? (
              // Active Test Interface
              <div className="space-y-6">
                
                {/* Question Box */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    Sandeep Gupta • Practicum Attempt
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Choices */}
                <div className="grid grid-cols-1 gap-3.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = currentSelection === option;
                    const isCorrect = option === currentQuestion.correctAnswer;
                    
                    let choiceStyle = "border-slate-200 bg-white hover:bg-slate-50";
                    if (isAnswerSelected) {
                      if (isSelected) {
                        choiceStyle = isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                          : "border-rose-500 bg-rose-50 text-rose-950";
                      } else if (isCorrect && showExplanation) {
                        choiceStyle = "border-emerald-300 bg-emerald-5/40 text-emerald-900";
                      } else {
                        choiceStyle = "border-slate-200 bg-slate-50/50 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSelected}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-3 transition-all ${
                          !isAnswerSelected ? 'cursor-pointer active:scale-99' : 'cursor-default'
                        } ${choiceStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              : isAnswerSelected && isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>

                        {isAnswerSelected && isSelected && (
                          isCorrect ? (
                            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 text-[10px] font-extrabold flex-shrink-0">✕</div>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Context Panel */}
                {isAnswerSelected && showExplanation && (
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border leading-relaxed animate-fade-in space-y-1.5 ${
                    isCorrectChoice 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <span className="font-extrabold uppercase tracking-wide flex items-center gap-1">
                      {isCorrectChoice ? "✓ Correct Answer!" : "✕ Incorrect Answer"}
                    </span>
                    <p className="opacity-90">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      setCurrentQuestionIndex(prev => prev - 1);
                      setShowExplanation(true);
                    }}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ← Previous Q
                  </button>

                  {isAnswerSelected && (
                    currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev + 1);
                          setShowExplanation(selectedAnswers[currentQuestionIndex + 1] !== undefined);
                        }}
                        className="px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-r-blue hover:bg-r-blue-dark text-white rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ZapIcon className="w-3.5 h-3.5 fill-white" />
                        <span>Finish & Submit</span>
                      </button>
                    )
                  )}
                </div>

              </div>
            ) : (
              // Quiz Score Results Summary View
              <div className="text-center space-y-6 py-4 animate-fade-in">
                
                {/* Result Icon */}
                <div className="flex justify-center">
                  {quizScore >= passingScoreNum ? (
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 relative animate-bounce">
                      <CheckCircleIcon className="w-12 h-12" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping opacity-25" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 animate-pulse border border-rose-300">
                      <span className="text-3xl font-black">!</span>
                    </div>
                  )}
                </div>

                {/* Score Header */}
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                    {quizScore >= passingScoreNum ? "Milestone Passed!" : "Validation Required"}
                  </h2>
                  <p className="text-sm text-slate-600 font-medium">
                    {quizScore >= passingScoreNum 
                      ? "Excellent work! You demonstrated comprehensive mastery of this section's core competencies."
                      : `The passing score threshold is ${passingScoreNum}%. Review suggested courses and retake when ready.`
                    }
                  </p>
                </div>

                {/* Metrics Breakdown Box */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Your Score</span>
                    <strong className={`text-xl sm:text-2xl font-black ${quizScore >= passingScoreNum ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {quizScore}%
                    </strong>
                  </div>
                  <div className="text-center border-x border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Questions</span>
                    <strong className="text-xl sm:text-2xl font-black text-slate-800">
                      {questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length} / {questions.length}
                    </strong>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Result</span>
                    <strong className={`text-xs sm:text-sm font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${
                      quizScore >= passingScoreNum 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {quizScore >= passingScoreNum ? "PASSED" : "FAILED"}
                    </strong>
                  </div>
                </div>

                {/* Promotion / Level Up Celebratory Card */}
                {quizScore >= passingScoreNum && showLevelUpCelebration && (
                  <div className="bg-amber-50/50 rounded-2xl border border-amber-300 p-5 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-amber-800">
                      <SparklesIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                      <h4 className="font-heading font-extrabold text-base">Grade Level Advanced!</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Congratulations! Your competency for <strong>{skill.name}</strong> is promoted to <strong>L{skill.currentLevel} ({skill.levels.find(l => l.level === skill.currentLevel)?.name})</strong>! Your Gap Status is now successfully updated to <strong>Met</strong>.
                    </p>
                  </div>
                )}

                {/* Return Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <button
                    onClick={() => handleCloseQuiz(true)}
                    className="px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-xs cursor-pointer w-full sm:w-auto"
                  >
                    Save & Finish
                  </button>

                  {quizScore < passingScoreNum && (
                    <button
                      onClick={() => handleOpenQuiz(activeQuizSection)}
                      className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-xs cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1"
                    >
                      <ZapIcon className="w-3.5 h-3.5 fill-white" />
                      <span>Retake Now</span>
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-fade-in text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Skill Header - Light Sky Blue 80% Opacity */}
      <div className="bg-sky-100/80 border-b border-sky-200/80 text-slate-900 pt-10 sm:pt-14 pb-0 px-4 sm:px-6 lg:px-8 shadow-xs relative overflow-hidden backdrop-blur-xs">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-7">
          
          {/* Back Button */}
          <div>
            <button
              onClick={() => navigate('/skills')}
              className="text-slate-800 hover:text-slate-950 transition-all inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:underline"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 text-slate-800" />
              <span>Back to My Skills</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Skill Titles & Badges */}
            <div className="space-y-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-950 tracking-tight">
                  {skill.name}
                </h1>
                {isRoleMapped && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 whitespace-nowrap shadow-3xs uppercase tracking-wider">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Role Relevant
                  </span>
                )}
              </div>

              {/* Skill Type, Criticality, Skill Group under the skill name - Clean text only, not colored */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-bold text-slate-600">
                <span>Skill Type: {skill.type}</span>
                <span className="text-slate-300">|</span>
                <span>Criticality: {skill.criticality}</span>
                <span className="text-slate-300">|</span>
                <span>Skill Group: {skill.category}</span>
                {skill.staleText && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-800 font-extrabold">{skill.staleText}</span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed font-normal my-2">
                {skill.skillMeaning}
              </p>

              {/* Progress & Level Counters - Clean text only, not colored */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3.5 text-sm text-slate-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Current Status:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    L{skill.currentLevel} ({skill.levels.find(l => l.level === skill.currentLevel)?.name || 'Practitioner'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Target Required:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    L{skill.targetLevel} ({skill.levels.find(l => l.level === skill.targetLevel)?.name || 'Practitioner'})
                  </span>
                </div>

                {/* Requirement 2: Gap Status met/not met to have high-contrast color coding */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Gap Status:</span>
                  {skill.status.toLowerCase() === 'met' || skill.currentLevel >= skill.targetLevel ? (
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1">
                      ✓ Met
                    </span>
                  ) : (
                    <span className="font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1">
                      ⚠ Not Met ({skill.status})
                    </span>
                  )}
                </div>

                {skill.targetLevel > skill.currentLevel && (
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-700 uppercase">
                    Gap: L{skill.currentLevel} → L{skill.targetLevel} | {skill.targetLevel - skill.currentLevel} level gap
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Action CTA ONLY (Removed Evidence panel as requested!) */}
            <div className="flex flex-col gap-3 max-w-sm w-full flex-shrink-0">
              
              {/* Primary Action Card: CONTEXTUAL ASSESSMENT CTA */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-sky-300/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-r-blue flex items-center gap-1">
                    <AwardIcon className="w-3.5 h-3.5 text-r-blue" />
                    Proficiency Validation
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    {completedSections.length} of {skill.assessmentJourney.sections.length} sections completed
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading leading-tight">
                    Validate & Advance Level
                  </h3>
                </div>

                {/* Step Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Level Progress</span>
                    <span>{Math.round((completedSections.length / skill.assessmentJourney.sections.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-r-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${(completedSections.length / skill.assessmentJourney.sections.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Main Contextual Assessment CTA */}
                <button
                  onClick={handleStartAssessmentClick}
                  className="w-full py-2.5 px-4 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-transparent active:scale-98"
                >
                  <ZapIcon className="w-3.5 h-3.5 fill-white animate-pulse" />
                  <span>
                    {hasUnfinishedAssessment ? "Continue Assessment" : "Start Skill Assessment"}
                  </span>
                  <span className="font-bold">→</span>
                </button>
              </div>

            </div>

          </div>

          {/* Navigation Sub-Menu Tabs - Renamed and Added Skill Evidence Tab */}
          <div className="flex items-center gap-4 mt-12 border-b border-sky-300/60 overflow-x-auto pb-0">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'courses'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              <span>Suggested Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'overview'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              Skill Overview
            </button>

            {/* Requirement 5: Role certified sub menu title rename to Assessment journey */}
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'assessment'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              <span>Assessment journey</span>
            </button>

            {/* Requirement 3: Skill Evidence sub-menu tab */}
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'evidence'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4 text-slate-500" />
              <span>Skill Evidence</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ========================================================= */}
        {/* SUB MENU 1: SKILL OVERVIEW                                */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <section className="space-y-6 animate-fade-in">
            
            {/* Requirement 4: Rename header to Skill description */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <InfoIcon className="w-5 h-5 text-r-blue" />
                <h2 className="text-xl font-heading font-extrabold text-gray-900">
                  Skill description
                </h2>
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>{skill.fullDescription}</p>
              </div>
            </div>

            {/* Proficiency Levels */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-heading font-extrabold text-gray-900">
                    Proficiency Levels
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Clear operational capabilities and typical benchmarks for each grade level.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-bold text-r-blue">
                    <span className="w-3 h-3 bg-r-blue rounded-full" />
                    Current (L{skill.currentLevel})
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
                    <span className="w-3 h-3 bg-amber-500 rounded-full" />
                    Target (L{skill.targetLevel})
                  </span>
                </div>
              </div>

              {/* 4-Column Grid for Levels */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {skill.levels.map((lvl) => {
                  const isCurrent = lvl.level === skill.currentLevel;
                  const isTarget = lvl.level === skill.targetLevel;

                  return (
                    <div
                      key={lvl.level}
                      className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                        isCurrent
                          ? 'bg-blue-50/70 border-r-blue ring-2 ring-blue-400/40 shadow-xs'
                          : isTarget
                          ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Level Tag & Status Badges */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center ${
                            isCurrent
                              ? 'bg-r-blue text-white'
                              : isTarget
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            L{lvl.level}
                          </span>

                          <div className="flex flex-wrap gap-1 justify-end">
                            {isCurrent && (
                              <span className="px-2.5 py-0.5 bg-r-blue text-white text-xs font-bold rounded-full">
                                Current
                              </span>
                            )}
                            {isTarget && (
                              <span className="px-2.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                                Target
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-gray-900">
                          {lvl.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                          {lvl.shortDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related Skills */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-lg font-heading font-extrabold text-gray-900">
                  Related Skills
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Click on any related skill to view its description, level benchmarks, and learning path.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {skill.relatedSkills.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => navigate(`/skills/learn/${rel.id}`)}
                    className="px-4 py-2 bg-slate-50 hover:bg-sky-50 hover:text-r-blue border border-gray-200 hover:border-sky-300 font-bold text-xs sm:text-sm rounded-full transition-all cursor-pointer"
                  >
                    {rel.name}
                  </button>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* SUB MENU 2: ASSESSMENT JOURNEY (Requirement 6 & 8)        */}
        {/* ========================================================= */}
        {activeTab === 'assessment' && (
          <section ref={assessmentSectionRef} className="space-y-6 animate-fade-in">
            
            {/* Context Header */}
            <div className="bg-slate-100 text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-3 py-1 font-extrabold rounded-lg text-xs uppercase tracking-wider border ${
                    skill.currentLevel >= skill.targetLevel
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    {skill.currentLevel >= skill.targetLevel ? "Skill Certified" : "Assessment Journey"}
                  </span>
                  <span className="text-sm text-slate-600 font-semibold">
                    {skill.assessmentJourney.sections.length} Milestone Sections • Completed {completedSections.length} of {skill.assessmentJourney.sections.length}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-950">
                  {skill.currentLevel >= skill.targetLevel ? "Certified Skill Verification" : "Skill Validation & Mastery Pathway"}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 mt-1 max-w-2xl leading-relaxed font-normal">
                  {skill.currentLevel >= skill.targetLevel 
                    ? "Congratulations! You have successfully certified your competency level. Explore your verified evidence and score reports below."
                    : "Complete the stage-wise modular assessments to certify your practical proficiency and submit verified score reports for manager sign-off."
                  }
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 text-center border border-slate-300 shadow-2xs flex-shrink-0 min-w-[190px]">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-0.5 font-sans">Pass Score Threshold</span>
                <strong className="text-2xl font-black text-amber-700">
                  {skill.assessmentJourney.targetScore.match(/\d+%/)?.[0] || '85%'}
                </strong>
              </div>
            </div>

            {/* Sections Stack: Each Section is now itself a Single Assessment Card */}
            <div className="space-y-4">
              {skill.assessmentJourney.sections.map((sec) => {
                // Determine lock state dynamically: section 4 is locked if level < 3
                const isSectionLocked = sec.status === 'locked' || (sec.sectionNumber === 4 && skill.currentLevel < 3);
                const hasScore = sec.score !== undefined;
                const passingScore = sec.assessments?.[0]?.passingScore || '85%';

                return (
                  <div 
                    key={sec.sectionNumber} 
                    className={`bg-white rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                      isSectionLocked
                        ? 'border-slate-200 opacity-60 bg-slate-50/50'
                        : sec.status === 'completed'
                        ? 'border-emerald-200 hover:shadow-xs hover:border-emerald-300'
                        : sec.status === 'in_progress'
                        ? 'border-blue-300 ring-1 ring-blue-300/50'
                        : 'border-slate-200 hover:shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {/* Left: Title and Subtitle */}
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0 ${
                        isSectionLocked
                          ? 'bg-slate-200 text-slate-400 border border-slate-300'
                          : sec.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : sec.status === 'in_progress'
                          ? 'bg-r-blue text-white animate-pulse'
                          : 'bg-slate-800 text-white'
                      }`}>
                        {isSectionLocked ? (
                          <LockIcon className="w-4 h-4 text-slate-400" />
                        ) : sec.status === 'completed' ? (
                          <CheckIcon className="w-5 h-5 text-white" />
                        ) : (
                          <span>{sec.sectionNumber}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
                            {sec.sectionTitle}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isSectionLocked
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : sec.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : sec.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {isSectionLocked ? 'Locked' : sec.status === 'completed' ? 'Passed' : sec.status === 'in_progress' ? 'In Progress' : 'Ready'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
                          {isSectionLocked ? "Complete previous sections to unlock this modular capability evaluation." : sec.sectionSubtitle}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Key Parameters Grid (Time, Pass, Score) */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-shrink-0">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 block font-sans">Est. Duration</span>
                        <span className="flex items-center gap-1 text-slate-800">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                          {sec.estimatedTime}
                        </span>
                      </div>

                      <div className="h-6 w-px bg-slate-200" />

                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 block font-sans">Pass Score</span>
                        <span className="text-amber-800">{passingScore}</span>
                      </div>

                      <div className="h-6 w-px bg-slate-200" />

                      <div className="space-y-0.5 min-w-[70px]">
                        <span className="text-[9px] uppercase text-slate-400 block font-sans">My Score</span>
                        {hasScore ? (
                          <span className={`text-sm ${parseInt(sec.score?.toString() || '0') >= parseInt(passingScore) ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {sec.score}%
                          </span>
                        ) : sec.status === 'in_progress' ? (
                          <span className="text-blue-600 italic">In Progress</span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex-shrink-0 self-end md:self-center">
                      {isSectionLocked ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                        >
                          <LockIcon className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </button>
                      ) : sec.status === 'completed' ? (
                        <button
                          onClick={() => handleOpenQuiz(sec)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs"
                        >
                          Retake Assessment
                        </button>
                      ) : sec.status === 'in_progress' ? (
                        <button
                          onClick={() => handleOpenQuiz(sec)}
                          className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-97 border border-transparent"
                        >
                          <PlayIcon className="w-3.5 h-3.5 fill-white" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenQuiz(sec)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-97 border border-transparent"
                        >
                          <ZapIcon className="w-3.5 h-3.5 fill-white" />
                          <span>Start Assessment</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* SUB MENU 3: SUGGESTED COURSES                              */}
        {/* ========================================================= */}
        {activeTab === 'courses' && (
          <section className="space-y-6 animate-fade-in">
            
            <div className="space-y-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900">
                  Suggested Courses
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Curated technical deep dives, masterclasses, and video lectures to level up in {skill.name}.
                </p>
              </div>

              {/* Proficiency filters */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setVideoFilter(chip)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      videoFilter === chip
                        ? 'bg-gray-950 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Tiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col space-y-2.5 group cursor-pointer"
                  onClick={() => navigate(`/course/${video.id}`)}
                >
                  {/* Thumbnail with ONLINE badge */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#0d9488] text-white text-[10px] font-extrabold rounded uppercase tracking-wider shadow-xs">
                      ONLINE
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>{video.channelName}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText?.(window.location.href);
                        showToast("Course share link copied to clipboard!");
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                      title="Share Course"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Bold Title */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-r-blue transition-colors px-1 leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              ))}
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* SUB MENU 4: SKILL EVIDENCE                                */}
        {/* ========================================================= */}
        {activeTab === 'evidence' && (
          <section className="space-y-6 animate-fade-in">
            
            <div className="pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900">
                  Skill Evidence & Credentials
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Official endorsements, platform verifications, and custom certificates uploaded to validate your {skill.name} level.
                </p>
              </div>

              {/* + Add Evidence button at the top header */}
              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-4 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-98"
              >
                <UploadIcon className="w-4 h-4" />
                <span>Add Evidence</span>
              </button>
            </div>

            {/* Interactive State Simulator Bar for Demo Purposes */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-r-blue animate-pulse"></span>
                  Interactive Credential Toggles (Demo present vs. not-present states):
                </span>
                <p className="text-slate-500 font-medium">Toggle these to test what is shown when official endorsements or certificates are not present.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasManagerEndorsement}
                    onChange={(e) => setHasManagerEndorsement(e.target.checked)}
                    className="w-4 h-4 text-r-blue rounded-sm border-slate-300 focus:ring-r-blue cursor-pointer"
                  />
                  <span>Manager Endorsement</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPlatformCertification}
                    onChange={(e) => setHasPlatformCertification(e.target.checked)}
                    className="w-4 h-4 text-r-blue rounded-sm border-slate-300 focus:ring-r-blue cursor-pointer"
                  />
                  <span>Platform Certification</span>
                </label>
              </div>
            </div>

            {/* Grid of Verified Credentials (Manager Endorsement & Platform Certification) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Manager Endorsement (Conditional based on simulator state) */}
              {hasManagerEndorsement ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-start gap-4 transition-all hover:shadow-sm">
                  <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-slate-900 text-base">Manager Endorsement</h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] border border-emerald-200 uppercase tracking-wide">
                        Endorsed
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      "Sandeep Gupta regularly demonstrates active Practitioner capabilities in RAN base station hardware deployment, commissioning scripts, and dual connectivity synchronization."
                    </p>
                    <div className="text-xs text-slate-400 font-bold pt-1">
                      Verified by Rajesh Sharma (VP Engineering) • 15 Aug 2026
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state when Manager Endorsement is not present */
                <div className="bg-slate-50/80 border border-slate-200 border-dashed rounded-3xl p-6 flex items-start gap-4 transition-all">
                  <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-slate-500 text-base">Manager Endorsement</h3>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 font-bold rounded-full text-[10px] border border-slate-300 uppercase tracking-wide">
                        Not Present
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      No manager endorsement is currently issued for this skill on your profile. Work with your manager to verify your hands-on production competency.
                    </p>
                    <button 
                      onClick={() => showToast("Endorsement request sent to Rajesh Sharma")}
                      className="text-xs font-extrabold text-r-blue hover:underline hover:text-r-blue-dark inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      Request Manager Endorsement &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: Platform Assessment Certificate (Conditional based on simulator state) */}
              {hasPlatformCertification ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-start gap-4 transition-all hover:shadow-sm">
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-r-blue border border-blue-100 flex-shrink-0">
                    <AwardIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-slate-900 text-base">Platform Certification</h3>
                      <span className={`px-2.5 py-0.5 font-bold rounded-full text-[10px] border uppercase tracking-wide ${
                        skill.currentLevel >= skill.targetLevel
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {skill.currentLevel >= skill.targetLevel ? "Certified L3 Practitioner" : "In Progress"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      Verified score report and evaluation records generated by proctored diagnostic testing on virtual environments.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold pt-1">
                      <span>Score: {avgScore}% Average</span>
                      <span>•</span>
                      <span>{completedSections.length} Sections Passed</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state when Platform Certification is not present */
                <div className="bg-slate-50/80 border border-slate-200 border-dashed rounded-3xl p-6 flex items-start gap-4 transition-all">
                  <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                    <AwardIcon className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-slate-500 text-base">Platform Certification</h3>
                      <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 font-bold rounded-full text-[10px] border border-slate-300 uppercase tracking-wide">
                        Not Present
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      No official proctored platform certificate has been issued for this skill yet. Complete diagnostic test milestones to generate.
                    </p>
                    <button 
                      onClick={handleStartAssessmentClick}
                      className="text-xs font-extrabold text-r-blue hover:underline hover:text-r-blue-dark inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      Start Assessment Path &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Custom Submitted Evidence List - Beautiful full-width or large grid block */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-1.5">
                  <PaperclipIcon className="w-4 h-4 text-slate-600" />
                  Your Custom Submissions
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {submittedEvidences.length} Submissions
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-4">
                {submittedEvidences.length === 0 ? (
                  <div className="text-center py-12 space-y-2.5">
                    <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">No custom evidence files or links submitted yet.</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload certificates, links to repositories, or documentation reports to support your validation portfolio.</p>
                    <button
                      onClick={() => setIsEvidenceModalOpen(true)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer mt-2"
                    >
                      <UploadIcon className="w-3.5 h-3.5" />
                      Add First Evidence
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {submittedEvidences.map((ev) => (
                      <div key={ev.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                            {ev.type === 'Certificate' && <AwardIcon className="w-4 h-4 text-amber-600" />}
                            {ev.type === 'Project' && <ZapIcon className="w-4 h-4 text-r-blue" />}
                            {ev.type === 'Document' && <FileTextIcon className="w-4 h-4 text-emerald-600" />}
                            {ev.type === 'Link' && <LinkIcon className="w-4 h-4 text-indigo-600" />}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{ev.title}</h4>
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase">{ev.type}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                ev.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {ev.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{ev.description}</p>
                            
                            {ev.urlOrFile && (
                              <a 
                                href={ev.urlOrFile.startsWith('http') ? ev.urlOrFile : '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[11px] text-r-blue hover:text-r-blue-dark font-extrabold inline-flex items-center gap-1 hover:underline"
                              >
                                <span>{ev.urlOrFile}</span>
                                <ExternalLinkIcon className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteEvidence(ev.id, ev.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer flex-shrink-0"
                          title="Remove Evidence"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Submission Overlay Popup Modal (Requirement 5) */}
            {isEvidenceModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl max-w-lg w-full space-y-4 relative animate-scale-up">
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setIsEvidenceModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 cursor-pointer rounded-lg hover:bg-slate-50"
                  >
                    ✕
                  </button>

                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-slate-900 flex items-center gap-1.5">
                      <UploadIcon className="w-5 h-5 text-r-blue" />
                      Submit New Evidence
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload certificates, project links, or documents to verify your proficiency in {skill.name}.
                    </p>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Evidence Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. RAN Automation Script Suite" 
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-r-blue font-semibold text-slate-800"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Evidence Type *</label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value as any)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-r-blue font-semibold text-slate-800 bg-white"
                    >
                      <option value="Certificate">Certificate of Completion</option>
                      <option value="Project">Project Reference</option>
                      <option value="Document">Technical Document / Blueprint</option>
                      <option value="Link">Web Link / Repository</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Short Description</label>
                    <textarea
                      placeholder="Briefly describe what this evidence validates."
                      value={evidenceDesc}
                      onChange={(e) => setEvidenceDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-r-blue font-semibold text-slate-800 resize-none"
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">External URL / Reference Link</label>
                    <input 
                      type="text" 
                      placeholder="https://github.com/my-profile" 
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-r-blue font-semibold text-slate-800"
                    />
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Drag-and-drop File Upload Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Or upload file evidence</label>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer relative ${
                        isDragging 
                          ? 'border-r-blue bg-blue-50/50 scale-101' 
                          : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="file-evidence-modal" 
                        className="hidden" 
                        onChange={(e) => {
                          handleFileSelect(e);
                          // Close modal on complete
                          setTimeout(() => {
                            setIsEvidenceModalOpen(false);
                          }, 1000);
                        }} 
                        accept=".pdf,.png,.jpg,.zip,.doc,.docx"
                      />
                      <label htmlFor="file-evidence-modal" className="absolute inset-0 cursor-pointer w-full h-full" />
                      
                      <UploadIcon className="w-7 h-7 text-slate-400" />
                      
                      <div className="space-y-0.5 relative z-10 pointer-events-none">
                        <p className="text-xs font-bold text-slate-800">Drag & drop files here</p>
                        <p className="text-[10px] text-slate-400 font-bold">PDF, PNG, JPG, ZIP (max 10MB)</p>
                      </div>

                      <div className="text-[10px] font-black text-r-blue relative z-10 pointer-events-none">
                        or click to browse local files
                      </div>
                    </div>

                    {/* Progress feedback bar */}
                    {uploadProgress !== null && (
                      <div className="space-y-1 pt-1 animate-pulse">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Uploading validation file...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button Row */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEvidenceModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddEvidence(evidenceTitle, evidenceType, evidenceDesc, evidenceUrl);
                        // Clear form & close
                        setEvidenceTitle('');
                        setEvidenceDesc('');
                        setEvidenceUrl('');
                        setIsEvidenceModalOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-98"
                    >
                      Submit Proof
                    </button>
                  </div>

                </div>
              </div>
            )}

          </section>
        )}

      </div>

    </div>
  );
};

export default SkillDetailsPage;
