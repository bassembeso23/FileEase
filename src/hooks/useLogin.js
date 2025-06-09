import { useState } from "react";
import { login } from "../actions/login";

/**
 * Custom hook for handling login functionality
 * @returns {Object} Object containing error state, loading state, and login function
 * @property {string|null} error - Error message if login fails
 * @property {boolean} loading - Loading state during login attempt
 * @property {Function} login - Function to handle login
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginFn = async (body) => {
    if (loading) return null; // Prevent multiple simultaneous login attempts

    setLoading(true);
    setError(null);

    try {
      const result = await login(body);

      if (!result.success) {
        const errorMessage = result.error || "Invalid email or password";
        setError(errorMessage);
        return null;
      }

      return result.success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    login: loginFn,
  };
};
