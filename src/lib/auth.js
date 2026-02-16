/**
 * Authentication Module
 *
 * Handles API key authentication for Billingo API
 */

import { getApiKey } from './config.js';

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with API key
 * @throws {Error} If API key is not configured
 */
export function getAuthHeaders() {
  const apiKey = getApiKey();

  return {
    'X-API-KEY': apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format is valid
 */
export function validateApiKeyFormat(apiKey) {
  // Billingo API keys are typically 32+ character alphanumeric strings
  return typeof apiKey === 'string' && apiKey.length >= 20;
}
