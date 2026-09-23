import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, Sparkles, ShieldCheck, HardDrive, Clock } from 'lucide-react';
import { shortsService, ShortsRecommendationConfig } from '../../services/shortsService';

interface ShortsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShortsConfigModal: React.FC<ShortsConfigModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const [config, setConfig] = useState<ShortsRecommendationConfig>(() => shortsService.getConfig());

  if (!isOpen) return null;

  const handleSave = () => {
    // Normalize weights to sum to 1.0 if needed
    const totalWeight = config.itemItemCFWeight + config.contentBasedWeight + config.userUserCFWeight;
    const normalizedConfig = {
      ...config,
      itemItemCFWeight: Number((config.itemItemCFWeight / (totalWeight || 1)).toFixed(2)),
      contentBasedWeight: Number((config.contentBasedWeight / (totalWeight || 1)).toFixed(2)),
      userUserCFWeight: Number((config.userUserCFWeight / (totalWeight || 1)).toFixed(2))
    };

    shortsService.updateConfig(normalizedConfig);
    onToast('Recommendation & upload configurations updated successfully!');
    onClose();
  };

  const handleReset = () => {
    const def = shortsService.resetConfigToDefaults();
    setConfig(def);
    onToast('Reset configuration to default strategy weights!');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Learning Shorts Engine Settings</h3>
              <p className="text-xs text-gray-500">Tune recommendation weights & upload constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: View Threshold Config */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Clock className="w-4 h-4 text-[#002B7F]" />
              <span>View Count Threshold</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#002B7F] bg-blue-100 px-2.5 py-0.5 rounded-full">
              {config.viewThresholdSeconds} seconds
            </span>
          </div>
          <p className="text-[11px] text-gray-500">
            A view is counted only when a learner watches a Short continuously for this duration.
          </p>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={config.viewThresholdSeconds}
            onChange={(e) => setConfig({ ...config, viewThresholdSeconds: Number(e.target.value) })}
            className="w-full accent-[#002B7F] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>1s (Instant)</span>
            <span>3s (Default)</span>
            <span>15s (Engaged)</span>
          </div>
        </div>

        {/* Section 2: Upload Limits */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <HardDrive className="w-4 h-4 text-[#002B7F]" />
              <span>Max Video Upload Size</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#002B7F] bg-blue-100 px-2.5 py-0.5 rounded-full">
              {config.maxVideoFileSizeMB} MB
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={config.maxVideoFileSizeMB}
            onChange={(e) => setConfig({ ...config, maxVideoFileSizeMB: Number(e.target.value) })}
            className="w-full accent-[#002B7F] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>20 MB</span>
            <span>100 MB (Default)</span>
            <span>500 MB</span>
          </div>
        </div>

        {/* Section 3: Personalized Recommendation Weights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recommendation Strategy Weights</span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              Total: {((config.itemItemCFWeight + config.contentBasedWeight + config.userUserCFWeight) * 100).toFixed(0)}%
            </span>
          </div>

          {/* 1. Item-Item CF Weight (Highest default) */}
          <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="flex justify-between text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#002B7F]" />
                Item-Item Collaborative Filtering
                <span className="text-[10px] bg-[#002B7F] text-white px-1.5 py-0.2 rounded font-bold">Highest Priority</span>
              </span>
              <span className="font-mono font-bold text-[#002B7F]">{(config.itemItemCFWeight * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-gray-500">
              Learners who engaged with this Short also explored related technical topics.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.itemItemCFWeight}
              onChange={(e) => setConfig({ ...config, itemItemCFWeight: Number(e.target.value) })}
              className="w-full accent-[#002B7F] cursor-pointer"
            />
          </div>

          {/* 2. Content-Based Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="flex justify-between text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Content-Based Recommendation
              </span>
              <span className="font-mono font-bold text-emerald-700">{(config.contentBasedWeight * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-gray-500">
              Tag affinity matching user's watched learning competencies and skills.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.contentBasedWeight}
              onChange={(e) => setConfig({ ...config, contentBasedWeight: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 3. User-User CF Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="flex justify-between text-xs font-semibold text-gray-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                User-User Collaborative Filtering
              </span>
              <span className="font-mono font-bold text-purple-700">{(config.userUserCFWeight * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-gray-500">
              Cohort engagement patterns across peer engineers in matching roles.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.userUserCFWeight}
              onChange={(e) => setConfig({ ...config, userUserCFWeight: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsConfigModal;
