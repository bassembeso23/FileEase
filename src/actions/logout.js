import { customFetch } from "../services/api";
import { deleteTokens } from "./tokenManager";

/**
 * Handles user logout by calling the logout API and cleaning up local state.
 * @returns {Promise<{success: boolean, error?: string}>} Result object with success status and error message if applicable.
 */
export async function logout() {
  try {
    // Get the selected cloud provider before clearing it
    const selectedCloud = localStorage.getItem("selectedCloud");

    // Call the delete-processed-folders API first
    await customFetch({
      endpoint: "/delete-processed-folders/",
      method: "DELETE",
      requiresAuth: true,
    });

    // Call the appropriate revoke API based on the cloud provider
    if (selectedCloud === "Google Drive") {
      await customFetch({
        endpoint: "/auth/google/revoke/",
        method: "POST",
        requiresAuth: true,
      });
    } else if (selectedCloud === "Dropbox") {
      await customFetch({
        endpoint: "/auth/dropbox/revoke/",
        method: "POST",
        requiresAuth: true,
      });
    }

    // Call the main logout API
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
