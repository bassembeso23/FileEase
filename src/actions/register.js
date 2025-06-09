"use server";
import { customFetch } from "../services/api";

/**
 * Handles user registration.
 * @param {Object} body Registration credentials.
 * @returns {Promise<{success: boolean, error?: string, user_id?: number, email?: string}>} Result object with success status and user data if successful.
 */
export async function register(body) {
    try {
        const response = await customFetch({
            endpoint: "/auth/register/",
            body,
            method: "POST",
            requiresAuth: false,
        });

        if (response.success) {
            return {
                success: true,
                user_id: response.user_id,
                email: response.email,
            };
        } else {
            return {
                success: false,
                error: "Registration failed",
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
