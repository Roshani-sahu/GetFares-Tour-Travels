import React from "react";
import { FaBars } from "react-icons/fa";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Sidebar Toggle */}
        <button
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-900 text-lg"
        >
          <FaBars />
        </button>

        {/* Search */}
        <div className="hidden md:block relative w-80">
          <input
            type="text"
            placeholder="Search leads, bookings, customers..."
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Notification */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <i className="fa-regular fa-bell text-xl"></i>

          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* Quick Action */}
        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">

          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-plus"></i>
          </div>

          <span className="hidden sm:inline">
            Quick Action
          </span>

        </button>

      </div>

    </header>
  );
};

export default Header;