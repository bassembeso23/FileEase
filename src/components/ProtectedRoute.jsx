// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAccessToken } from '../actions/tokenManager';
import LoadingPage from './LoadingPage';

const ProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await getAccessToken();
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                // Add a small delay to prevent flashing of loading state
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };

        checkAuth();
    }, [location.pathname]); // Re-check auth on route change

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            if (!isAuthenticated) {
                window.history.pushState(null, '', '/auth');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isAuthenticated]);

    // If still checking authentication, show loading
    if (isLoading) {
        return <LoadingPage />;
    }

    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected content
    return children;
};

export default ProtectedRoute;