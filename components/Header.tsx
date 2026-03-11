
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { SearchIcon, BellIcon, HelpCircleIcon, AppLogoIcon, XIcon, UserIcon, LogOutIcon, CalendarIcon } from './Icons';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRole, setCurrentRole] = useState<'employee' | 'admin'>('employee');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkClasses = "px-4 py-2 rounded-md text-sm font-medium text-r-gray-200 hover:text-white hover:bg-white/10";
  const activeNavLinkClasses = "text-white font-semibold bg-white/20";

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === '/search') {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);
        setIsSearchOpen(true);
    } else {
        setIsSearchOpen(false);
        setSearchQuery('');
    }
    setIsProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
    } else {
        setIsSearchOpen(true);
    }
  };

  return (
    <header className="bg-nav-blue fixed top-0 left-0 right-0 z-50 shadow-md h-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          
          {/* Logo Section */}
          <div className={`flex items-center flex-shrink-0 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0 overflow-hidden md:opacity-100 md:w-auto md:overflow-visible' : 'opacity-100'}`}>
            <NavLink to="/" className="flex items-center space-x-2">
                <AppLogoIcon className="h-8 w-auto text-white" />
                <span className="text-2xl font-heading font-bold text-white">New LMS</span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          {!isSearchOpen && (
            <nav className="hidden md:flex md:space-x-4 absolute left-1/2 transform -translate-x-1/2">
              <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Home</NavLink>
              <NavLink to="/discover" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Discover</NavLink>
              <NavLink to="/mylearning" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>My Learning</NavLink>
              <NavLink to="/quicklinks" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Quick Links</NavLink>
              <NavLink to="/mentor" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Mentoring</NavLink>
            </nav>
          )}

          {/* Search Bar Overlay */}
          {isSearchOpen && (
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-0 md:static md:flex-grow md:justify-center md:mx-8">
                <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl relative">
                    <div className="relative text-white focus-within:text-gray-600">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            name="search"
                            className="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 bg-subnav-blue text-white placeholder-r-gray-300 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition-colors duration-200 shadow-inner"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                         <button 
                            type="button" 
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-white focus:outline-none md:hidden"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {!isSearchOpen && (
                <button 
                    onClick={toggleSearch} 
                    className="p-2 rounded-full text-r-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue"
                    aria-label="Open search"
                >
                <SearchIcon className="h-6 w-6" />
                </button>
            )}
            
            {!isSearchOpen && (
              <button 
                onClick={() => navigate('/events')}
                className="p-2 rounded-full text-r-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue"
                aria-label="Open calendar"
              >
                <CalendarIcon className="h-6 w-6" />
              </button>
            )}

            {isSearchOpen && (
                 <button 
                    onClick={toggleSearch} 
                    className="hidden md:block p-2 rounded-full text-r-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue"
                    aria-label="Close search"
                >
                <XIcon className="h-6 w-6" />
                </button>
            )}

            <button className="p-2 rounded-full text-r-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue">
              <BellIcon className="h-6 w-6" />
            </button>
             <button className="p-2 rounded-full text-r-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue">
              <HelpCircleIcon className="h-6 w-6" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-r-blue transition-transform active:scale-95"
              >
                <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/id/177/100/100" alt="User" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-nav-blue"></span>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] animate-fade-in-up origin-top-right">
                  {/* Role Selectors */}
                  <div className="px-4 py-4 space-y-2">
                    <button 
                      onClick={() => setCurrentRole('employee')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${currentRole === 'employee' ? 'bg-blue-50 ring-1 ring-r-blue/20' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/id/177/100/100" className={`w-12 h-12 rounded-full object-cover border-2 ${currentRole === 'employee' ? 'border-r-blue' : 'border-gray-200 grayscale opacity-60'}`} alt="Employee" />
                        <span className={`text-base font-bold ${currentRole === 'employee' ? 'text-gray-900' : 'text-gray-500'}`}>Employee</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${currentRole === 'employee' ? 'border-r-blue bg-white' : 'border-gray-300'}`}>
                        {currentRole === 'employee' && <div className="w-3.5 h-3.5 rounded-full bg-r-blue"></div>}
                      </div>
                    </button>

                    <button 
                      onClick={() => setCurrentRole('admin')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${currentRole === 'admin' ? 'bg-blue-50 ring-1 ring-r-blue/20' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/id/177/100/100" className={`w-12 h-12 rounded-full object-cover border-2 ${currentRole === 'admin' ? 'border-r-blue' : 'border-gray-200 grayscale opacity-60'}`} alt="Admin" />
                        <span className={`text-base font-bold ${currentRole === 'admin' ? 'text-gray-900' : 'text-gray-500'}`}>Admin</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${currentRole === 'admin' ? 'border-r-blue bg-white' : 'border-gray-300'}`}>
                        {currentRole === 'admin' && <div className="w-3.5 h-3.5 rounded-full bg-r-blue"></div>}
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 mx-4 my-1"></div>

                  {/* Navigation Links */}
                  <div className="py-2">
                    <Link to="/evaluation" className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors group">
                      <div className="p-1.5 rounded-full bg-blue-50 text-r-blue group-hover:bg-r-blue group-hover:text-white transition-colors">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-800">Evaluation</span>
                    </Link>
                    <button className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors group">
                      <div className="p-1.5 rounded-full bg-blue-50 text-r-blue group-hover:bg-r-blue group-hover:text-white transition-colors">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-800">View My Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 mx-4 my-1"></div>

                  <div className="py-2">
                    <button className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors group">
                      <div className="p-1.5 rounded-full bg-blue-50 text-r-blue group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                        <LogOutIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-800">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
