import React, { useState, useEffect } from 'react';
import {
  X as XIcon,
  CheckCircle2 as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  FileText as FileTextIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Award as AwardIcon,
  ShieldCheck as ShieldCheckIcon,
  Clock as ClockIcon,
  MessageSquare as MessageSquareIcon,
  Send as SendIcon,
  ExternalLink as ExternalLinkIcon,
  User as UserIcon,
  Sparkles as SparklesIcon
} from 'lucide-react';
import type { ManagerSkillValidationItem, SkillEvidenceDoc } from '../../utils/skillsData';
import { EvidenceDocumentModal } from './EvidenceDocumentModal';

interface ManagerSkillValidationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationItem: ManagerSkillValidationItem | null;
  onSubmitDecision: (
    validationId: string,
    decision: 'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant',
    managerNotes: string,
    validatedLevel: number
  ) => void;
}

export const ManagerSkillValidationReviewModal: React.FC<ManagerSkillValidationReviewModalProps> = ({
  isOpen,
  onClose,
  validationItem,
  onSubmitDecision
}) => {
  const [selectedDecision, setSelectedDecision] = useState<'Relevant' | 'Future Relevant' | 'Need More Evidence' | 'Not Relevant'>('Relevant');
  const [managerNotes, setManagerNotes] = useState<string>('');
  const [validatedLevel, setValidatedLevel] = useState<number>(3);
  const [activePreviewDoc, setActivePreviewDoc] = useState<SkillEvidenceDoc | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when validationItem changes
  useEffect(() => {
    if (validationItem) {
      setValidatedLevel(validationItem.selectedLevel || 3);
      if (validationItem.status !== 'Pending') {
        setSelectedDecision(validationItem.status);
      } else {
        setSelectedDecision('Relevant');
      }
      setManagerNotes(validationItem.managerFeedback || '');
      setValidationError(null);
    }
  }, [validationItem, isOpen]);

  if (!isOpen || !validationItem) return null;

  const handleDownloadFile = (doc: SkillEvidenceDoc) => {
    const fileContent = `=====================================================
JIO PLATFORMS - SKILL EVIDENCE DOCUMENT
=====================================================
Employee: ${validationItem.employeeName} (${validationItem.employeeId})
Skill: ${validationItem.skillName}
Proficiency Claimed: Level ${validationItem.selectedLevel} (${validationItem.levelName})
Document: ${doc.title}
Issuer: ${doc.issuer || 'Reliance Jio Platforms'}
Issue Date: ${doc.issueDate || '2025'}
Credential ID: ${doc.credentialId || 'N/A'}

Practical Experience / Application Statement:
${validationItem.applicationText}

Document Details:
${doc.description || 'Verified engineering artifact and technical competency submission.'}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecision) {
      setValidationError('Please select a manager validation decision.');
      return;
    }
    if (selectedDecision === 'Need More Evidence' && !managerNotes.trim()) {
      setValidationError('Please provide specific feedback explaining what additional evidence is required.');
      return;
    }

    onSubmitDecision(validationItem.id, selectedDecision, managerNotes, validatedLevel);
    onClose();
  };

  const isPending = validationItem.status === 'Pending';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-scale-up"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={validationItem.employeePhoto}
                alt={validationItem.employeeName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-400 flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-300">
                    Additional Skill Validation
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isPending 
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40' 
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                  }`}>
                    {validationItem.status === 'Pending' ? 'Needs Review' : `Status: ${validationItem.status}`}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-white">
                  {validationItem.employeeName} • <span className="text-blue-300">{validationItem.skillName}</span>
                </h2>
                <span className="text-xs text-slate-400">
                  {validationItem.employeeRole} ({validationItem.employeeGrade}) • {validationItem.employeeDepartment}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-grow">
            
            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Skill Overview Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Submitted Skill</span>
                  <h3 className="text-base font-extrabold text-gray-900">{validationItem.skillName}</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    Category: {validationItem.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-r-blue text-xs font-bold border border-blue-200">
                    Type: {validationItem.type}
                  </span>
                </div>
              </div>

              {/* Claimed Proficiency Level Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Employee Claimed Proficiency
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black border border-indigo-200 flex items-center gap-1">
                    <AwardIcon className="w-3.5 h-3.5 text-indigo-700" />
                    Level {validationItem.selectedLevel || validationItem.proficiencyLevel || 1}: {validationItem.levelName || 'Practitioner'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {validationItem.levelDescription || 'Demonstrates independent ability to design, implement, and operate systems at enterprise scale.'}
                </p>
                {validationItem.experienceYears && (
                  <div className="text-[11px] font-bold text-slate-500 pt-1">
                    Demonstrated Work Experience: <strong className="text-slate-800">{validationItem.experienceYears} Years</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Application Text / Practical Usage Proof */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                <FileTextIcon className="w-4 h-4 text-r-blue" />
                <span>Application & Practical Work Impact</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line font-normal">
                {validationItem.applicationText || validationItem.applicationStatement || 'Demonstrated practical competence in enterprise engineering.'}
              </div>
            </div>

            {/* Evidence Files List */}
            {(() => {
              const evidenceList = validationItem.evidenceDocs || validationItem.evidences || [];
              return (
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                      <span>Evidence Files & Artifact Proofs ({evidenceList.length})</span>
                    </div>
                    <span className="text-[11px] text-gray-500">Click preview or download to inspect</span>
                  </div>

                  {evidenceList.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-gray-500 border border-dashed border-gray-300">
                      No evidence files attached to this validation request.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {evidenceList.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-r-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileTextIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {doc.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {doc.issuer ? `${doc.issuer} • ` : ''}{doc.issueDate || '2025'}{doc.credentialId ? ` • ID: ${doc.credentialId}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Preview and Download Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          id={`btn-preview-doc-${doc.id}`}
                          onClick={() => setActivePreviewDoc(doc)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-r-blue" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-download-doc-${doc.id}`}
                          onClick={() => handleDownloadFile(doc)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <DownloadIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })()}

            {/* Manager Decision Section */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-r-blue/30 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                <SparklesIcon className="w-4 h-4 text-r-blue" />
                <span>Manager Evaluation & Validation Decision</span>
              </div>

              {/* 4 Decision Radio Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  selectedDecision === 'Relevant'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Relevant"
                    checked={selectedDecision === 'Relevant'}
                    onChange={() => setSelectedDecision('Relevant')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-emerald-950 block">
                      Approve as Relevant
                    </span>
                    <span className="text-[11px] text-emerald-800 leading-tight">
                      Validated competency actively applied in current role and projects.
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  selectedDecision === 'Future Relevant'
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Future Relevant"
                    checked={selectedDecision === 'Future Relevant'}
                    onChange={() => setSelectedDecision('Future Relevant')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-blue-950 block">
                      Approve as Future Relevant
                    </span>
                    <span className="text-[11px] text-blue-800 leading-tight">
                      Recognized technical strength aligned with upcoming architectural roadmaps.
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  selectedDecision === 'Need More Evidence'
                    ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Need More Evidence"
                    checked={selectedDecision === 'Need More Evidence'}
                    onChange={() => setSelectedDecision('Need More Evidence')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-amber-950 block">
                      Request More Evidence
                    </span>
                    <span className="text-[11px] text-amber-800 leading-tight">
                      Ask employee to attach additional repo links, certifications, or project proofs.
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  selectedDecision === 'Not Relevant'
                    ? 'bg-rose-50/70 border-rose-500 ring-1 ring-rose-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Not Relevant"
                    checked={selectedDecision === 'Not Relevant'}
                    onChange={() => setSelectedDecision('Not Relevant')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-rose-950 block">
                      Reject / Not Relevant
                    </span>
                    <span className="text-[11px] text-rose-800 leading-tight">
                      Out of scope for current organization or insufficient practical application.
                    </span>
                  </div>
                </label>
              </div>

              {/* Validated Proficiency Level Adjustment */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Manager Confirmed Proficiency Level:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setValidatedLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        validatedLevel === lvl
                          ? 'bg-r-blue text-white border-r-blue shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-gray-200'
                      }`}
                    >
                      L{lvl} {lvl === 1 ? 'Awareness' : lvl === 2 ? 'Working' : lvl === 3 ? 'Practitioner' : 'Expert'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manager Feedback Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Manager Notes / Guidance for Employee:</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {selectedDecision === 'Need More Evidence' ? 'Required' : 'Optional'}
                  </span>
                </label>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Provide context, recognition, or required next steps for this competency..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-r-blue focus:outline-none placeholder-gray-400"
                />
              </div>

              {/* Submit Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="btn-submit-validation-decision"
                  className="px-5 py-2 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  <span>Submit Validation Decision</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* Evidence File Preview Nested Modal */}
      {activePreviewDoc && (
        <EvidenceDocumentModal
          isOpen={!!activePreviewDoc}
          onClose={() => setActivePreviewDoc(null)}
          evidence={activePreviewDoc}
          employeeName={validationItem.employeeName}
          skillName={validationItem.skillName}
        />
      )}
    </>
  );
};

export default ManagerSkillValidationReviewModal;
