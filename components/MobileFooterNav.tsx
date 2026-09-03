import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarIcon, BookOpenIcon, MoreHorizontalIcon, AwardIcon } from './Icons';

const MobileFooterNav: React.FC = () => {
    const navItems = [
        { label: 'Home', path: '/', icon: <HomeIcon className="w-5 h-5" /> },
        { label: 'Skills', path: '/skills', icon: <AwardIcon className="w-5 h-5" /> },
        { label: 'Live', path: '/mark-attendance', icon: <CalendarIcon className="w-5 h-5" /> },
        { label: 'My Learning', path: '/mylearning', icon: <BookOpenIcon className="w-5 h-5" /> },
        { label: 'More', path: '/more', icon: <MoreHorizontalIcon className="w-5 h-5" /> },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
                                isActive ? 'text-r-blue' : 'text-gray-500 hover:text-r-blue'
                            }`
                        }
                    >
                        <div className="relative">
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight leading-none">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>
            {/* Safe area spacing for mobile browsers if needed */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white"></div>
        </nav>
    );
};

export default MobileFooterNav;