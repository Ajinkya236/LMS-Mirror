
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon, XIcon } from './Icons';

interface SearchableDropdownProps {
  label?: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Select...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 cursor-pointer flex justify-between items-center h-[38px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm truncate ${!selected ? 'text-gray-500' : ''}`}>
          {selected || placeholder}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-200 flex items-center gap-2 bg-gray-50 sticky top-0">
            <SearchIcon className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')}><XIcon className="w-3 h-3 text-gray-400"/></button>
            )}
          </div>
          <ul className="overflow-y-auto flex-grow">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  className={`px-4 py-2 text-sm hover:bg-r-blue-50 hover:text-r-blue cursor-pointer ${
                    selected === option ? 'bg-r-blue-50 text-r-blue font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-gray-500 italic">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
