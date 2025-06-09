import { useState } from "react";
import { register } from "../actions/register";

/**
 * Custom hook for handling registration functionality
 * @returns {Object} Object containing error state, loading state, and register function
 * @property {string|null} error - Error message if registration fails
 * @property {boolean} loading - Loading state during registration attempt
 * @property {Function} register - Function to handle registration
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerFn = async (body) => {
    if (loading) return null; // Prevent multiple simultaneous registration attempts

    setLoading(true);
    setError(null);

    try {
      const result = await register(body);

      if (!result.success) {
        setError(result.error || "Registration failed");
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    register: registerFn,
  };
};
