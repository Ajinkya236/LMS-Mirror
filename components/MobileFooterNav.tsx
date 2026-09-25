import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, UserIcon } from './Icons';
import { Film, Compass } from 'lucide-react';

const MobileFooterNav: React.FC = () => {
    const location = useLocation();

    // Hide footer navigation on the full-screen camera create short page
    if (location.pathname === '/shorts/create') {
        return null;
    }

    const navItems = [
        { label: 'Home', path: '/', icon: <HomeIcon className="w-5 h-5" /> },
        { label: 'Discover', path: '/discover', icon: <Compass className="w-5 h-5" /> },
        { label: 'My Learning', path: '/mylearning', icon: <BookOpenIcon className="w-5 h-5" /> },
        {
            label: 'Shorts',
            path: '/shorts',
            isSpecial: true,
            icon: (
                <div className="relative">
                    <Film className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
            )
        },
        { label: 'Profile', path: '/skills', icon: <UserIcon className="w-5 h-5" /> },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-white/10 z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
                                isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-gray-200'
                            }`
                        }
                    >
                        <div className="relative">
                            {item.icon}
                        </div>
                        <span className="text-[10px] uppercase tracking-tight leading-none">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>
            {/* Safe area spacing for mobile browsers if needed */}
            <div className="h-[env(safe-area-inset-bottom)] bg-slate-950"></div>
        </nav>
    );
};

export default MobileFooterNav;