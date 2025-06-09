
import React from 'react';
import { 
  Home, 
  File, 
  Upload, 
  Cloud, 
  Settings
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const activeItem = 'Dashboard';
  
  const menuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'My Files', icon: File },
    { name: 'Upload', icon: Upload },
    { name: 'Cloud Accounts', icon: Cloud },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#F2EFE7] text-[#006A71] pt-16 transition-all duration-300 shadow-md z-5 ${isOpen ? 'w-64' : 'w-0 md:w-16'}`}>
      <div className="overflow-y-auto h-full py-4">
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-1 px-3">
                <a 
                  href="#" 
                  className={`sidebar-link ${activeItem === item.name ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
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
