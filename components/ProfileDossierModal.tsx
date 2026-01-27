
import React from 'react';
import { XIcon } from './Icons';

interface ProfileDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: {
      name: string;
      imageUrl: string;
      title?: string;
      grade?: string;
      dossier?: {
          employeeCode?: string;
          email?: string;
          grade?: string;
          location?: string;
          experience?: string;
          business?: string;
          segment?: string;
          function?: string;
      }
  };
}

const ProfileDossierModal: React.FC<ProfileDossierModalProps> = ({ isOpen, onClose, participant }) => {
  if (!isOpen) return null;

  const dossier = participant.dossier || {};

  const InfoItem = ({ label, value }: { label: string, value?: string }) => (
      <div className="flex flex-col">
          <span className="text-xs text-r-gray-500 uppercase font-medium tracking-wide">{label}</span>
          <span className="text-sm font-semibold text-r-gray-900 break-words">{value || 'N/A'}</span>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-r-gray-400 hover:text-r-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
        </button>
        
        <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
                <img src={participant.imageUrl} alt={participant.name} className="w-24 h-24 rounded-full border-4 border-r-gray-100 shadow-sm mb-4 object-cover" />
                <h2 className="text-2xl font-heading font-bold text-r-gray-900">{participant.name}</h2>
                <p className="text-r-gray-600 font-medium">{participant.title || participant.grade}</p>
            </div>

            <div className="bg-r-gray-50 rounded-lg p-6 border border-r-gray-200">
                <h3 className="text-sm font-bold text-r-gray-900 mb-4 border-b border-r-gray-200 pb-2">Dossier Details</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <InfoItem label="Employee Code" value={dossier.employeeCode} />
                    <InfoItem label="Email" value={dossier.email} />
                    <InfoItem label="Grade" value={dossier.grade || participant.grade} />
                    <InfoItem label="Location" value={dossier.location} />
                    <InfoItem label="Business" value={dossier.business} />
                    <InfoItem label="Segment" value={dossier.segment} />
                    <InfoItem label="Function" value={dossier.function} />
                    <InfoItem label="Experience" value={dossier.experience} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDossierModal;
