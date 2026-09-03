import React from 'react';

export type SkillsTab = 'home' | 'explore' | 'my-team' | 'leaderboard' | 'skill-admin';

interface SkillsSubHeaderProps {
  activeTab: SkillsTab;
  onSelectTab: (tab: SkillsTab) => void;
}

const SkillsSubHeader: React.FC<SkillsSubHeaderProps> = ({ activeTab, onSelectTab }) => {
  const navLinkClasses = "px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap";
  const activeClasses = "text-white bg-white/20 shadow-xs border-b-2 border-white";
  const inactiveClasses = "text-r-gray-200 hover:text-white hover:bg-white/10";

  return (
    <div className="border-b border-white/10 bg-subnav-blue sticky top-16 z-40 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 overflow-x-auto no-scrollbar space-x-6 sm:space-x-8">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <h1 className="text-xl font-heading font-extrabold text-white tracking-tight">Skills</h1>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`${navLinkClasses} ${activeTab === 'home' ? activeClasses : inactiveClasses}`}
              title="My Skills"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>My Skills</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className={`${navLinkClasses} ${activeTab === 'explore' ? activeClasses : inactiveClasses}`}
              title="Explore Skills"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Explore</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('my-team')}
              className={`${navLinkClasses} ${activeTab === 'my-team' ? activeClasses : inactiveClasses}`}
              title="My Team"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>My Team</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('leaderboard')}
              className={`${navLinkClasses} ${activeTab === 'leaderboard' ? activeClasses : inactiveClasses}`}
              title="Leaderboard & Points"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.49 10.1c-.772-.564-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.52-4.674z" />
              </svg>
              <span>Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('skill-admin')}
              className={`${navLinkClasses} ${activeTab === 'skill-admin' ? activeClasses : inactiveClasses}`}
              title="Skill Admin Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Skill Admin</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SkillsSubHeader;
