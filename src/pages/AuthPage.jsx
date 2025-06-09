import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useLogin } from '../hooks/useLogin';
import { useRegister } from '../hooks/useRegister';
import { toast } from 'react-toastify';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const { login, loading: loginLoading, error: loginError } = useLogin();
    const { register, loading: registerLoading, error: registerError } = useRegister();

    // Handle OAuth redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const code = params.get('code');
        const state = params.get('state');

        if (error) {
            toast.error('Authentication failed: ' + error);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && state) {
            // Handle OAuth callback
            toast.info('Processing authentication...');
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Show error toast when login error changes
    useEffect(() => {
        if (loginError) {
            toast.error(loginError, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [loginError]);

    // Show error toast when registration error changes
    useEffect(() => {
        if (registerError) {
            toast.error(registerError, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [registerError]);

    const handleSubmit = async (formData) => {
        try {
            if (isLogin) {
                const success = await login({
                    email: formData.email,
                    password: formData.password
                });

                if (success) {
                    // Get the redirect path from location state or default to selectcloud
                    const from = location.state?.from?.pathname || '/selectcloud';
                    navigate(from, { replace: true });
                    toast.success("Successfully signed in! Welcome back!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else {
                const result = await register({
                    email: formData.email,
                    password: formData.password
                });

                if (result?.success) {
                    setIsLogin(true);
                    toast.success("Registration Successful! Please login with your credentials.", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            }
        } catch (err) {
            const errorMessage = err.message || (isLogin ? "Invalid email or password" : "Registration failed");
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <AuthForm
            isLogin={isLogin}
            onSubmit={handleSubmit}
            onToggle={() => setIsLogin(!isLogin)}
            isLoading={isLogin ? loginLoading : registerLoading}
            error={isLogin ? loginError : registerError}
        />
    );
};

export default AuthPage;
