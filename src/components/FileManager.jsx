import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useCloud } from '../contexts/CloudContext';
import { customFetch } from '../services/api';
import Pagination from './Pagination';
import {
  Grid,
  List,
  FileText,
  Image,
  File,
  Download,
  Trash2,
  MoreHorizontal,
  Upload,
  Folder,
  Video,
  X,
  Eye,
  Search
} from 'lucide-react';

const FileManager = () => {
  const {
    files: allFiles,
    loading,
    error: cloudError,
    fetchFiles,
    selectedCloud,
    setFiles
  } = useCloud();

  const [viewMode, setViewMode] = useState('grid');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Single effect to handle file fetching and cleanup
  useEffect(() => {
    const initializeFiles = async () => {
      if (selectedCloud) {
        setFiles([]); // Clear files when cloud provider changes
        await fetchFiles(); // Fetch new files for the selected cloud
      }
    };

    initializeFiles();

    // Cleanup function to clear files when component unmounts
    return () => {
      setFiles([]);
    };
  }, [selectedCloud]); // Only depend on selectedCloud changes

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchQuery('');
      setIsSearching(false);
      try {
        await fetchFiles();
      } catch (error) {
        setDeleteError(error.message || 'Failed to fetch files');
      }
      return;
    }

    try {
      setIsSearching(true);
      let endpoint;

      const encodedQuery = encodeURIComponent(query.trim());

      if (selectedCloud === 'Dropbox') {
        endpoint = `/dropbox/fuzzy-search/?q=${encodedQuery}`;
      } else {
        endpoint = `/drive/fuzzy-search/?q=${encodedQuery}`;
      }

      const response = await customFetch({
        endpoint,
        requiresAuth: true
      });

      // Handle the specific response format with results array
      if (response && Array.isArray(response.results)) {
        setFiles(response.results);
      } else {
        setFiles([]);
        console.error('Invalid response format from search API');
      }

      setSearchQuery(query);
    } catch (error) {
      setDeleteError(error.message || 'Failed to search files');
      setFiles([]); // Reset files on error
    } finally {
      setIsSearching(false);
    }
  }, [selectedCloud, fetchFiles, setFiles]);

  const filteredFiles = useMemo(() => {
    if (!Array.isArray(allFiles)) {
      console.error('allFiles is not an array:', allFiles);
      return [];
    }

    return allFiles.filter(file => {
      const matchesFileType = fileTypeFilter === 'all' ||
        (fileTypeFilter === 'folder' && (file.mimeType === 'application/vnd.google-apps.folder' || file.mimeType === 'folder')) ||
        (fileTypeFilter === 'image' && (file.mimeType.startsWith('image/') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/))) ||
        (fileTypeFilter === 'video' && (file.mimeType.startsWith('video/') || file.name.toLowerCase().match(/\.(mp4|avi|mov|wmv|flv|mkv)$/))) ||
        (fileTypeFilter === 'document' && (file.mimeType.includes('document') || file.name.toLowerCase().match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/)));

      if (dateFilter === 'all') return matchesFileType;

      const fileDate = new Date(file.modifiedTime);
      const today = new Date();

      switch (dateFilter) {
        case 'today':
          return matchesFileType && fileDate.toDateString() === today.toDateString();
        case 'week': {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return matchesFileType && fileDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return matchesFileType && fileDate >= monthAgo;
        }
        default:
          return matchesFileType;
      }
    });
  }, [allFiles, fileTypeFilter, dateFilter]);

  const currentPageFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFiles.slice(startIndex, endIndex);
  }, [filteredFiles, currentPage, itemsPerPage]);

  const handleFileUpload = useCallback(async (files) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        let endpoint = '/files/upload/';
        if (selectedCloud === 'Dropbox') {
          endpoint = '/dropbox/upload/';
        }

        await customFetch({
          endpoint,
          method: 'POST',
          body: formData,
          requiresAuth: true,
          shouldStringify: false,
          addContentType: false,
          options: {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        });
      }

      await fetchFiles();
    } catch (error) {
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedCloud, fetchFiles]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  const handlePageChange = useCallback((newPage) => {
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [filteredFiles.length, itemsPerPage]);

  // Memoize file icon component
  const getFileIcon = useCallback((mimeType) => {
    if (mimeType === 'file') {
      return <File size={24} className="text-gray-500" />;
    }
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder size={24} className="text-yellow-500" />;
    }
    if (mimeType.startsWith('image/')) {
      return <Image size={24} className="text-blue-500" />;
    }
    if (mimeType.startsWith('video/')) {
      return <Video size={24} className="text-purple-500" />;
    }
    if (mimeType.includes('document')) {
      return <FileText size={24} className="text-blue-400" />;
    }
    return <File size={24} className="text-gray-500" />;
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteFile = async (fileId, fileName) => {
    try {
      let endpoint;
      let options = {
        method: 'DELETE',
        requiresAuth: true
      };

      if (selectedCloud === 'Dropbox') {
        endpoint = `/dropbox/delete/?path=/${fileName}`;
      } else {
        endpoint = `/files/${fileId}/delete/`;
      }

      await customFetch({
        endpoint,
        ...options
      });

      // Refresh the file list after successful deletion
      await fetchFiles();
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete file');
    }
  };

  const confirmDelete = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  if (loading) return <div className="text-center p-4">Loading files...</div>;
  if (cloudError) return <div className="text-center p-4 text-red-500">{cloudError}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#006A71]">My Files</h2>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#48A6A7] text-white' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-2 ${viewMode === 'list' ? 'bg-[#48A6A7] text-white' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Filter by:</span>
        <div className="relative flex-1 md:flex-none flex gap-2">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => {
              const newValue = e.target.value;
              setSearchQuery(newValue);
              if (!newValue.trim()) {
                fetchFiles();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
            className="w-full md:w-64 px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#48A6A7]"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="px-4 py-1 bg-[#48A6A7] text-white rounded-md hover:bg-[#006A71] transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            Search
          </button>
        </div>

        <select
          className="border rounded-md px-3 py-1 text-sm"
          value={fileTypeFilter}
          onChange={(e) => {
            setFileTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Types</option>
          <option value="folder">Folders</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>

        <select
          className="border rounded-md px-3 py-1 text-sm"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Any Date</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {isSearching ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#48A6A7] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Searching files...</p>
        </div>
      ) : (
        <>
          {/* Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${dragActive ? 'border-[#48A6A7] bg-[#F2EFE7]' : 'border-[#9ACBD0] hover:bg-[#F2EFE7]'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={32} className="mx-auto text-[#48A6A7] mb-2" />
              <p className="text-gray-600">
                Drag and drop files here or{' '}
                <span className="text-[#006A71] font-medium">browse files</span>
              </p>
            </label>

            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#48A6A7] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-500">
                <X size={16} />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && fileToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{fileToDelete.name}"? This action cannot be undone.
                </p>
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {deleteError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setFileToDelete(null);
                      setDeleteError(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteFile(fileToDelete.id, fileToDelete.name)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentPageFiles.map(file => (
                  <div key={file.id} className="card hover:border-[#9ACBD0] border border-transparent p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      {getFileIcon(file.mimeType)}
                      <div className="dropdown relative">
                        <button
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            const dropdown = e.currentTarget.nextElementSibling;
                            dropdown.classList.toggle('hidden');
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden">
                          <button
                            onClick={() => confirmDelete(file)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-800 mb-1 truncate" title={file.name}>{file.name}</h3>
                    <div className="text-xs text-gray-500 mb-2">
                      {file.size ? formatFileSize(file.size) : 'Folder'} • {formatDate(file.modifiedTime)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedCloud === 'Dropbox' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                        {selectedCloud}
                      </span>

                      <div className="flex gap-1">
                        <a
                          href={file.webViewLink || file.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Eye size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFiles.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredFiles.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-3 text-gray-600 text-sm font-medium">Name</th>
                      <th className="p-3 text-gray-600 text-sm font-medium">Type</th>
                      <th className="p-3 text-gray-600 text-sm font-medium">Size</th>
                      <th className="p-3 text-gray-600 text-sm font-medium">Modified</th>
                      <th className="p-3 text-gray-600 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageFiles.map(file => (
                      <tr key={file.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.mimeType)}
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500">
                          {file.mimeType === 'application/vnd.google-apps.folder' || file.mimeType === 'folder' ? 'Folder' :
                            file.mimeType === 'file' ? file.name.split('.').pop().toUpperCase() :
                              file.mimeType.split('/')[1]}
                        </td>
                        <td className="p-3 text-gray-500">{file.size ? formatFileSize(file.size) : '-'}</td>
                        <td className="p-3 text-gray-500">{formatDate(file.modifiedTime)}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <a
                              href={file.webViewLink || file.preview_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Eye size={14} />
                            </a>
                            <button
                              onClick={() => confirmDelete(file)}
                              className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredFiles.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredFiles.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FileManager;
