// pages/AddAdditionalSkillPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  AwardIcon, 
  UploadIcon, 
  FileTextIcon, 
  TrashIcon, 
  EditIcon, 
  PlusIcon, 
  CheckCircleIcon, 
  XIcon, 
  InfoIcon,
  SearchIcon,
  SparklesIcon,
  CheckIcon,
  ChevronRightIcon
} from '../components/Icons';
import { 
  AdditionalSkillItem, 
  EvidenceItem, 
  EvidenceType, 
  getAdditionalSkillById,
  saveOrUpdateAdditionalSkill
} from '../utils/skillsData';

// Official Internal Jio Enterprise Skills Catalog
export interface CatalogSkill {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
}

export const INTERNAL_SKILLS_CATALOG: CatalogSkill[] = [
  {
    id: 'cat-mkt-ops',
    name: 'Marketing Operations',
    type: 'Functional',
    criticality: 'High',
    description: 'Execution of campaign strategy, automated lead nurturing, marketing asset deployment, and performance attribution.'
  },
  {
    id: 'cat-mkt-anl',
    name: 'Marketing Analytics',
    type: 'Functional',
    criticality: 'High',
    description: 'Analytical dashboards, conversion rate optimization (CRO), multi-touch attribution, and customer lifetime value (LTV) models.'
  },
  {
    id: 'cat-soft-dev',
    name: 'Software Development',
    type: 'Technical',
    criticality: 'Critical',
    description: 'Design, write, test, and package robust software products. Mastering programming paradigms, algorithms, and microservice structures.'
  },
  {
    id: 'cat-dat-min',
    name: 'Data Mining',
    type: 'Technical',
    criticality: 'Medium',
    description: 'Knowledge discovery in large databases, pattern extraction, predictive modeling, and ETL pipeline data processing.'
  },
  {
    id: 'cat-sys-req',
    name: 'System Requirements',
    type: 'Technical',
    criticality: 'High',
    description: 'Elicitation of business rules, system constraints, functional blueprinting, UML documentation, and verification setups.'
  },
  {
    id: 'cat-k8s',
    name: 'Kubernetes & Cloud Native Systems',
    type: 'Technical',
    criticality: 'High',
    description: 'Container orchestration, Helm charts, ingress controllers, and Istio service mesh administration.'
  },
  {
    id: 'cat-aws',
    name: 'AWS Solutions Architecture',
    type: 'Technical',
    criticality: 'Critical',
    description: 'Well-Architected Framework design, multi-region failover, VPC peering, and serverless compute.'
  },
  {
    id: 'cat-5gc',
    name: '5G Core (5GC) Control Plane & Network Slicing',
    type: 'Domain',
    criticality: 'Critical',
    description: 'Service-Based Architecture (SBA), NSSF, AMF, SMF, UPF deployment, and dynamic QoS slice routing.'
  },
  {
    id: 'cat-oss-bss',
    name: 'Telecom OSS/BSS Integration Architecture',
    type: 'Domain',
    criticality: 'High',
    description: 'TM Forum Open Digital Architecture (ODA), billing mediation, inventory sync, and order orchestration.'
  },
  {
    id: 'cat-distributed',
    name: 'Distributed Systems & Microservices',
    type: 'Technical',
    criticality: 'High',
    description: 'gRPC IPC, distributed consensus, circuit breaking, event sourcing, and high-throughput data pipelines.'
  },
  {
    id: 'cat-kafka',
    name: 'Kafka Real-Time Event Streaming & Pipeline Design',
    type: 'Technical',
    criticality: 'Critical',
    description: 'Partition strategy, consumer group tuning, Schema Registry governance, and Exactly-Once Semantics (EOS).'
  },
  {
    id: 'cat-devsecops',
    name: 'DevSecOps & Zero-Trust Security Pipeline',
    type: 'Technical',
    criticality: 'High',
    description: 'Automated SAST/DAST gating, container vulnerability scanning, HashiCorp Vault secrets, and mTLS.'
  },
  {
    id: 'cat-genai',
    name: 'Generative AI & LLM Systems Engineering',
    type: 'Technical',
    criticality: 'Critical',
    description: 'RAG pipeline design, vector embedding databases (Qdrant/Milvus), prompt evaluation, and fine-tuning.'
  },
  {
    id: 'cat-db-rel',
    name: 'Database Reliability & Distributed Postgres/CockroachDB',
    type: 'Technical',
    criticality: 'High',
    description: 'Distributed transaction management, write replication lag mitigation, and automated failovers.'
  },
  {
    id: 'cat-agile',
    name: 'Agile Project Management & Scrum Mastership',
    type: 'Functional',
    criticality: 'Medium',
    description: 'Sprint planning, velocity forecasting, backlog grooming, cross-squad dependency management, and retro governance.'
  },
  {
    id: 'cat-prod-strat',
    name: 'Product Management & Roadmap Strategy',
    type: 'Functional',
    criticality: 'High',
    description: 'PRD synthesis, market telemetry analysis, feature prioritization matrix, and enterprise stakeholder alignment.'
  },
  {
    id: 'cat-finops',
    name: 'Financial Governance & Cloud FinOps Optimization',
    type: 'Functional',
    criticality: 'Medium',
    description: 'Reserved instance planning, spot instance fleets, cost allocation tagging, and cloud ROI auditing.'
  },
  {
    id: 'cat-mentorship',
    name: 'Cross-Functional Team Mentorship & Leadership',
    type: 'Behavioral',
    criticality: 'High',
    description: 'Technical coaching, 1-on-1 career growth planning, junior engineer onboarding, and psychological safety.'
  },
  {
    id: 'cat-design-thinking',
    name: 'Design Thinking & Human-Centered UX Systems',
    type: 'Behavioral',
    criticality: 'Medium',
    description: 'User journey mapping, design sprint facilitation, rapid Figma prototyping, and usability heuristics.'
  },
  {
    id: 'cat-exec-comm',
    name: 'Executive Stakeholder Communication & Negotiation',
    type: 'Behavioral',
    criticality: 'High',
    description: 'Technical-to-executive translation, milestone risk reporting, steering committee presentations, and consensus.'
  }
];

const PROFICIENCY_LEVELS = [
  { level: 1, name: 'Level 1: Awareness', desc: 'Basic conceptual understanding of principles, tools, and standard workflows.' },
  { level: 2, name: 'Level 2: Working', desc: 'Can independently deliver tasks, troubleshoot standard issues, and collaborate.' },
  { level: 3, name: 'Level 3: Practitioner', desc: 'Designs end-to-end solutions, handles edge cases, and mentors team members.' },
  { level: 4, name: 'Level 4: Expert / Lead', desc: 'Enterprise subject matter expert; sets architecture standards and drives strategic direction.' },
];

const SUGGESTED_SKILLS_DATA = [
  { id: 'cat-mkt-ops', name: 'Marketing Operations' },
  { id: 'cat-mkt-anl', name: 'Marketing Analytics' },
  { id: 'cat-soft-dev', name: 'Software Development' },
  { id: 'cat-dat-min', name: 'Data Mining' },
  { id: 'cat-sys-req', name: 'System Requirements' }
];

interface AddAdditionalSkillPageProps {
  isEdit?: boolean;
}

const AddAdditionalSkillPage: React.FC<AddAdditionalSkillPageProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // URL State
  const skillIdFromUrl = params.skillId || searchParams.get('id') || '';
  const isEditing = isEdit || Boolean(skillIdFromUrl);

  // Toast / Form State
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // ----------------------------------------------------
  // SINGLE EDIT MODE STATES (Preserves Edit Screen)
  // ----------------------------------------------------
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillType, setEditSkillType] = useState<'Technical' | 'Functional' | 'Behavioral' | 'Domain'>('Technical');
  const [editCriticality, setEditCriticality] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [editProfLevel, setEditProfLevel] = useState<number>(3);
  const [editEvidences, setEditEvidences] = useState<EvidenceItem[]>([]);
  const [editNotes, setEditNotes] = useState('');
  
  // Single Proof Form fields
  const [isEditEvidenceEditorOpen, setIsEditEvidenceEditorOpen] = useState(false);
  const [editingEvidenceIndex, setEditingEvidenceIndex] = useState<number | null>(null);
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState<EvidenceType>('certificate');
  const [evFileName, setEvFileName] = useState('');
  const [evDescription, setEvDescription] = useState('');

  // ----------------------------------------------------
  // MULTI-STEP WIZARD STATES (ADD SKILL FLOW)
  // ----------------------------------------------------
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedSkills, setSelectedSkills] = useState<CatalogSkill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestedContainer, setShowSuggestedContainer] = useState(true);

  // Store for each selected skill (Key: CatalogSkill.id)
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [skillEvidencesMap, setSkillEvidencesMap] = useState<Record<string, EvidenceItem[]>>({});
  const [skillApplications, setSkillApplications] = useState<Record<string, string>>({});

  // Sub-modal for adding evidence to a specific skill inside Wizard Step 3
  const [activeEvidenceSkillId, setActiveEvidenceSkillId] = useState<string | null>(null);
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null);

  // Load skill details on mount if editing
  useEffect(() => {
    if (isEditing && skillIdFromUrl) {
      const existing = getAdditionalSkillById(skillIdFromUrl);
      if (existing) {
        setEditSkillName(existing.name);
        setEditSkillType(existing.type);
        setEditCriticality(existing.criticality);
        setEditProfLevel(existing.proficiencyLevel || 3);
        setEditEvidences(existing.evidences || []);
        setEditNotes(existing.notes || '');
      }
    }
  }, [isEditing, skillIdFromUrl]);

  // Handle click on suggestions
  const handleAddSuggestedSkill = (suggested: { id: string; name: string }) => {
    if (selectedSkills.length >= 5) {
      alert('Maximum of 5 skills can be selected at a time.');
      return;
    }
    // Find the corresponding full CatalogSkill object
    const fullSkill = INTERNAL_SKILLS_CATALOG.find(s => s.id === suggested.id) || {
      id: suggested.id,
      name: suggested.name,
      type: 'Technical',
      criticality: 'High',
      description: 'Internal enterprise competency'
    } as CatalogSkill;

    if (!selectedSkills.some(s => s.id === fullSkill.id)) {
      const updated = [...selectedSkills, fullSkill];
      setSelectedSkills(updated);
      // Pre-fill default values
      setSkillLevels(prev => ({ ...prev, [fullSkill.id]: 3 }));
      setSkillApplications(prev => ({ ...prev, [fullSkill.id]: '' }));
      
      // Auto pre-populate a default certificate matching the name
      const defaultEvidence: EvidenceItem = {
        id: `ev-def-${Date.now()}-${fullSkill.id}`,
        title: `Official Endorsement in ${fullSkill.name}`,
        type: 'certificate',
        fileName: `${fullSkill.name.replace(/\s+/g, '_')}_Certificate.pdf`,
        fileType: 'pdf',
        fileSize: '1.4 MB',
        description: 'Completed corporate enablement path and verified competency standards.',
        addedDate: 'Today',
        verificationStatus: 'Pending'
      };
      setSkillEvidencesMap(prev => ({ ...prev, [fullSkill.id]: [defaultEvidence] }));
    }
  };

  const handleRemoveSelectedSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  // Searching internal catalog
  const filteredCatalogOptions = INTERNAL_SKILLS_CATALOG.filter(option => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return false;
    return option.name.toLowerCase().includes(term) && !selectedSkills.some(s => s.id === option.id);
  });

  const handleAddSearchSkill = (skill: CatalogSkill) => {
    if (selectedSkills.length >= 5) {
      alert('Maximum of 5 skills can be selected at a time.');
      return;
    }
    if (!selectedSkills.some(s => s.id === skill.id)) {
      const updated = [...selectedSkills, skill];
      setSelectedSkills(updated);
      setSkillLevels(prev => ({ ...prev, [skill.id]: 3 }));
      setSkillApplications(prev => ({ ...prev, [skill.id]: '' }));
      
      const defaultEvidence: EvidenceItem = {
        id: `ev-def-${Date.now()}-${skill.id}`,
        title: `Official Endorsement in ${skill.name}`,
        type: 'certificate',
        fileName: `${skill.name.replace(/\s+/g, '_')}_Certificate.pdf`,
        fileType: 'pdf',
        fileSize: '1.4 MB',
        description: 'Completed corporate enablement path and verified competency standards.',
        addedDate: 'Today',
        verificationStatus: 'Pending'
      };
      setSkillEvidencesMap(prev => ({ ...prev, [skill.id]: [defaultEvidence] }));
    }
    setSearchQuery('');
  };

  // Custom key/value inputs in step 1 search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const existingInCatalog = INTERNAL_SKILLS_CATALOG.find(
        s => s.name.toLowerCase() === searchQuery.toLowerCase().trim()
      );
      if (existingInCatalog) {
        handleAddSearchSkill(existingInCatalog);
      } else {
        // Create custom Catalog Skill item
        const customSkill: CatalogSkill = {
          id: `custom-${Date.now()}`,
          name: searchQuery.trim(),
          type: 'Technical',
          criticality: 'High',
          description: 'User-specified corporate skill competency'
        };
        handleAddSearchSkill(customSkill);
      }
    }
  };

  // Step Navigations
  const handleGotoStep2 = () => {
    if (selectedSkills.length === 0) {
      setFormError('Please select at least one skill to continue.');
      return;
    }
    setFormError(null);
    setCurrentStep(2);
  };

  const handleGotoStep3 = () => {
    setCurrentStep(3);
  };

  const handleGotoReview = () => {
    // Validate each selected skill has some text in practical application or proof
    for (const skill of selectedSkills) {
      const appText = skillApplications[skill.id] || '';
      if (!appText.trim()) {
        setFormError(`Please write a short Practical Application summary for "${skill.name}".`);
        return;
      }
    }
    setFormError(null);
    setCurrentStep(4);
  };

  // Master Submission
  const handleWizardSubmit = () => {
    selectedSkills.forEach(skill => {
      const skillId = skill.id;
      const level = skillLevels[skillId] || 3;
      const appText = skillApplications[skillId] || 'Utilized this skill in recent project assignments.';
      const evidencesList = skillEvidencesMap[skillId] || [];

      const skillItem: AdditionalSkillItem = {
        id: `add-wiz-${Date.now()}-${skillId}`,
        name: skill.name,
        type: skill.type,
        criticality: skill.criticality,
        proficiencyLevel: level,
        experienceYears: '2.5 Years',
        applicationSummaries: [appText],
        notes: appText,
        addedDate: 'Today',
        validationStatus: 'Need More Evidence',
        evidences: evidencesList,
        managerComment: 'Newly submitted for manager endoresment.'
      };

      saveOrUpdateAdditionalSkill(skillItem);
    });

    setToastMessage('Skills added successfully!');
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/skills?tab=home');
    }, 1500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Evidence Editor Inside Wizard Step 3 - opens file explorer directly
  const handleAddEvidenceInWizard = (skillId: string) => {
    const currentEvs = skillEvidencesMap[skillId] || [];
    if (currentEvs.length >= 5) {
      alert('Maximum of 5 proof artifacts can be added for each skill.');
      return;
    }
    setUploadingSkillId(skillId);
    setTimeout(() => {
      const fileInput = document.getElementById('wizard-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }, 50);
  };

  const handleWizardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingSkillId) return;

    const currentEvs = skillEvidencesMap[uploadingSkillId] || [];
    if (currentEvs.length >= 5) {
      alert('Maximum of 5 proof artifacts can be added for each skill.');
      return;
    }

    const fileSizeStr = formatFileSize(file.size);
    const fileNameOnly = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newEvidence: EvidenceItem = {
      id: `ev-wiz-${Date.now()}`,
      title: fileNameOnly,
      type: 'certificate',
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'pdf',
      fileSize: fileSizeStr,
      description: 'Uploaded via file explorer',
      addedDate: 'Today',
      verificationStatus: 'Pending'
    };

    setSkillEvidencesMap(prev => ({
      ...prev,
      [uploadingSkillId]: [...currentEvs, newEvidence]
    }));
    setUploadingSkillId(null);
  };

  const handleRemoveEvidenceInWizard = (skillId: string, evId: string) => {
    const currentEvs = skillEvidencesMap[skillId] || [];
    setSkillEvidencesMap(prev => ({
      ...prev,
      [skillId]: currentEvs.filter(e => e.id !== evId)
    }));
  };

  // ----------------------------------------------------
  // SINGLE EDIT HANDLERS (Saves single edited skill)
  // ----------------------------------------------------
  const handleSaveSingleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSkillName.trim()) {
      setFormError('Skill Name cannot be empty.');
      return;
    }
    if (editEvidences.length === 0) {
      setFormError('Please attach at least one proof/evidence.');
      return;
    }

    const skillItem: AdditionalSkillItem = {
      id: skillIdFromUrl,
      name: editSkillName,
      type: editSkillType,
      criticality: editCriticality,
      proficiencyLevel: editProfLevel,
      experienceYears: '3 Years',
      applicationSummaries: [editNotes],
      notes: editNotes,
      addedDate: 'Today',
      validationStatus: 'Need More Evidence',
      evidences: editEvidences,
      managerComment: 'Newly updated skill details. Awaiting validation.'
    };

    saveOrUpdateAdditionalSkill(skillItem);
    setToastMessage('Changes saved successfully!');
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/skills?tab=home');
    }, 1500);
  };

  const handleAddEvidenceInEdit = () => {
    if (editEvidences.length >= 5) {
      alert('Maximum of 5 proof artifacts can be added for each skill.');
      return;
    }
    setTimeout(() => {
      const fileInput = document.getElementById('edit-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    }, 50);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editEvidences.length >= 5) {
      alert('Maximum of 5 proof artifacts can be added for each skill.');
      return;
    }

    const fileSizeStr = formatFileSize(file.size);
    const fileNameOnly = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newEvidence: EvidenceItem = {
      id: `ev-edit-${Date.now()}`,
      title: fileNameOnly,
      type: 'certificate',
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'pdf',
      fileSize: fileSizeStr,
      description: 'Uploaded via file explorer',
      addedDate: 'Today',
      verificationStatus: 'Pending'
    };

    setEditEvidences(prev => [...prev, newEvidence]);
  };

  const handleRemoveEvidenceInEdit = (idx: number) => {
    setEditEvidences(editEvidences.filter((_, i) => i !== idx));
  };

  // Helper labels
  const getEvidenceTypeLabel = (type: EvidenceType) => {
    switch (type) {
      case 'certificate': return 'Certification';
      case 'project': return 'Project Deliverable';
      case 'assessment': return 'Assessment Scorecard';
      case 'link': return 'External URL / Repo';
      default: return 'Work Document';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-24">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-fade-in">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-heading font-extrabold text-sm">{toastMessage}</p>
            <p className="text-xs text-slate-300">Redirecting to employee dashboard...</p>
          </div>
        </div>
      )}

      {/* Sticky Header Nav Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 font-bold">
            <Link to="/skills?tab=home" className="text-r-blue hover:underline flex items-center gap-1.5">
              <ArrowLeftIcon className="w-3.5 h-3.5 text-r-blue" />
              <span>Back to Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900">
              {isEditing ? `Edit Skill` : `Add Skill`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <span className="text-xs font-bold text-gray-500 px-2.5 py-1 bg-gray-100 rounded-lg">
                Step {currentStep} of 4
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Global Error Banner */}
        {formError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
            <button onClick={() => setFormError(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ----------------------------------------------------
            A. SINGLE EDIT LAYOUT
            ---------------------------------------------------- */}
        {isEditing ? (
          <form onSubmit={handleSaveSingleEdit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Additional Employee Skills</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-heading">
                Edit Additional Skill
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Skill Name</label>
                <input 
                  type="text"
                  value={editSkillName}
                  onChange={(e) => setEditSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-r-blue"
                  disabled
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Skill Type Category</label>
                <select
                  value={editSkillType}
                  onChange={(e) => setEditSkillType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-r-blue"
                >
                  <option value="Technical">Technical</option>
                  <option value="Functional">Functional</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Domain">Domain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Criticality</label>
                <select
                  value={editCriticality}
                  onChange={(e) => setEditCriticality(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-r-blue"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Proficiency Level</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {PROFICIENCY_LEVELS.map((p) => (
                    <button
                      key={p.level}
                      type="button"
                      onClick={() => setEditProfLevel(p.level)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                        editProfLevel === p.level
                          ? 'border-r-blue bg-blue-50/50 shadow-2xs'
                          : 'border-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-bold ${editProfLevel === p.level ? 'text-r-blue' : 'text-slate-800'}`}>
                        {p.name}
                      </span>
                      <span className="text-gray-500 font-medium">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Practical application record</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-r-blue focus-within:border-transparent bg-white shadow-3xs transition-all">
                  {/* Toolbar */}
                  <div className="bg-slate-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between text-gray-500 text-xs font-bold select-none">
                    <div className="flex items-center gap-3">
                      <button type="button" className="hover:text-gray-900 font-extrabold cursor-pointer" title="Bold">B</button>
                      <button type="button" className="hover:text-gray-900 italic cursor-pointer" title="Italic">I</button>
                      <button type="button" className="hover:text-gray-900 underline cursor-pointer" title="Underline">U</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" className="hover:text-gray-900 cursor-pointer" title="Bullet List">• List</button>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">Standard Editor</span>
                  </div>
                  
                  {/* Textarea */}
                  <textarea
                    maxLength={1000}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value.slice(0, 1000))}
                    placeholder="Describe your practical experience using this skill..."
                    className="w-full h-32 px-4 py-3 text-xs font-medium text-slate-800 focus:outline-hidden border-0 resize-none"
                  />
                  
                  {/* Footer with Character Counter */}
                  <div className="bg-slate-50/50 border-t border-gray-150 px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-400 font-bold select-none">
                    <span>Professional record logging format</span>
                    <span className={editNotes.length >= 1000 ? "text-rose-600 font-black animate-pulse" : "text-gray-400 font-bold"}>
                      {editNotes.length} / 1000 chars
                    </span>
                  </div>
                </div>
              </div>

              {/* Proofs / Evidences list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Attached Proofs & Evidences ({editEvidences.length})</label>
                  <button
                    type="button"
                    onClick={handleAddEvidenceInEdit}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Proof</span>
                  </button>
                </div>

                {editEvidences.length === 0 ? (
                  <div className="p-5 text-center bg-slate-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
                    No proofs or certificate scorecards attached. You must add at least 1 proof.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editEvidences.map((ev, idx) => (
                      <div key={ev.id || idx} className="p-3 bg-slate-50/70 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{ev.title}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {getEvidenceTypeLabel(ev.type)} • {ev.fileName || 'Verification Artifact'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidenceInEdit(idx)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/skills?tab=home')}
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-r-blue hover:bg-r-blue-dark rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* ----------------------------------------------------
              B. MULTI-STEP WIZARD (ADD FLOW)
              ---------------------------------------------------- */
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Display header strictly like a clean form screen */}
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
                Add skill
              </h1>
              <p className="text-xs text-gray-400 mt-1">* Indicates required</p>
            </div>

            {/* ========================================================
                WIZARD STEP 1: MULTI-SELECT SKILLS
                ======================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Multi-Select Skill Search block */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block font-heading">
                    Skill*
                  </label>
                  
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <SearchIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Skill (ex: Project Management)"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-slate-900 focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                    />

                    {/* Search suggestions dropdown list */}
                    {filteredCatalogOptions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto no-scrollbar">
                        {filteredCatalogOptions.map(option => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleAddSearchSkill(option)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 text-slate-800 transition-colors border-b border-gray-100 flex items-center justify-between"
                          >
                            <span>{option.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {option.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SUGGESTED CONTAINER (Strictly resembling the reference image) */}
                {showSuggestedContainer && (
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() => setShowSuggestedContainer(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
                      title="Dismiss suggestions"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>

                    <h4 className="text-sm sm:text-base font-black text-slate-900 font-heading tracking-tight mb-3">
                      Suggested Skills
                    </h4>

                    {/* Pills grid with + symbol inside them */}
                    <div className="flex flex-wrap gap-2.5">
                      {SUGGESTED_SKILLS_DATA.map(suggested => {
                        const isAdded = selectedSkills.some(s => s.id === suggested.id);
                        return (
                          <button
                            key={suggested.id}
                            type="button"
                            onClick={() => handleAddSuggestedSkill(suggested)}
                            disabled={isAdded}
                            className={`px-3 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-slate-200/60 text-slate-400 border-slate-300 line-through'
                                : 'bg-white text-slate-800 border-gray-300 hover:border-gray-500 shadow-2xs hover:shadow-xs active:scale-95'
                            }`}
                          >
                            <span>{suggested.name}</span>
                            <span className="text-gray-500 font-medium">+</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Skills Pills List */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                      Selected Skills ({selectedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(skill => (
                        <div
                          key={skill.id}
                          className="px-3 py-1.5 bg-blue-50 text-r-blue border border-blue-200 rounded-full text-xs font-bold flex items-center gap-2"
                        >
                          <span>{skill.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedSkill(skill.id)}
                            className="p-0.5 text-r-blue hover:text-blue-900 rounded-full hover:bg-blue-100 transition-all cursor-pointer"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation CTA */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleGotoStep2}
                    className="px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Proficiency Levels</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================
                WIZARD STEP 2: PROFICIENCY LEVEL SELECTOR
                ======================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-slate-500 uppercase tracking-wider block">
                    Step 2: Select Proficiency Level
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define your current competency scale for each added skill.
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedSkills.map(skill => {
                    const currentLvl = skillLevels[skill.id] || 3;
                    return (
                      <div key={skill.id} className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <h4 className="font-extrabold text-sm text-slate-900 font-heading">
                            {skill.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-white text-slate-600 font-bold text-[10px] rounded border border-gray-200">
                            {skill.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {PROFICIENCY_LEVELS.map(p => (
                            <button
                              key={p.level}
                              type="button"
                              onClick={() => {
                                setSkillLevels(prev => ({ ...prev, [skill.id]: p.level }));
                              }}
                              className={`p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                                currentLvl === p.level
                                  ? 'border-r-blue bg-blue-50/50 shadow-2xs'
                                  : 'border-gray-200 bg-white hover:bg-slate-100'
                              }`}
                            >
                              <span className={`font-bold ${currentLvl === p.level ? 'text-r-blue' : 'text-slate-800'}`}>
                                {p.name}
                              </span>
                              <span className="text-slate-500 font-medium text-[11px] leading-tight">{p.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step navigation actions */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Selection
                  </button>
                  <button
                    type="button"
                    onClick={handleGotoStep3}
                    className="px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Evidences & Records</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================
                WIZARD STEP 3: PROOFS + PRACTICAL APPLICATION
                ======================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-slate-500 uppercase tracking-wider block">
                    Step 3: Add Proofs & Practical application record
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Provide real-world endorsement details and verified evidence for each selected competency.
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedSkills.map(skill => {
                    const level = skillLevels[skill.id] || 3;
                    const levelLabel = PROFICIENCY_LEVELS.find(l => l.level === level)?.name || `L${level}`;
                    const evList = skillEvidencesMap[skill.id] || [];
                    const appText = skillApplications[skill.id] || '';

                    return (
                      <div key={skill.id} className="p-4 sm:p-5 bg-slate-50 border border-gray-200 rounded-3xl space-y-4">
                        
                        {/* Title box */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 font-heading">
                              {skill.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              Assigned Proficiency: <strong className="text-slate-800">{levelLabel}</strong>
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-white text-r-blue font-bold text-[10px] rounded border border-blue-200">
                            {skill.type}
                          </span>
                        </div>

                        {/* Practical Application Record */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 block">
                            Practical application record <span className="text-rose-600">*</span>
                          </label>
                          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-r-blue focus-within:border-transparent bg-white shadow-3xs transition-all">
                            {/* Toolbar */}
                            <div className="bg-slate-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-gray-500 text-[11px] font-bold select-none">
                              <div className="flex items-center gap-3">
                                <button type="button" className="hover:text-gray-900 font-extrabold cursor-pointer" title="Bold">B</button>
                                <button type="button" className="hover:text-gray-900 italic cursor-pointer" title="Italic">I</button>
                                <button type="button" className="hover:text-gray-900 underline cursor-pointer" title="Underline">U</button>
                                <span className="text-gray-300">|</span>
                                <button type="button" className="hover:text-gray-900 cursor-pointer" title="Bullet List">• List</button>
                              </div>
                              <span className="text-[9px] text-gray-400 font-semibold">Standard Editor</span>
                            </div>
                            
                            {/* Textarea */}
                            <textarea
                              maxLength={1000}
                              value={appText}
                              onChange={(e) => {
                                const txt = e.target.value.slice(0, 1000);
                                setSkillApplications(prev => ({ ...prev, [skill.id]: txt }));
                              }}
                              placeholder="Detail your practical application. For example: Architected the system routing protocols and container configuration templates in Q1 launch."
                              className="w-full h-24 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden border-0 resize-none"
                            />
                            
                            {/* Footer with Character Counter */}
                            <div className="bg-slate-50/50 border-t border-gray-150 px-3 py-1 flex items-center justify-between text-[9px] text-gray-400 font-bold select-none">
                              <span>Professional record logging format</span>
                              <span className={appText.length >= 1000 ? "text-rose-600 font-black animate-pulse" : "text-gray-400 font-bold"}>
                                {appText.length} / 1000 chars
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Attached Proofs list */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              Attached Proofs & Evidences ({evList.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddEvidenceInWizard(skill.id)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-bold rounded-lg border border-gray-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <PlusIcon className="w-3 h-3" />
                              <span>Add Proof Artifact</span>
                            </button>
                          </div>

                          {evList.length === 0 ? (
                            <div className="p-3 text-center bg-white border border-dashed border-gray-200 rounded-xl text-[11px] text-gray-400 font-medium">
                              No certificates or proof documents attached.
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {evList.map((ev) => (
                                <div key={ev.id} className="p-2.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-[11px]">
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-900">{ev.title}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                      {getEvidenceTypeLabel(ev.type)} • {ev.fileName || 'Endorsement Artifact'}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEvidenceInWizard(skill.id, ev.id)}
                                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Step actions */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Levels
                  </button>
                  <button
                    type="button"
                    onClick={handleGotoReview}
                    className="px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Review</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================
                WIZARD STEP 4: REVIEW & SUBMIT
                ======================================================== */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-slate-500 uppercase tracking-wider block">
                    Step 4: Final Review & Submission
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review and confirm additional skills to submit to your reporting manager for endorsement.
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedSkills.map(skill => {
                    const level = skillLevels[skill.id] || 3;
                    const levelName = PROFICIENCY_LEVELS.find(l => l.level === level)?.name || `Level ${level}`;
                    const appText = skillApplications[skill.id] || '';
                    const evList = skillEvidencesMap[skill.id] || [];

                    return (
                      <div key={skill.id} className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <h4 className="font-extrabold text-sm text-slate-900 font-heading">
                            {skill.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-r-blue font-bold text-[10px] rounded border border-blue-200">
                            {skill.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                              Proficiency Level
                            </p>
                            <p className="font-bold text-slate-800 mt-0.5">{levelName}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                              Practical Application Summary
                            </p>
                            <p className="font-medium text-slate-700 mt-0.5 italic leading-relaxed">
                              "{appText}"
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">
                            Evidence Documents ({evList.length})
                          </p>
                          {evList.length === 0 ? (
                            <p className="text-xs text-amber-600 font-bold">No evidence files linked.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {evList.map(e => (
                                <span key={e.id} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-md">
                                  <FileTextIcon className="w-3.5 h-3.5 text-r-blue" />
                                  <span>{e.title}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Wizard actions */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Evidences
                  </button>
                  <button
                    type="button"
                    onClick={handleWizardSubmit}
                    className="px-6 py-3 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                    <span>Confirm & Submit Skills</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Hidden file input elements for opening file explorer directly */}
      <input
        type="file"
        id="edit-file-input"
        className="hidden"
        accept=".pdf,.docx,.png,.jpg,.jpeg,.doc"
        onChange={handleEditFileChange}
      />
      <input
        type="file"
        id="wizard-file-input"
        className="hidden"
        accept=".pdf,.docx,.png,.jpg,.jpeg,.doc"
        onChange={handleWizardFileChange}
      />

    </div>
  );
};

export default AddAdditionalSkillPage;
