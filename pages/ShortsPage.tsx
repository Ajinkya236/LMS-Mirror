import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShortsViewer from '../components/shorts/ShortsViewer';

export const ShortsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shortId = searchParams.get('short') || searchParams.get('id') || undefined;
  const fromSource = searchParams.get('from') || undefined;

  const orderedShortIds = useMemo(() => {
    try {
      const saved = sessionStorage.getItem('jio_shorts_search_order');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }, [shortId]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-950">
      <ShortsViewer initialShortId={shortId} orderedShortIds={orderedShortIds} fromSource={fromSource} />
    </div>
  );
};

export default ShortsPage;
