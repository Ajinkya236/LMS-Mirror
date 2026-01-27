import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';

export interface BreadcrumbItem {
  label: string;
  path: string;
  // FIX: Add optional state property to support passing state through Link.
  state?: any;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <li key={item.path + item.label} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-r-gray-400 mx-1" />
            )}
            <Link
              to={item.path}
              // FIX: Pass the state property to the Link component.
              state={item.state}
              className={`text-sm font-medium ${
                index === items.length - 1
                  ? 'text-r-gray-500' // Current page
                  : 'text-r-blue-dark hover:text-r-blue' // Ancestor pages
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;