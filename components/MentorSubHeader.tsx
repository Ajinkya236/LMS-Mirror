import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const MentorSubHeader: React.FC = () => {
    const location = useLocation();
    
    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-r-gray-300 hover:text-white";
    const activeNavLinkClasses = "text-white border-b-2 border-white font-semibold";
    
    const path = location.pathname;
    const roleInEngagement = location.state?.userRole;

    const isMenteeFlow = path.startsWith('/mentor/mentee-journey') ||
                         path.startsWith('/mentor/search') ||
                         path.startsWith('/mentor/topic') ||
                         (path.startsWith('/mentor/engagement') && roleInEngagement === 'mentee') ||
                         (path.startsWith('/program-engagement') && roleInEngagement === 'mentee') ||
                         (path.startsWith('/program/') && roleInEngagement === 'mentee');

    const isMentorFlow = (path.startsWith('/mentor/mentor-journey') ||
                         path.startsWith('/mentor/assign-courses') ||
                         path.startsWith('/mentor/program-search') ||
                         (path.startsWith('/mentor/engagement') && roleInEngagement === 'mentor') ||
                         (path.startsWith('/program-engagement') && roleInEngagement === 'mentor') ||
                         (path.startsWith('/program/') && roleInEngagement === 'mentor')) && !path.startsWith('/mentor/program-manager');

    const isProgramManagerFlow = path.startsWith('/mentor/program-manager');

    const isOverviewActive = !isMenteeFlow && !isMentorFlow && !isProgramManagerFlow && path.startsWith('/mentor');

    return (
        <div className="border-b border-b-white/10 bg-subnav-blue sticky top-16 z-40">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-14">
                    <div className="flex items-center space-x-2">
                       <h1 className="text-2xl font-heading font-bold text-white">Mentoring</h1>
                    </div>
                    <nav className="ml-10 flex space-x-4">
                        <NavLink to="/mentor" end className={`${navLinkClasses} ${isOverviewActive ? activeNavLinkClasses : ''}`}>Overview</NavLink>
                        <NavLink to="/mentor/mentee-journey" className={`${navLinkClasses} ${isMenteeFlow ? activeNavLinkClasses : ''}`}>Mentee Journey</NavLink>
                        <NavLink to="/mentor/mentor-journey" className={`${navLinkClasses} ${isMentorFlow ? activeNavLinkClasses : ''}`}>Mentor Journey</NavLink>
                        <NavLink to="/mentor/program-manager" className={`${navLinkClasses} ${isProgramManagerFlow ? activeNavLinkClasses : ''}`}>Program Manager</NavLink>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MentorSubHeader;