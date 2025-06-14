import { getAccessToken } from "../actions/tokenManager";
import { UNAUTHORIZED } from "../constants/statusCodes";

// Function to get CSRF token from cookie
function getCSRFToken() {
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Fetch data from an API endpoint with optional configuration.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.endpoint - The specific API endpoint to request
 * @param {Object} [options.body] - The body to send with the request
 * @param {string} [options.method='GET'] - The HTTP method to use
 * @param {Object} [options.options] - Additional fetch options
 * @param {Object} [options.headers={}] - Custom headers
 * @param {boolean} [options.shouldStringify=true] - Whether to stringify the body
 * @param {boolean} [options.requiresAuth=false] - Whether auth is required
 * @param {boolean} [options.addContentType=true] - Whether to add content type
 * @param {boolean} [options.preventThrow=false] - Whether to prevent throwing on error
 * @returns {Promise<any>} A promise that resolves to the response data
 */
export async function customFetch({
  endpoint,
  body,
  method = "GET",
  options,
  headers = {},
  shouldStringify = true,
  requiresAuth = false,
  addContentType = true,
  preventThrow = false,
}) {
  // Use the Vite proxy configuration
  const fullUrl = `/api${endpoint}`;
  let accessToken;

  if (requiresAuth) {
    try {
      accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No access token");
      }
    } catch (error) {
      console.error("Error in customFetch:", error);
      throw new Error("No access token");
    }
  }

  const requestHeaders = {
    ...(accessToken && { Authorization: `Token ${accessToken}` }),
    ...(addContentType && { "Content-Type": "application/json" }),
    ...headers,
  };

  // Add CSRF token for non-GET requests
  if (method !== "GET") {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      requestHeaders["X-CSRFToken"] = csrfToken;
    }
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
    credentials: "include", // Include cookies in the request
    ...options,
  };

  if (body && method !== "GET" && shouldStringify) {
    fetchOptions.body = JSON.stringify(body);
  } else if (body && method !== "GET") {
    fetchOptions.body = body;
  }

  try {
    const response = await fetch(fullUrl, fetchOptions);
    console.log(response);
    if (!response.ok) {
      if (response.status === UNAUTHORIZED) {
        console.error("Unauthorized");
      }
      if (preventThrow) {
        return await response.json();
      } else {
        const errorData = await response.json();
        const message =
          errorData.error || errorData.message || "Failed to fetch data";
        const details = errorData.details ? `. ${errorData.details}` : "";
        throw new Error(message + details);
      }
    }
    return response.headers.get("content-type")?.includes("text/plain")
      ? response.text()
      : response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
