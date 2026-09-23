import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  ArrowLeft,
  Save,
  RotateCcw,
  Check,
  ShieldAlert,
  Video,
  Music,
  Layers,
  Clock,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { shortsService, ShortsRecommendationConfig } from '../services/shortsService';

export const ShortsSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [config, setConfig] = useState<ShortsRecommendationConfig>(() => shortsService.getConfig());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    shortsService.updateConfig(config);
    setSavedSuccess(true);
    showToast('🚀 Learning Shorts settings successfully saved!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all limits and settings to enterprise defaults?')) {
      const resetConf = shortsService.resetConfigToDefaults();
      setConfig(resetConf);
      showToast('🔄 Settings reset to enterprise defaults');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shorts')}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Back to Shorts"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-6 h-6 text-[#002B7F]" />
                <h1 className="text-xl font-bold text-gray-900">
                  Shorts Settings
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure consumption view thresholds, upload media limits, and moderation filters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shorts/moderation')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Moderation</span>
            </button>
            <button
              onClick={() => navigate('/shorts/tags')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4 text-[#002B7F]" />
              <span>Tags</span>
            </button>
          </div>
        </div>

        {/* Settings Body Form */}
        <div className="space-y-6">
          {/* Section 1: Consumption & Engagement Limits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#002B7F]" />
                <span>Consumption & Analytics View Threshold</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                A Short view is counted only when consumed for this configurable number of seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-700 block">
                  View Count Threshold (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={config.viewThresholdSeconds}
                    onChange={(e) => setConfig({ ...config, viewThresholdSeconds: Number(e.target.value) || 3 })}
                    className="w-32 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#002B7F]"
                  />
                  <span className="text-xs text-gray-500 font-medium">seconds watched</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Initial default is 3 seconds. Repeated pause/resume does not increment views.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Upload File Sizes & Photo Limits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-[#002B7F]" />
                <span>Creation & Ingestion Limits</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file constraints for video, audio, and photo decks uploaded by learners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Max Video Size */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Video className="w-4 h-4 text-[#002B7F]" />
                  <span>Max Video File Size</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={config.maxVideoFileSizeMB}
                    onChange={(e) => setConfig({ ...config, maxVideoFileSizeMB: Number(e.target.value) || 100 })}
                    className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                  />
                  <span className="text-xs text-gray-600 font-semibold">MB</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 100 MB</p>
              </div>

              {/* Max Audio Size */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Music className="w-4 h-4 text-purple-600" />
                  <span>Max Audio File Size</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={config.maxAudioFileSizeMB}
                    onChange={(e) => setConfig({ ...config, maxAudioFileSizeMB: Number(e.target.value) || 25 })}
                    className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                  />
                  <span className="text-xs text-gray-600 font-semibold">MB</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 25 MB</p>
              </div>

              {/* Max Carousel Photos */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Max Carousel Photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={config.maxCarouselPhotos}
                    onChange={(e) => setConfig({ ...config, maxCarouselPhotos: Number(e.target.value) || 20 })}
                    className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                  />
                  <span className="text-xs text-gray-600 font-semibold">Photos</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: up to 20 photos</p>
              </div>
            </div>
          </div>

          {/* Section 3: Tag Moderation Forbidden Keywords */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Tag Moderation Prohibited Keywords</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Custom tags matching these keywords will be immediately blocked from submission.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-700 block">
                Forbidden Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={config.forbiddenKeywords.join(', ')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setConfig({ ...config, forbiddenKeywords: arr });
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
              />
            </div>
          </div>

          {/* Save / Reset Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="px-8 py-3 bg-[#002B7F] hover:bg-blue-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Changes!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl z-[99999] animate-fade-in-up border border-gray-700">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShortsSettingsPage;
