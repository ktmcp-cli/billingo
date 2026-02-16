/**
 * API Client Module
 *
 * HTTP client for Billingo API with error handling and rate limiting
 */

import axios from 'axios';
import chalk from 'chalk';
import { getAuthHeaders } from './auth.js';
import { getBaseUrl } from './config.js';

/**
 * Create configured axios instance
 * @returns {Object} Axios instance
 */
function createApiClient() {
  const baseURL = getBaseUrl();

  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: getAuthHeaders(),
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      // Log rate limit info if available
      if (response.headers['x-ratelimit-remaining']) {
        const remaining = response.headers['x-ratelimit-remaining'];
        const limit = response.headers['x-ratelimit-limit'];

        if (parseInt(remaining) < 10) {
          console.warn(
            chalk.yellow(`Warning: Only ${remaining}/${limit} API calls remaining in this window`)
          );
        }
      }

      return response;
    },
    (error) => {
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        switch (status) {
          case 401:
            throw new Error('Authentication failed. Check your API key.');
          case 403:
            throw new Error('Access denied. Insufficient permissions.');
          case 404:
            throw new Error('Resource not found.');
          case 422:
            throw new Error(
              `Validation error: ${JSON.stringify(data.message || data, null, 2)}`
            );
          case 429:
            const retryAfter = error.response.headers['retry-after'];
            throw new Error(
              `Rate limit exceeded. Retry after ${retryAfter} seconds.`
            );
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(
              `API error (${status}): ${JSON.stringify(data, null, 2)}`
            );
        }
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Check your connection.');
      } else {
        // Error setting up request
        throw new Error(`Request error: ${error.message}`);
      }
    }
  );

  return client;
}

/**
 * Make GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 */
export async function get(endpoint, params = {}) {
  const client = createApiClient();
  const response = await client.get(endpoint, { params });
  return response.data;
}

/**
 * Make POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<Object>} Response data
 */
export async function post(endpoint, data = {}) {
  const client = createApiClient();
  const response = await client.post(endpoint, data);
  return response.data;
}

/**
 * Make PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<Object>} Response data
 */
export async function put(endpoint, data = {}) {
  const client = createApiClient();
  const response = await client.put(endpoint, data);
  return response.data;
}

/**
 * Make DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Response data
 */
export async function del(endpoint) {
  const client = createApiClient();
  const response = await client.delete(endpoint);
  return response.data;
}

/**
 * Download file from API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Buffer>} File buffer
 */
export async function downloadFile(endpoint) {
  const client = createApiClient();
  const response = await client.get(endpoint, { responseType: 'arraybuffer' });
  return response.data;
}

/**
 * Format output for CLI display
 * @param {*} data - Data to format
 * @param {string} format - Output format (json, pretty)
 * @returns {string} Formatted output
 */
export function formatOutput(data, format = 'pretty') {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // Pretty print for terminal
  if (Array.isArray(data)) {
    return data.map((item, idx) => {
      return `${chalk.cyan(`[${idx}]`)} ${JSON.stringify(item, null, 2)}`;
    }).join('\n\n');
  }

  return JSON.stringify(data, null, 2);
}
