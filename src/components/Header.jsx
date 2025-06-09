import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';

const Header = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { loading, logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  return (
    <header className="bg-[#006A71] text-white fixed top-0 left-0 right-0 z-10 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="p-2 lg:hidden">
            <Menu />
          </button>
          <div className="text-xl font-bold ml-2">FileEase</div>
        </div>

        <div className="hidden md:flex items-center bg-white/20 rounded-md px-3 py-1 flex-1 max-w-md mx-4">
          <Search size={18} className="text-white/70" />
          <input
            type="text"
            placeholder="Quick search files..."
            className="bg-transparent border-none outline-none text-white placeholder:text-white/70 ml-2 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/10">
            <Bell size={20} />
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={loading}
            >
              <div className="w-8 h-8 bg-[#48A6A7] rounded-full flex items-center justify-center">
                <span className="font-semibold text-sm">JD</span>
              </div>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20">
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                  <User size={16} />
                  <span>Profile</span>
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={16} />
                  <span>{loading ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
