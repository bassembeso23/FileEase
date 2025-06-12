import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, SlidersHorizontal, LogOut, User, ChevronDown, X, Settings, RotateCcw, Loader2 } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';
import { useCloud } from '../contexts/CloudContext';
import { customFetch } from '../services/api';
import { toast } from 'react-toastify';

const Header = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [synonymQuery, setSynonymQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSynonymSearch, setIsSynonymSearch] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [originalFiles, setOriginalFiles] = useState([]);
  const { loading, logout } = useLogout();
  const { selectedCloud, setFiles, files } = useCloud();

  // Fetch original files when component mounts or cloud service changes
  useEffect(() => {
    const fetchOriginalFiles = async () => {
      try {
        let endpoint;
        if (selectedCloud === 'Dropbox') {
          endpoint = '/dropbox/files';
        } else {
          endpoint = '/files';
        }

        const response = await customFetch({
          endpoint,
          requiresAuth: true
        });

        if (response && Array.isArray(response)) {
          setOriginalFiles(response);
          setFiles(response);
        }
      } catch (error) {
        console.error('Failed to fetch original files:', error);
      }
    };

    fetchOriginalFiles();
  }, [selectedCloud, setFiles]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      setFiles(originalFiles);
      setSearchQuery('');
      setSynonymQuery('');
    } catch (error) {
      toast.error(error.message || 'Failed to restore files list');
    } finally {
      setIsResetting(false);
    }
  };

  // Default search function
  const handleDefaultSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await customFetch({
        endpoint: `/files/search/?q=${encodeURIComponent(query)}`,
        method: 'GET',
        requiresAuth: true
      });

      if (response && Array.isArray(response)) {
        setFiles(response);
        toast.success('Search completed successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to perform search');
    } finally {
      setIsSearching(false);
    }
  };

  // Fuzzy search function
  const handleFuzzySearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Determine the endpoint based on the selected cloud service
      const endpoint = selectedCloud === 'Dropbox'
        ? `/dropbox/fuzzy-search/advanced/?q=${encodeURIComponent(query)}&field=name`
        : `/drive/fuzzy-search/advanced/?q=${encodeURIComponent(query)}&field=name`;

      const response = await customFetch({
        endpoint,
        method: 'GET',
        requiresAuth: true
      });

      if (response && response.results && Array.isArray(response.results)) {
        setFiles(response.results);
        toast.success('Search completed successfully');
      } else if (response && Array.isArray(response)) {
        setFiles(response);
        toast.success('Fuzzy search completed successfully');
      } else {
        throw new Error('Invalid response format from fuzzy search');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to perform fuzzy search');
      setFiles([]); // Clear files on error
    } finally {
      setIsSearching(false);
    }
  };

  // Synonym search function
  const handleSynonymSearch = async (query) => {
    if (!query.trim()) return;

    setIsSynonymSearch(true);
    try {
      // Determine the endpoint based on the selected cloud service
      const endpoint = selectedCloud === 'Dropbox'
        ? `/dropbox/search-synonyms/?q=${encodeURIComponent(query)}`
        : `/drive/search-synonyms/?q=${encodeURIComponent(query)}`;

      const response = await customFetch({
        endpoint,
        method: 'GET',
        requiresAuth: true
      });

      if (response && response.results && Array.isArray(response.results)) {
        setFiles(response.results);
        toast.success('Search completed successfully');
      } else if (response && Array.isArray(response)) {
        setFiles(response);
        toast.success('Search completed successfully');
      } else {
        throw new Error('Invalid response format from synonym search');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to perform synonym search');
      setFiles([]); // Clear files on error
    } finally {
      setIsSynonymSearch(false);
    }
  };

  const handleModalClose = () => {
    setShowSearchModal(false);
    setSynonymQuery('');
  };

  // Check if current files are different from original files
  const hasFileChanges = JSON.stringify(files) !== JSON.stringify(originalFiles);

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
            placeholder="Search files by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSearching) {
                handleDefaultSearch(searchQuery);
              }
            }}
            className="bg-transparent border-none outline-none text-white placeholder:text-white/70 ml-2 w-full"
          />
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-1 hover:bg-white/10 rounded-md ml-2"
            title="Advanced Search"
            disabled={isResetting}
          >
            <SlidersHorizontal size={22} className="text-white/70" />
          </button>
          {hasFileChanges && (
            <button
              onClick={handleReset}
              className="p-1 hover:bg-white/10 rounded-md ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset to all files"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 size={22} className="text-white/70 animate-spin" />
              ) : (
                <RotateCcw size={22} className="text-white/70" />
              )}
            </button>
          )}
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

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Search</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuzzy Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search terms..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#48A6A7] focus:border-transparent text-gray-900"
                    disabled={isSearching || isSynonymSearch}
                  />
                  <button
                    onClick={() => handleFuzzySearch(searchQuery)}
                    disabled={!searchQuery.trim() || isSearching || isSynonymSearch}
                    className={`px-4 py-2 rounded-md text-white ${!searchQuery.trim() || isSearching || isSynonymSearch
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#48A6A7] hover:bg-[#006A71]'
                      }`}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Synonym Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={synonymQuery}
                    onChange={(e) => setSynonymQuery(e.target.value)}
                    placeholder="Enter search terms..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#48A6A7] focus:border-transparent text-gray-900"
                    disabled={isSearching || isSynonymSearch}
                  />
                  <button
                    onClick={() => handleSynonymSearch(synonymQuery)}
                    disabled={!synonymQuery.trim() || isSearching || isSynonymSearch}
                    className={`px-4 py-2 rounded-md text-white ${!synonymQuery.trim() || isSearching || isSynonymSearch
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#48A6A7] hover:bg-[#006A71]'
                      }`}
                  >
                    {isSynonymSearch ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
