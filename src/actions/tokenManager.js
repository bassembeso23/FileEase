"use client";
import { ACCESS_TOKEN } from "../constants/tokens";

class TokenManager {
  constructor() {
    this.accessToken = null;
  }

  static getInstance() {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getTokenFromStorage() {
    this.accessToken = localStorage.getItem(ACCESS_TOKEN);
  }

  setTokensToStorage(accessToken) {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    this.accessToken = accessToken;
  }

  deleteTokens() {
    localStorage.removeItem(ACCESS_TOKEN);
    this.accessToken = null;
  }

  async getAccessToken() {
    try {
      this.getTokenFromStorage();
      return this.accessToken;
    } catch (error) {
      console.error("Error in getAccessToken:", error);
      return null;
    }
  }
}

/**
 * Attempts to get the access token from storage.
 * @returns {Promise<string|null>} The access token if available, otherwise null.
 */
export async function getAccessToken() {
  const tokenManager = TokenManager.getInstance();
  return await tokenManager.getAccessToken();
}

/**
 * A function to store the tokens in storage.
 * @param {string} accessToken
 */
export async function storeTokens(accessToken) {
  const tokenManager = TokenManager.getInstance();
  tokenManager.setTokensToStorage(accessToken);
}

/**
 * A function to remove access token from storage
 */
export async function deleteTokens() {
  const tokenManager = TokenManager.getInstance();
  tokenManager.deleteTokens();
}
