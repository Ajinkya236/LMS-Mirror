// components/forms/DeleteConfirmModal.tsx
import React from 'react';
import { AlertTriangle, Trash2, Archive, RotateCcw, X } from 'lucide-react';
import { LMSForm } from '../../types/forms';

export type ConfirmationType = 'delete' | 'archive' | 'restore';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: ConfirmationType;
  form: LMSForm | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  type,
  form,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !form) return null;

  const isDelete = type === 'delete';
  const isArchive = type === 'archive';
  const isRestore = type === 'restore';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDelete
                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                : isArchive
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isDelete && <Trash2 className="w-5 h-5" />}
            {isArchive && <Archive className="w-5 h-5" />}
            {isRestore && <RotateCcw className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              {isDelete && 'Delete Form Permanently'}
              {isArchive && 'Archive Form'}
              {isRestore && 'Restore Form to Draft'}
            </h3>
            <p className="text-xs text-slate-500">
              Target ID: <span className="font-mono font-bold text-slate-700">{form.fid}</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <p className="text-xs font-bold text-slate-800 line-clamp-1">{form.title}</p>
          <p className="text-[11px] text-slate-500">
            Type: {form.type} • Status: {form.status} • Responses: {form.responseCount}
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isDelete &&
            'Are you sure you want to permanently delete this form? This action cannot be undone and all associated responses and analytics will be permanently erased.'}
          {isArchive &&
            'Archiving this form will immediately deactivate its shareable link and move it out of active reporting, but its historical response records will be preserved.'}
          {isRestore &&
            'Restoring this form will reactivate it as a Draft in your active forms list, allowing you to edit or re-publish it.'}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-extrabold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isDelete
                ? 'bg-rose-600 hover:bg-rose-700'
                : isArchive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isDelete && <Trash2 className="w-3.5 h-3.5" />}
            {isArchive && <Archive className="w-3.5 h-3.5" />}
            {isRestore && <RotateCcw className="w-3.5 h-3.5" />}
            <span>
              {isDelete && 'Yes, Delete Form'}
              {isArchive && 'Yes, Archive Form'}
              {isRestore && 'Yes, Restore Form'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
