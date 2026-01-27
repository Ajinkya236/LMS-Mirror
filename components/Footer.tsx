
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-12">
      <div className="max-w-screen-2xl mx-auto py-4 px-4 sm:px-6 lg:px-8 border-t">
        <div className="flex justify-end items-center text-sm text-r-gray-500">
          <div className="flex space-x-4">
            <a href="#" className="hover:text-r-blue">Policies</a>
            <a href="#" className="hover:text-r-blue">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
