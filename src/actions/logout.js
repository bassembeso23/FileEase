import { customFetch } from "../services/api";
import { deleteTokens } from "./tokenManager";

/**
 * Handles user logout by calling the logout API and cleaning up local state.
 * @returns {Promise<{success: boolean, error?: string}>} Result object with success status and error message if applicable.
 */
export async function logout() {
  try {
    const response = await customFetch({
      endpoint: "/auth/logout/",
      method: "GET",
      requiresAuth: true,
    });

    if (response.success) {
      await deleteTokens();
      localStorage.removeItem("selectedCloud");
      return { success: true };
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still clean up local state even if the API call fails
    await deleteTokens();
    localStorage.removeItem("selectedCloud");

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to logout properly",
    };
  }
}
