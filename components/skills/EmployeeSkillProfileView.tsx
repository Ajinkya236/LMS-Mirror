import React, { useState } from 'react';
import {
  ArrowLeft as ArrowLeftIcon,
  Award as AwardIcon,
  CheckCircle2 as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Clock as ClockIcon,
  FileText as FileTextIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  Edit as EditIcon,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  ExternalLink as ExternalLinkIcon,
  Layers as LayersIcon
} from 'lucide-react';
import type {
  TeamMemberProfile,
  ReporteeRoleSkill,
  ReporteeAdditionalSkill,
  SkillEvidenceDoc,
  ManagerSkillValidationItem
} from '../../utils/skillsData';
import { EvidenceDocumentModal } from './EvidenceDocumentModal';

interface EmployeeSkillProfileViewProps {
  employee: TeamMemberProfile;
  managerSurveyStatus: 'Not started' | 'In progress' | 'Completed';
  onBack: () => void;
  onOpenManagerSurvey: (employee: TeamMemberProfile) => void;
  onOpenValidationReview?: (validationItem: ManagerSkillValidationItem) => void;
}

export const EmployeeSkillProfileView: React.FC<EmployeeSkillProfileViewProps> = ({
  employee,
  managerSurveyStatus,
  onBack,
  onOpenManagerSurvey,
  onOpenValidationReview
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'role' | 'additional'>('role');
  const [roleCriticalityFilter, setRoleCriticalityFilter] = useState<string>('All');
  const [activePreviewDoc, setActivePreviewDoc] = useState<{ doc: SkillEvidenceDoc; skillName: string } | null>(null);

  const roleSkills = employee.roleSkills || [];
  const additionalSkills = employee.additionalSkills || [];

  // Filter role skills
  const filteredRoleSkills = roleSkills.filter(s => {
    if (roleCriticalityFilter === 'All') return true;
    return s.criticality === roleCriticalityFilter;
  });

  const handleDownloadFile = (doc: SkillEvidenceDoc, skillName: string) => {
    const fileContent = `=====================================================
JIO LEARNING & COMPETENCY MANAGEMENT ECOSYSTEM
EVIDENCE DOCUMENT & ARTIFACT VERIFICATION DOSSIER
=====================================================
Employee: ${employee.name} (${employee.employeeId || 'JIO-ENG-001'})
Role: ${employee.role} (${employee.grade}) - ${employee.department}
Skill: ${skillName}

Document: ${doc.title}
Issuer: ${doc.issuer || 'Reliance Jio Platforms'}
Issue Date: ${doc.issueDate || '2025'}
Credential ID: ${doc.credentialId || 'N/A'}

Artifact Details:
${doc.description || 'Verified enterprise engineering artifact submitted as proof of technical competency.'}
=====================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${doc.credentialId || 'Evidence'}.txt`;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTriggerValidation = (skill: ReporteeAdditionalSkill) => {
    if (onOpenValidationReview) {
      const item: ManagerSkillValidationItem = {
        id: `val-${employee.id}-${skill.id}`,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeRole: employee.role,
        employeeGrade: employee.grade,
        employeeDepartment: employee.department,
        employeePhoto: employee.photo,
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        type: skill.type,
        criticality: skill.criticality,
        selectedLevel: skill.selectedLevel,
        levelName: skill.levelName,
        levelDescription: skill.levelDescription,
        experienceYears: skill.experienceYears,
        applicationText: skill.applicationText,
        evidenceDocs: skill.evidenceDocs || [],
        submittedDate: skill.submittedDate || 'Recent',
        status: skill.validationStatus as any,
        managerFeedback: skill.managerFeedback
      };
      onOpenValidationReview(item);
    }
  };

  const targetMetCount = roleSkills.filter(s => {
    const rating = s.managerRating !== undefined ? s.managerRating : s.selfRating;
    return rating !== undefined && rating >= (s.targetLevel || 3);
  }).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-back-to-team"
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Team Roster</span>
          </button>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-xs text-gray-500 font-semibold block">Manager Portal / Skills Profile</span>
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
              {employee.name}'s Capability Dossier
            </h1>
          </div>
        </div>

        <button
          type="button"
          id="btn-profile-survey-action"
          onClick={() => onOpenManagerSurvey(employee)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
            managerSurveyStatus === 'Completed'
              ? 'bg-slate-800 hover:bg-slate-900 text-white'
              : managerSurveyStatus === 'In progress'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-r-blue hover:bg-r-blue-dark text-white'
          }`}
        >
          <EditIcon className="w-3.5 h-3.5" />
          <span>
            {managerSurveyStatus === 'Completed'
              ? 'Update Manager Survey'
              : managerSurveyStatus === 'In progress'
              ? 'Resume Draft Survey'
              : 'Conduct Manager Survey'}
          </span>
        </button>
      </div>

      {/* Employee Profile Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-gray-900">
                  {employee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  Grade {employee.grade}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-r-blue text-xs font-bold border border-blue-200">
                  ID: {employee.employeeId || 'JIO-ENG-084'}
                </span>
              </div>

              <p className="text-sm font-bold text-gray-700">
                {employee.role} • <span className="text-gray-500 font-normal">{employee.department}</span>
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Manager: <strong className="text-gray-800">Sandeep Gupta (Direct)</strong></span>
                <span>&bull;</span>
                <span>Critical Gap: <strong className={employee.criticalGap !== 'None' ? 'text-rose-700 font-bold' : 'text-emerald-700'}>{employee.criticalGap}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-200/80">
            <div className="p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Role Readiness</span>
              <div className="text-lg font-black text-r-blue mt-0.5 flex items-center gap-1.5">
                <span>{employee.readiness}%</span>
                <div className="w-10 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-r-blue h-full rounded-full"
                    style={{ width: `${employee.readiness}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Role Skills</span>
              <span className="text-lg font-black text-gray-900 mt-0.5 block">
                {roleSkills.length} <span className="text-xs text-emerald-700 font-bold">({targetMetCount} met)</span>
              </span>
            </div>

            <div className="p-2 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Additional Skills</span>
              <span className="text-lg font-black text-indigo-900 mt-0.5 block">
                {additionalSkills.length} Validated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Tabs: Role Mapped Skills vs Additional Skills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              id="tab-view-role-skills"
              onClick={() => setActiveProfileTab('role')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeProfileTab === 'role'
                  ? 'bg-white text-r-blue shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AwardIcon className="w-4 h-4" />
              <span>Role-Mapped Skills ({roleSkills.length})</span>
            </button>

            <button
              type="button"
              id="tab-view-additional-skills"
              onClick={() => setActiveProfileTab('additional')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeProfileTab === 'additional'
                  ? 'bg-white text-r-blue shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayersIcon className="w-4 h-4" />
              <span>Additional Skills ({additionalSkills.length})</span>
            </button>
          </div>

          {/* Secondary Filter for Role Skills */}
          {activeProfileTab === 'role' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">Filter Criticality:</span>
              <select
                value={roleCriticalityFilter}
                onChange={(e) => setRoleCriticalityFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-r-blue focus:outline-none"
              >
                <option value="All">All Criticalities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: ROLE MAPPED SKILLS */}
        {activeProfileTab === 'role' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoleSkills.map((skill) => {
                const target = skill.targetLevel || 3;
                const self = skill.selfRating;
                const mgr = skill.managerRating;
                const effectiveRating = mgr !== undefined ? mgr : self;
                const isMet = effectiveRating !== undefined && effectiveRating >= target;
                const gap = effectiveRating !== undefined ? target - effectiveRating : null;

                return (
                  <div
                    key={skill.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs hover:border-r-blue/40 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            skill.criticality === 'Critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : skill.criticality === 'High'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {skill.criticality}
                          </span>
                          <span className="text-[11px] font-bold text-gray-400">{skill.category}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 font-heading">
                          {skill.name}
                        </h3>
                      </div>

                      {/* Gap / Met Status Badge */}
                      {effectiveRating === undefined ? (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                          Not Evaluated
                        </span>
                      ) : isMet ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Target Met ✓</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-300 flex items-center gap-1">
                          <AlertCircleIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>Gap -{gap} {gap === 1 ? 'Level' : 'Levels'}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {skill.description || 'Core technical capability required for platform architecture and development.'}
                    </p>

                    {/* Ratings Comparison Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Required Target</span>
                        <strong className="text-gray-900 font-extrabold">Level {target}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Self-Rating</span>
                        {self !== undefined ? (
                          <strong className="text-blue-900 font-bold">L{self}</strong>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Not submitted</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Manager Rating</span>
                        {mgr !== undefined ? (
                          <strong className="text-emerald-900 font-bold">L{mgr}</strong>
                        ) : (
                          <span className="text-amber-700 italic text-[11px]">Survey Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ADDITIONAL SKILLS */}
        {activeProfileTab === 'additional' && (
          <div className="space-y-4">
            {additionalSkills.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-2">
                <LayersIcon className="w-8 h-8 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-700">No Additional Skills Submitted Yet</h3>
                <p className="text-xs text-gray-500">
                  {employee.name} has not submitted any out-of-role additional competencies for review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {additionalSkills.map((skill) => {
                  const isValidated = skill.validationStatus === 'Relevant' || skill.validationStatus === 'Future Relevant';
                  const isPending = skill.validationStatus === 'Pending Validation' || skill.validationStatus === 'Pending';
                  const isNeedEvidence = skill.validationStatus === 'Need More Evidence';

                  return (
                    <div
                      key={skill.id}
                      className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-5 hover:border-gray-300 transition-all"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                              {skill.type}
                            </span>
                            <span className="text-xs font-bold text-gray-400">{skill.category}</span>
                            {skill.experienceYears && (
                              <span className="text-xs text-gray-500">
                                • <strong>{skill.experienceYears} Years</strong> practical experience
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-black font-heading text-gray-900">
                            {skill.name}
                          </h3>
                        </div>

                        {/* Validation Status & Action */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                            isValidated
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : isNeedEvidence
                              ? 'bg-orange-50 text-orange-800 border-orange-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isValidated && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />}
                            {isPending && <ClockIcon className="w-3.5 h-3.5 text-amber-600" />}
                            {isNeedEvidence && <AlertCircleIcon className="w-3.5 h-3.5 text-orange-600" />}
                            <span>{skill.validationStatus}</span>
                          </span>

                          <button
                            type="button"
                            id={`btn-validate-skill-${skill.id}`}
                            onClick={() => handleTriggerValidation(skill)}
                            className="px-3.5 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
                          >
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            <span>{isPending ? 'Review & Validate' : 'Re-evaluate'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Selected Proficiency Definition */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Demonstrated Level
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-100 text-r-blue text-xs font-black rounded-md">
                            Level {skill.selectedLevel}: {skill.levelName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {skill.levelDescription || 'Demonstrates full independence and architectural leadership in this area.'}
                        </p>
                      </div>

                      {/* Application Text / Practical Work Impact */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                          Practical Application & Project Impact:
                        </h4>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                          {skill.applicationText || skill.applicationSummaries?.join('\n') || 'Enterprise engineering implementation across microservices and cloud infrastructure.'}
                        </div>
                      </div>

                      {/* Evidence Files List with Preview & Download */}
                      {(() => {
                        const docs = skill.evidenceDocs || skill.evidences || [];
                        if (docs.length === 0) return null;
                        return (
                          <div className="space-y-2.5 pt-2 border-t border-gray-100">
                            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <FileTextIcon className="w-3.5 h-3.5 text-r-blue" />
                              <span>Attached Evidence Artifacts ({docs.length})</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {docs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between gap-2"
                                >
                                  <div className="truncate">
                                    <span className="text-xs font-bold text-gray-900 block truncate">{doc.title}</span>
                                    <span className="text-[10px] text-gray-500 block truncate">
                                      {doc.issuer || 'Jio Platforms'} • {doc.issueDate || '2025'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setActivePreviewDoc({ doc, skillName: skill.name })}
                                      className="p-1.5 text-slate-600 hover:text-r-blue hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                      title="Preview evidence"
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadFile(doc, skill.name)}
                                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                      title="Download evidence file"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Manager Feedback Note */}
                      {skill.managerFeedback && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
                          <SparklesIcon className="w-4 h-4 text-r-blue flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[11px] uppercase tracking-wider text-r-blue font-extrabold">
                              Manager Feedback & Notes:
                            </strong>
                            <p className="mt-0.5">{skill.managerFeedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Evidence Document Preview Nested Modal */}
      {activePreviewDoc && (
        <EvidenceDocumentModal
          isOpen={!!activePreviewDoc}
          onClose={() => setActivePreviewDoc(null)}
          evidence={activePreviewDoc.doc}
          employeeName={employee.name}
          skillName={activePreviewDoc.skillName}
        />
      )}
    </div>
  );
};

export default EmployeeSkillProfileView;
