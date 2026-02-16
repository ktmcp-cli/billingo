/**
 * Configuration Management
 *
 * Handles API key storage and configuration using conf package
 */

import Conf from 'conf';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const config = new Conf({
  projectName: 'billingo-cli',
  defaults: {
    apiKey: process.env.BILLINGO_API_KEY || '',
    baseUrl: process.env.BILLINGO_BASE_URL || 'https://api.billingo.hu/v3',
  },
});

/**
 * Get configuration value
 * @param {string} key - Configuration key
 * @returns {*} Configuration value
 */
export function getConfig(key) {
  return config.get(key);
}

/**
 * Set configuration value
 * @param {string} key - Configuration key
 * @param {*} value - Configuration value
 */
export function setConfig(key, value) {
  config.set(key, value);
}

/**
 * Get all configuration
 * @returns {Object} All configuration values
 */
export function getAllConfig() {
  return config.store;
}

/**
 * Delete configuration value
 * @param {string} key - Configuration key
 */
export function deleteConfig(key) {
  config.delete(key);
}

/**
 * Clear all configuration
 */
export function clearConfig() {
  config.clear();
}

/**
 * Get API key from config or environment
 * @returns {string} API key
 * @throws {Error} If API key is not configured
 */
export function getApiKey() {
  const apiKey = getConfig('apiKey') || process.env.BILLINGO_API_KEY;

  if (!apiKey) {
    throw new Error(
      'API key not configured. Set it with: billingo config set API_KEY <your-api-key>\n' +
      'Or set BILLINGO_API_KEY environment variable.\n' +
      'Get your API key at: https://app.billingo.hu/api-key'
    );
  }

  return apiKey;
}

/**
 * Get base URL from config or environment
 * @returns {string} Base URL
 */
export function getBaseUrl() {
  return getConfig('baseUrl') || process.env.BILLINGO_BASE_URL || 'https://api.billingo.hu/v3';
}
