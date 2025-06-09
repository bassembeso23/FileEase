/**
 * General purpose string sanitization to avoid injection issues
 * @param {string} [input] string to be sanitized
 * @returns {string} sanitized string
 */
export const sanitizeString = (input) => {
    if (!input) return "";

    if (input.startsWith("https://")) {
        return input;
    }

    return input
        .replace(/(\+\+|--|['";\\<>])/g, "")
        .replace(/[^a-zA-Z0-9\s.,!?@#()_\-+]/g, "");
};

/**
 * Sanitizer allowing only numeric characters in a string for ID/number purposes (nothing but 0-9)
 * @param {string} [input] string to be sanitized
 * @returns {string} sanitized string
 */
export const sanitizeNumericString = (input) => {
    if (!input) return "";

    return input.replace(/(\+\+|--|['";\\<>])/g, "").replace(/\D/g, "");
};
