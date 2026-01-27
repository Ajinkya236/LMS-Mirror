
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import CourseCard from './CourseCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CourseRowProps {
  title: string;
  courses: Course[];
  bgClass?: string;
  showRank?: boolean;
  action?: React.ReactNode;
}

const CourseRow: React.FC<CourseRowProps> = ({ title, courses, bgClass = "", showRank = false, action }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const navigate = useNavigate();

  // Responsive logic to determine how many items to show
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };

    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length);
  };

  const handleViewAll = (e: React.MouseEvent) => {
      e.preventDefault();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/category/${slug}`, { state: { title, courses } });
  };

  // Calculate visible items for circular effect
  const visibleItems = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const index = (currentIndex + i) % courses.length;
    visibleItems.push({ course: courses[index], originalIndex: index });
  }

  if (!courses || courses.length === 0) return null;

  return (
    <div className={`py-8 ${bgClass}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-heading font-bold text-r-gray-900">{title}</h2>
            {action}
          </div>
          <button 
            onClick={handleViewAll} 
            className="text-sm font-semibold text-r-blue hover:text-r-blue-dark hover:underline transition-colors"
          >
            View all
          </button>
        </div>

        <div className="relative group">
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 rounded-full bg-white shadow-lg border border-r-gray-200 text-r-gray-700 hover:text-r-blue hover:border-r-blue transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleItems.map(({ course, originalIndex }, idx) => (
              <div key={`${course.id}-${idx}`} className="transition-all duration-300 h-full">
                <CourseCard 
                    course={course} 
                    rank={showRank ? originalIndex + 1 : undefined}
                />
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 rounded-full bg-white shadow-lg border border-r-gray-200 text-r-gray-700 hover:text-r-blue hover:border-r-blue transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseRow;
