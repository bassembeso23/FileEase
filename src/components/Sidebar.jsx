import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  File,
  Upload,
  Cloud,
  Settings,
  Search
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      name: 'My Files',
      icon: File,
      onClick: () => {
        const element = document.getElementById('my-files');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      name: 'Upload',
      icon: Upload
    },
    {
      name: 'Cloud Accounts',
      icon: Cloud,
      onClick: () => {
        const element = document.getElementById('cloud-accounts');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      name: 'Semantic Search',
      icon: Search,
      path: '/semantic-search',
      onClick: () => navigate('/semantic-search')
    },
  ];

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return false;
  };

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#F2EFE7] text-[#006A71] pt-16 transition-all duration-300 shadow-md z-5 ${isOpen ? 'w-64' : 'w-0 md:w-16'}`}>
      <div className="overflow-y-auto h-full py-4">
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-1 px-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  className={`sidebar-link ${isActive(item) ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <item.icon size={20} />
                  <span className={`${!isOpen && 'md:hidden'} transition-opacity duration-200`}>
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
