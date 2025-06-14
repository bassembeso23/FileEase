import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "../hooks/use-toast";
import { customFetch } from '../services/api';

const CloudContext = createContext();

export const useCloud = () => useContext(CloudContext);

const initialStats = {
    totalSize: 0,
    totalFiles: 0,
    totalFolders: 0,
    recentFiles: 0
};

export const CloudProvider = ({ children }) => {
    const [selectedCloud, setSelectedCloud] = useState(localStorage.getItem('selectedCloud'));
    const [isConnected, setIsConnected] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(initialStats);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Clear all cloud-related state
    const clearCloudState = () => {
        setFiles([]);
        setStats(initialStats);
        setIsConnected(false);
        setError(null);
    };

    const fetchFiles = async () => {
        if (!selectedCloud) {
            navigate('/select-cloud');
            return;
        }

        try {
            setLoading(true);
            clearCloudState(); // Clear state before fetching new files

            let endpoint;
            if (selectedCloud === 'Dropbox') {
                endpoint = '/dropbox/files/';
            } else if (selectedCloud === 'Google Drive') {
                endpoint = '/files/';
            } else {
                throw new Error('Invalid cloud provider selected');
            }

            const response = await customFetch({
                endpoint,
                requiresAuth: true
            });

            if (!response || !Array.isArray(response)) {
                throw new Error('Invalid response format from server');
            }

            // Set files and stats immediately
            setFiles(response);
            calculateStats(response);
            setIsConnected(true);

            // Process download links and upload documents in the background
            processFilesInBackground(response);

        } catch (error) {
            setError(error.message || 'Failed to fetch files');
            toast({
                title: "Error",
                description: error.message || 'Failed to fetch files',
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // New function to handle background processing
    const processFilesInBackground = async (files) => {
        try {
            const batchDownloadData = {
                google_drive_ids: selectedCloud === 'Google Drive' ? files.map(file => file.id) : [],
                dropbox_paths: selectedCloud === 'Dropbox' ? files.map(file => file.path_lower) : [],
                public_link: true
            };

            const batchResponse = await customFetch({
                endpoint: '/batch-download-links/',
                method: 'POST',
                body: batchDownloadData,
                requiresAuth: true
            });

            console.log('Batch Download Links Response:', batchResponse);

            // Extract download links from both Google Drive and Dropbox files
            const downloadLinks = [
                ...(batchResponse.results.google_drive_files || []).map(file => file.downloadLink),
                ...(batchResponse.results.dropbox_files || []).map(file => file.downloadLink)
            ].filter(link => link !== null && link !== undefined);

            console.log('Extracted Download Links:', downloadLinks);

            // Upload the links to the specified endpoint
            if (downloadLinks.length > 0) {
                try {
                    const uploadLinksResponse = await customFetch({
                        endpoint: '/upload-links/',
                        method: 'POST',
                        body: {
                            links: downloadLinks
                        },
                        requiresAuth: true
                    });

                    console.log('Upload Links Response:', uploadLinksResponse);
                } catch (uploadError) {
                    console.error('Failed to upload links:', uploadError);
                }
            }
        } catch (batchError) {
            console.error('Failed to process files in background:', batchError);
        }
    };

    const calculateStats = (files) => {
        if (!files || files.length === 0) {
            setStats(initialStats);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newStats = files.reduce((acc, file) => {
            if (file.size) {
                acc.totalSize += parseInt(file.size);
            }

            if (file.mimeType === 'application/vnd.google-apps.folder' || file.mimeType === 'folder') {
                acc.totalFolders++;
            } else {
                acc.totalFiles++;
            }

            const modifiedDate = new Date(file.modifiedTime);
            if (modifiedDate >= today) {
                acc.recentFiles++;
            }

            return acc;
        }, {
            totalSize: 0,
            totalFiles: 0,
            totalFolders: 0,
            recentFiles: 0
        });

        setStats(newStats);
    };

    const disconnectCloud = () => {
        localStorage.removeItem('selectedCloud');
        setSelectedCloud(null);
        clearCloudState();
        navigate('/select-cloud');

        toast({
            title: "Disconnected",
            description: "Cloud account has been disconnected.",
        });
    };

    // Handle cloud provider changes
    const handleCloudChange = (newCloud) => {
        if (newCloud !== selectedCloud) {
            clearCloudState(); // Clear state before changing cloud
            setSelectedCloud(newCloud);
            localStorage.setItem('selectedCloud', newCloud);
        }
    };

    // Single effect to handle both initial load and cloud provider changes
    useEffect(() => {
        const storedCloud = localStorage.getItem('selectedCloud');

        if (storedCloud) {
            if (!selectedCloud) {
                // Only set selectedCloud if it's not already set
                setSelectedCloud(storedCloud);
            } else {
                // If selectedCloud is already set, fetch files
                fetchFiles();
            }
        } else {
            setLoading(false);
            clearCloudState();
            if (window.location.pathname !== '/select-cloud') {
                navigate('/select-cloud');
            }
        }
    }, [selectedCloud]); // Only depend on selectedCloud

    const value = {
        selectedCloud,
        setSelectedCloud: handleCloudChange,
        isConnected,
        setIsConnected,
        files,
        setFiles,
        loading,
        error,
        stats,
        fetchFiles,
        disconnectCloud
    };

    return (
        <CloudContext.Provider value={value}>
            {children}
        </CloudContext.Provider>
    );
};
