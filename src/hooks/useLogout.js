import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../actions/logout";
import { toast } from "react-toastify";

/**
 * Custom hook for handling logout functionality
 * @returns {Object} Object containing loading state and logout function
 * @property {boolean} loading - Loading state during logout
 * @property {Function} logout - Function to handle logout
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await logout();

      if (result.success) {
        toast.success("Successfully logged out", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Navigate to home page
        navigate("/", { replace: true });
      } else {
        toast.error(result.error || "Failed to logout", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred during logout", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    logout: handleLogout,
  };
};
