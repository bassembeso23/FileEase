import React from "react";
import { FaGooglePlusG, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthSchema } from "../services/validationSchemas/authSchema.js";
import { useSanitizedForm } from '../hooks/useSanitizedForm';
import LoadingPage from './LoadingPage';

const AuthForm = ({ isLogin, onToggle, onSubmit, isLoading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        clearErrors,
    } = useSanitizedForm({
        defaultValues: {
            email: "",
            password: ""
        },
        resolver: yupResolver(AuthSchema(isLogin)),
        mode: "onChange",
    });

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data);
            reset();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleToggle = () => {
        clearErrors();
        reset();
        onToggle();
    };

    const getFilteredErrors = () => {
        if (isLogin) {
            return {
                email: errors.email,
                password: errors.password
            };
        }
        return {
            email: errors.email,
            password: errors.password
        };
    };

    const filteredErrors = getFilteredErrors();

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="auth-form-container min-h-screen bg-gradient-to-r from-semiLight to-light flex items-center justify-center p-1">
            <div className={`container ${isLogin ? "" : "active"}`} id="container">
                <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <h1>{isLogin ? "Sign In" : "Create Account"}</h1>
                    <div className="social-icons">
                        <a href="#" className="icon">
                            <FaGooglePlusG />
                        </a>
                        <a href="#" className="icon">
                            <FaFacebookF />
                        </a>
                        <a href="#" className="icon">
                            <FaLinkedinIn />
                        </a>
                    </div>
                    <span>
                        {isLogin
                            ? "Use your username and password"
                            : "or use your email for registration"}
                    </span>

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            {...register("email")}
                            className={filteredErrors.email ? "error" : ""}
                            disabled={isLoading}
                        />
                    </div>
                    {filteredErrors.email && (
                        <p className="text-xs text-red-500">{filteredErrors.email.message}</p>
                    )}

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            {...register("password")}
                            className={filteredErrors.password ? "error" : ""}
                            disabled={isLoading}
                        />
                    </div>
                    {filteredErrors.password && (
                        <p className="text-xs text-red-500">{filteredErrors.password.message}</p>
                    )}

                    <button
                        type="submit"
                        className="form-btn"
                        disabled={isLoading}
                    >
                        {isLogin ? "SIGN IN" : "SIGN UP"}
                    </button>
                </form>

                <div className="toggle-container">
                    <div className="toggle">
                        <div className={`toggle-panel ${isLogin ? "toggle-right" : "toggle-left"}`}>
                            <h1>{isLogin ? "Hello, User!" : "Welcome Back!"}</h1>
                            <p>
                                {isLogin
                                    ? "Register to use all site features"
                                    : "Login to access your account"}
                            </p>
                            <button
                                className="form-btn toggle-btn"
                                onClick={handleToggle}
                                disabled={isLoading}
                            >
                                {isLogin ? "SIGN UP" : "SIGN IN"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;