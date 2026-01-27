
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Course, AssignedCourse } from '../types';
import { MoreHorizontalIcon } from './Icons';

interface CourseCardProps {
  course: Course | AssignedCourse;
  isAssignable?: boolean; // Backward compatibility
  onAssign?: (course: Course) => void; // Backward compatibility
  onAssignToMentee?: (course: Course) => void;
  onAssignToProgram?: (course: Course) => void;
  rank?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
    course, 
    isAssignable = false, 
    onAssign, 
    onAssignToMentee, 
    onAssignToProgram,
    rank
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = 'status' in course ? (course as AssignedCourse).status : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssignClick = () => {
    onAssign?.(course as Course);
    setMenuOpen(false);
  }

  const showMenu = isAssignable || onAssignToMentee || onAssignToProgram;

  return (
    <div className="bg-white rounded-lg overflow-hidden group h-full flex flex-col relative">
      <Link to={`/course/${course.id}`} className="relative block">
        <img className="h-40 w-full object-cover" src={course.imageUrl} alt={course.title} />
        
        {/* Rank Overlay */}
        {rank && (
            <div className="absolute top-0 left-0 w-full h-full p-2 pointer-events-none">
                 <span className="font-heading font-black text-6xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] absolute bottom-[-10px] left-0 leading-none">
                    {rank}
                 </span>
            </div>
        )}

        <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {course.tags.map(tag => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    tag.toLowerCase() === 'online' ? 'bg-green-100 text-green-800' :
                    tag.toLowerCase() === 'mandatory' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {tag}
                </span>
            ))}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start flex-grow">
            <div className="flex-grow pr-2">
                <p className="text-xs text-r-gray-500 uppercase tracking-wider">{course.provider}</p>
                <Link to={`/course/${course.id}`} className="mt-1 block text-base font-heading font-semibold text-r-gray-800 group-hover:text-r-blue-dark line-clamp-2 hover:underline">
                    {course.title}
                </Link>
            </div>
             {showMenu && (
                <div className="relative" ref={menuRef}>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }} className="text-r-gray-400 hover:text-r-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <MoreHorizontalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border py-1">
                            {onAssign && (
                                <button onClick={handleAssignClick} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">
                                    Assign to Mentee (Legacy)
                                </button>
                            )}
                            {onAssignToMentee && (
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAssignToMentee(course as Course); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">
                                    Assign to Mentee
                                </button>
                            )}
                            {onAssignToProgram && (
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAssignToProgram(course as Course); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-r-gray-700 hover:bg-r-gray-100">
                                    Assign to Program
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
            {!showMenu && (
                 <button className="text-r-gray-400 hover:text-r-gray-600 cursor-default opacity-50">
                    <MoreHorizontalIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        {status && (
          <div className="mt-2">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                status === 'Completed' ? 'bg-green-100 text-green-800' :
                status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-r-gray-100 text-r-gray-800'
            }`}>
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
