import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingPage from './components/LoadingPage';
import CloudSelect from './pages/CloudSelect';
import SemanticSearchPage from './pages/SemanticSearchPage';
import { ToastContainer } from 'react-toastify';
import { getAccessToken } from './actions/tokenManager';
import { CloudProvider } from './contexts/CloudContext';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const AuthCheck = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCloudProvider, setHasCloudProvider] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken();
        const cloudProvider = localStorage.getItem('selectedCloud');
        const hasToken = !!token;
        const hasProvider = !!cloudProvider;

        setIsAuthenticated(hasToken);
        setHasCloudProvider(hasProvider);
      } catch (error) {
        console.error('Global auth check failed:', error);
        setIsAuthenticated(false);
        setHasCloudProvider(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    if (location.pathname === '/' || location.pathname === '/auth') {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !hasCloudProvider) {
    if (location.pathname === '/selectcloud' || location.pathname === '/auth') {
      return children;
    }
    return <Navigate to="/selectcloud" replace />;
  }

  if (isAuthenticated && hasCloudProvider) {
    if (location.pathname === '/dashboard' || location.pathname === '/semantic-search' || location.pathname === '/auth') {
      return children;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

function App() {
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return (
    <Router>
      <CloudProvider>
        <AuthCheck>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/selectcloud"
              element={
                <ProtectedRoute>
                  <CloudSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/semantic-search"
              element={
                <ProtectedRoute>
                  <SemanticSearchPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            limit={1}
            enableMultiContainer={false}
          />
        </AuthCheck>
      </CloudProvider>
    </Router>
  );
}

export default App;
