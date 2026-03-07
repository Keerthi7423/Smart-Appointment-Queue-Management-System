"use client";

import { useState } from 'react';
import { Search, MessageSquare, Bell, User, LogOut } from 'lucide-react';
import { logout } from '@/utils/auth';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const menuItems = ['Dashboard', 'Guests', 'Reservations', 'Rooms', 'Restaurant'];

  return (
    <nav className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg mt-4 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold tracking-wider text-indigo-400">Integrate</span>
      </div>

      {/* Menu Items */}
      <div className="hidden md:flex items-center space-x-6">
        {menuItems.map((item, idx) => (
          <a
            key={idx}
            href={`#${item.toLowerCase()}`}
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${item === 'Dashboard' ? 'text-indigo-400' : 'text-gray-300'
              }`}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-5">
        <button className="text-gray-300 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="text-gray-300 hover:text-white transition-colors relative">
          <MessageSquare size={20} />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </button>
        <button className="text-gray-300 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-gray-800"></span>
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <User size={18} className="text-gray-300" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-50 transition-all">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
