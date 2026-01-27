import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selectedValue, onValueChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (option: string) => {
        onValueChange(option);
        setIsOpen(false);
    }

    return (
        <div className={`relative inline-block text-left w-full sm:w-48 ${className}`} ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-r-gray-700 bg-white border border-r-gray-300 rounded-md hover:bg-r-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-r-blue"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{selectedValue === 'All' ? label : selectedValue}</span>
                    <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                        <button onClick={() => handleSelect('All')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All</button>
                        {options.map(option => (
                            <button key={option} onClick={() => handleSelect(option)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{option}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
