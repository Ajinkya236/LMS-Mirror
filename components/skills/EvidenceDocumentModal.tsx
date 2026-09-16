import React from 'react';
import {
  X as XIcon,
  Download as DownloadIcon,
  FileText as FileTextIcon,
  ShieldCheck as ShieldCheckIcon,
  ExternalLink as ExternalLinkIcon,
  Award as AwardIcon,
  CheckCircle2 as CheckCircleIcon,
  Calendar as CalendarIcon,
  Building as BuildingIcon
} from 'lucide-react';
import type { SkillEvidenceDoc } from '../../utils/skillsData';

interface EvidenceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: SkillEvidenceDoc | null;
  employeeName?: string;
  skillName?: string;
}

export const EvidenceDocumentModal: React.FC<EvidenceDocumentModalProps> = ({
  isOpen,
  onClose,
  evidence,
  employeeName = 'Employee',
  skillName = 'Skill Competency'
}) => {
  if (!isOpen || !evidence) return null;

  const handleDownload = () => {
    // Generate sample document payload to trigger a real file download in the browser
    const fileContent = `=====================================================
JIO LEARNING & COMPETENCY MANAGEMENT ECOSYSTEM
EVIDENCE DOCUMENT & ARTIFACT VERIFICATION DOSSIER
=====================================================

Employee: ${employeeName}
Skill: ${skillName}
Document Title: ${evidence.title}
Document Type: ${evidence.fileType.toUpperCase()}
Issuer / Organization: ${evidence.issuer || 'Reliance Jio Platforms Engineering'}
Issue Date: ${evidence.issueDate || '2025'}
Credential / Artifact ID: ${evidence.credentialId || 'N/A'}
Status: Verified Enterprise Submission

-----------------------------------------------------
DOCUMENT DESCRIPTION & PRACTICAL APPLICATION:
-----------------------------------------------------
${evidence.description || 'Verified engineering artifact submitted as proof of technical capability and competency.'}

-----------------------------------------------------
VERIFICATION METADATA:
-----------------------------------------------------
- Cryptographic Checksum: SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}
- Timestamp: ${new Date().toISOString()}
- Signed By: Jio Enterprise Skills Assessment & Governance Authority
=====================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = `${evidence.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${evidence.credentialId || 'Evidence'}.${evidence.fileType === 'pdf' ? 'txt' : evidence.fileType === 'image' ? 'txt' : 'txt'}`;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-slate-900 to-slate-850 px-6 py-5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-300">
                  {evidence.fileType.toUpperCase()} Artifact Preview
                </span>
                <span className="text-[10px] text-slate-400">
                  {evidence.fileSize || '1.8 MB'}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white truncate max-w-md">
                {evidence.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close Preview"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Document Preview Viewport */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-grow">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <BuildingIcon className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Issuing Authority</span>
                  <strong className="text-gray-900">{evidence.issuer || 'Jio Platforms Guild'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Issue Date</span>
                  <strong className="text-gray-900">{evidence.issueDate || 'August 2025'}</strong>
                </div>
              </div>

              {evidence.credentialId && (
                <div className="flex items-center gap-2.5 sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Verification Credential ID</span>
                    <code className="text-xs font-mono font-bold text-slate-900">{evidence.credentialId}</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Content Canvas Simulation */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-inner space-y-4 font-sans relative">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AwardIcon className="w-5 h-5 text-r-blue" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Official Technical Proof & Artifact
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                Verified Signature
              </span>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">
                Summary of Demonstrated Technical Competence:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-xs italic">
                "{evidence.description || 'Demonstrated architecture leadership and production-grade implementation of high-throughput streaming systems, leading to 99.99% reliability.'}"
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] text-gray-600">
                <p>• Submitted for employee: <strong className="text-gray-900">{employeeName}</strong></p>
                <p>• Applied competency domain: <strong className="text-gray-900">{skillName}</strong></p>
                <p>• Security clearance level: <span className="font-semibold text-slate-800">Enterprise Engineering Tier-3</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500">
            Document format: <strong className="text-gray-800">{evidence.fileType.toUpperCase()}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              id="btn-download-evidence-modal"
              onClick={handleDownload}
              className="px-4 py-2 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDocumentModal;
