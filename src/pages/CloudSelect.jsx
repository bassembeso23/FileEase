import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import google from '../assets/googleDrive.jpg'
import dropbox from '../assets/dropbox-logo.png'
import { customFetch } from '../services/api';

const CloudSelect = () => {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authUrl, setAuthUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCheckingConnection, setIsCheckingConnection] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    // Function to check Google Drive connection status
    const checkGoogleConnection = useCallback(async () => {
        try {
            setIsCheckingConnection(true);
            const response = await customFetch({
                endpoint: '/auth/google/check',
                method: 'GET',
                requiresAuth: true,
            });

            if (response.has_google_auth) {
                // Store the selected cloud provider
                localStorage.setItem('selectedCloud', 'Google Drive');
                // Navigate to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error checking Google connection:', err);
            setError('Failed to verify Google Drive connection');
        } finally {
            setIsCheckingConnection(false);
        }
    }, [navigate]);

    // Function to check Dropbox connection status
    const checkDropboxConnection = useCallback(async () => {
        try {
            setIsCheckingConnection(true);
            const response = await customFetch({
                endpoint: '/dropbox/files/',
                method: 'GET',
                requiresAuth: true,
            });

            if (response) {
                // Store the selected cloud provider
                localStorage.setItem('selectedCloud', 'Dropbox');
                // Navigate to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error checking Dropbox connection:', err);
            setError('Failed to verify Dropbox connection');
        } finally {
            setIsCheckingConnection(false);
        }
    }, [navigate]);

    // Check connection status when auth window is closed
    useEffect(() => {
        const checkConnection = async () => {
            if (authUrl && selectedProvider === 'Google Drive') {
                // Wait a bit for the backend to process the OAuth callback
                await new Promise(resolve => setTimeout(resolve, 2000));
                await checkGoogleConnection();
            } else if (authUrl && selectedProvider === 'Dropbox') {
                // Wait a bit for the backend to process the OAuth callback
                await new Promise(resolve => setTimeout(resolve, 2000));
                await checkDropboxConnection();
            }
        };

        const handleWindowClose = () => {
            checkConnection();
        };

        window.addEventListener('focus', handleWindowClose);
        return () => window.removeEventListener('focus', handleWindowClose);
    }, [authUrl, selectedProvider, checkGoogleConnection, checkDropboxConnection]);

    const handleCloudSelect = async (cloudProvider) => {
        if (cloudProvider === 'Google Drive') {
            try {
                setIsLoading(true);
                setError(null);
                setSelectedProvider('Google Drive');

                // Get the Google auth URL from backend
                const response = await customFetch({
                    endpoint: '/auth/google/url/',
                    method: 'GET',
                    requiresAuth: true,
                });

                if (response.auth_url) {
                    setAuthUrl(response.auth_url);
                    setShowAuthModal(true);
                } else {
                    throw new Error('Failed to get Google authentication URL');
                }
            } catch (err) {
                setError(err.message || 'Failed to initialize Google Drive connection');
                console.error('Error getting Google auth URL:', err);
            } finally {
                setIsLoading(false);
            }
        } else if (cloudProvider === 'Dropbox') {
            try {
                setIsLoading(true);
                setError(null);
                setSelectedProvider('Dropbox');

                // Get the Dropbox auth URL from backend
                const response = await customFetch({
                    endpoint: '/auth/dropbox/url/',
                    method: 'GET',
                    requiresAuth: true,
                });

                if (response.auth_url) {
                    setAuthUrl(response.auth_url);
                    setShowAuthModal(true);
                } else {
                    throw new Error('Failed to get Dropbox authentication URL');
                }
            } catch (err) {
                setError(err.message || 'Failed to initialize Dropbox connection');
                console.error('Error getting Dropbox auth URL:', err);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Handle other cloud providers
            localStorage.setItem('selectedCloud', cloudProvider);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        }
    };

    const handleAuth = () => {
        if (authUrl) {
            // Open auth in a new window
            window.open(authUrl, '_blank', 'width=600,height=600');
            setShowAuthModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary to-secondary flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-primary mb-4">Welcome to FileEase</h1>
                    <p className="text-gray-600 text-lg">Connect your cloud storage to access and search across all your files</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div
                        onClick={() => handleCloudSelect('Google Drive')}
                        className="border-2 border-gray-200 hover:border-secondary rounded-lg p-6 text-center cursor-pointer transition-all hover:shadow-md"
                    >
                        <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <img src={google} alt="Google Drive" />
                        </div>
                        <h3 className="text-primary font-semibold text-lg mb-2">Google Drive</h3>
                        <p className="text-gray-500 text-sm">Connect to your Google Drive account</p>
                    </div>

                    <div
                        onClick={() => handleCloudSelect('Dropbox')}
                        className="border-2 border-gray-200 hover:border-secondary rounded-lg p-6 text-center cursor-pointer transition-all hover:shadow-md"
                    >
                        <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <img src={dropbox} alt="Dropbox" />
                        </div>
                        <h3 className="text-primary font-semibold text-lg mb-2">Dropbox</h3>
                        <p className="text-gray-500 text-sm">Connect to your Dropbox account</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex items-start">
                        <div className="bg-primary rounded-full p-2 mr-4">
                            <Search size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-primary font-semibold text-lg mb-2">Advanced Search Features</h3>
                            <p className="text-gray-600">After connecting your cloud storage, CloudFusion will index your files for lightning-fast searches across all documents, images, and more.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center text-primary text-sm">
                    <p>By connecting a cloud provider, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-primary">
                                Connect {selectedProvider}
                            </h3>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                To connect your {selectedProvider}, you'll need to grant FileEase permission to access your files.
                                This will open a new window where you can sign in to your {selectedProvider} account and authorize the connection.
                            </p>
                            {error && (
                                <p className="text-red-500 text-sm mb-4">{error}</p>
                            )}
                            {isCheckingConnection && (
                                <p className="text-blue-500 text-sm mb-4">Verifying connection...</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAuth}
                                disabled={isLoading || isCheckingConnection}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudSelect;
