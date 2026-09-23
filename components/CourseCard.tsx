import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Course, AssignedCourse } from '../types';
import { MoreHorizontalIcon } from './Icons';
import { 
  Play, 
  Bookmark, 
  Info, 
  User, 
  Share2, 
  Clock, 
  X,
  CheckCircle2 
} from 'lucide-react';
import SelectCollectionModal from './SelectCollectionModal';
import { collectionsService } from '../services/collectionsService';

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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSelectCollectionOpen, setIsSelectCollectionOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
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

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStartResume = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    navigate(`/course/${course.id}`);
  };

  const handleOpenCollectionModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setIsSelectCollectionOpen(true);
  };

  const handleSaveToWatchLater = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    const added = collectionsService.addToWatchLater(course.id, {
      title: course.title,
      imageUrl: course.imageUrl,
      provider: course.provider
    });
    triggerToast(added ? 'Added to Watch Later' : 'Removed from Watch Later');
  };

  const handleAssignToMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    triggerToast(`Assigned "${course.title}" to your learning roadmap`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/course/${course.id}`);
      triggerToast(`Link to "${course.title}" copied to clipboard!`);
    } else {
      triggerToast(`Course "${course.title}" link ready to share!`);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-xl group h-full flex flex-col relative border border-gray-100 shadow-xs hover:shadow-md transition-all ${menuOpen ? 'z-30' : 'z-0'}`}>
        <Link to={`/course/${course.id}`} className="relative block overflow-hidden rounded-t-xl">
          <img className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={course.imageUrl} alt={course.title} />
          
          {/* Rank Overlay */}
          {rank && (
              <div className="absolute top-0 left-0 w-full h-full p-2 pointer-events-none">
                   <span className="font-heading font-black text-6xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] absolute bottom-[-10px] left-0 leading-none">
                      {rank}
                   </span>
              </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
              {course.tags.map(tag => (
                  <span key={tag} className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                      tag.toLowerCase() === 'online' ? 'bg-[#005952] text-white' :
                      tag.toLowerCase() === 'mandatory' ? 'bg-amber-600 text-white' :
                      'bg-[#002B7F] text-white'
                  }`}>
                      {tag}
                  </span>
              ))}
          </div>

          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
            2h 12m
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-grow justify-between">
          <div className="flex justify-between items-start">
              <div className="flex-grow pr-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{course.provider}</p>
                  <Link to={`/course/${course.id}`} className="mt-1 block text-sm sm:text-base font-heading font-semibold text-gray-900 group-hover:text-[#0a47d0] line-clamp-2 transition-colors">
                      {course.title}
                  </Link>
              </div>

              {/* Three dots dropdown button */}
              <div className="relative flex-shrink-0" ref={menuRef}>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }} 
                    className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    title="Course Options"
                    aria-label="Course Options"
                  >
                      <MoreHorizontalIcon className="w-5 h-5" />
                  </button>

                  {/* Dark Dropdown Menu matching Screenshot 1 & 6 */}
                  {menuOpen && (
                       <div className="absolute right-0 top-full mt-1 w-52 bg-[#374151] text-white rounded-xl shadow-2xl z-50 border border-white/10 py-1.5 animate-scale-up">
                          {/* 1. Start/Resume */}
                          <button 
                            onClick={handleStartResume}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <Play className="w-4 h-4 text-gray-300 fill-gray-300" />
                              <span>Start/Resume</span>
                          </button>

                          {/* 2. Save to Watch Later */}
                          <button 
                            onClick={handleSaveToWatchLater}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <Clock className="w-4 h-4 text-gray-300" />
                              <span>Save to Watch Later</span>
                          </button>

                          {/* 3. Save to a Collection */}
                          <button 
                            onClick={handleOpenCollectionModal}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <Bookmark className="w-4 h-4 text-gray-300" />
                              <span>Save to a Collection</span>
                          </button>

                          {/* 4. View Course details */}
                          <button 
                            onClick={handleStartResume}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <Info className="w-4 h-4 text-gray-300" />
                              <span>View Course details</span>
                          </button>

                          {/* 5. Assign to Me */}
                          <button 
                            onClick={handleAssignToMe}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <User className="w-4 h-4 text-gray-300" />
                              <span>Assign to Me</span>
                          </button>

                          {/* 6. Share */}
                          <button 
                            onClick={handleShare}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                              <Share2 className="w-4 h-4 text-gray-300" />
                              <span>Share</span>
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {status && (
            <div className="mt-3">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  status === 'Completed' ? 'bg-green-100 text-green-800' :
                  status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification matching Screenshot 4, 6 */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-3 z-[9999] animate-fade-in-up">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Select Collection Modal */}
      <SelectCollectionModal
        isOpen={isSelectCollectionOpen}
        onClose={() => setIsSelectCollectionOpen(false)}
        course={{
          id: course.id,
          title: course.title,
          imageUrl: course.imageUrl,
          provider: course.provider
        }}
        onToast={triggerToast}
      />
    </>
  );
};

export default CourseCard;
