"use server";
import { customFetch } from "../services/api";
import { storeTokens } from "./tokenManager";
/**
 * Handles user sign in and storing the tokens in the cookies.
 * @param {Object} body Sign in credentials.
 * @returns {Promise<{success: boolean, error?: string}>} Result object with success status and error message if applicable.
 */
export async function login(body) {
  try {
    const response = await customFetch({
      endpoint: "/auth/login/",
      body,
      method: "POST",
      requiresAuth: false,
    });

    if (response.token) {
      await storeTokens(response.token);
      return { success: true };
    } else {
      return {
        success: false,
        error: "No token received from server",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
