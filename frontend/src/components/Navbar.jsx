import { Search, MessageSquare, Bell, User } from 'lucide-react';

export default function Navbar() {
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
            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
              item === 'Dashboard' ? 'text-indigo-400' : 'text-gray-300'
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
        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-colors">
          <User size={18} className="text-gray-300" />
        </div>
      </div>
    </nav>
  );
}
