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

    const fetchFiles = async () => {
        if (!selectedCloud) {
            navigate('/select-cloud');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Reset stats while loading
            setStats(initialStats);

            let endpoint = '/files/';
            if (selectedCloud === 'Dropbox') {
                endpoint = '/dropbox/files/';
            }

            const response = await customFetch({
                endpoint,
                requiresAuth: true
            });

            setFiles(response);
            calculateStats(response);
            setIsConnected(true);

            toast({
                title: "Success",
                description: `Successfully fetched files from ${selectedCloud}`,
            });
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch files';
            setError(errorMessage);
            setIsConnected(false);
            // Reset stats on error
            setStats(initialStats);

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
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
        setIsConnected(false);
        setFiles([]);
        setStats(initialStats);
        navigate('/select-cloud');

        toast({
            title: "Disconnected",
            description: "Cloud account has been disconnected.",
        });
    };

    useEffect(() => {
        if (selectedCloud) {
            fetchFiles();
        } else {
            setLoading(false);
            setStats(initialStats);
            if (window.location.pathname !== '/select-cloud') {
                navigate('/select-cloud');
            }
        }
    }, [selectedCloud]);

    const value = {
        selectedCloud,
        setSelectedCloud,
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
