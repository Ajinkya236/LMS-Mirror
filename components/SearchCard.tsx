
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { MentorSearchItem } from '../types';
import { MoreHorizontalIcon } from './Icons';

interface SearchCardProps {
  item: MentorSearchItem;
  onAssignToMe: (item: MentorSearchItem) => void;
  onAssignToTeam: (item: MentorSearchItem) => void;
  onApplyAsMentor: (item: MentorSearchItem) => void;
  onSave: (item: MentorSearchItem) => void;
  onShare: (item: MentorSearchItem) => void;
  userRole: 'mentor' | 'mentee';
}

const SearchCard: React.FC<SearchCardProps> = ({ item, onAssignToMe, onAssignToTeam, onApplyAsMentor, onSave, onShare, userRole }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const tagClasses = item.type === 'topic'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-purple-100 text-purple-800';

    const cardLink = item.type === 'topic' ? `/mentor/topic/${item.id}` : `/program/${item.id}`;

    const renderMenu = () => (
        <div ref={menuRef} className="relative">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-1 rounded-full text-r-gray-400 hover:bg-r-gray-100">
                <MoreHorizontalIcon className="w-5 h-5" />
            </button>
            {menuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                    <button onClick={(e) => { e.preventDefault(); onAssignToMe(item); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">Assign to Me</button>
                    <button onClick={(e) => { e.preventDefault(); onAssignToTeam(item); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">Assign to Team</button>
                    <button onClick={(e) => { e.preventDefault(); onApplyAsMentor(item); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">Apply as a Mentor</button>
                    <button onClick={(e) => { e.preventDefault(); onSave(item); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">Save</button>
                    {item.isShareable !== false && (
                        <button onClick={(e) => { e.preventDefault(); onShare(item); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">Share</button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <Link to={cardLink} state={{ userRole }} className="block h-full">
            <div className="bg-white rounded-lg overflow-hidden group h-full flex flex-col shadow-sm border border-r-gray-200 hover:shadow-lg transition-shadow">
              <div className="relative">
                <img className="h-40 w-full object-cover" src={item.imageUrl} alt={item.title} />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagClasses}`}>
                            {item.type === 'topic' ? 'Topic' : 'Mentoring Program'}
                        </span>
                        <h3 className="mt-2 text-base font-heading font-semibold text-r-gray-800 group-hover:text-r-blue-dark">{item.title}</h3>
                    </div>
                    {item.type === 'program' && renderMenu()}
                </div>
                <p className="mt-2 text-sm text-r-gray-600 flex-grow">{item.description}</p>
              </div>
            </div>
        </Link>
    );
};

export default SearchCard;
