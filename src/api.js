import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://api.billingo.hu/v3';

/**
 * Make an authenticated API request
 */
async function apiRequest(method, endpoint, data = null, params = null) {
  const apiKey = getConfig('apiKey');

  if (!apiKey) {
    throw new Error('API key not configured. Run: billingohu config set --api-key <key>');
  }

  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'X-API-KEY': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (params) config.params = params;
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      throw new Error('Authentication failed. Check your API key.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your API permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Billingo API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// INVOICES
// ============================================================

export async function listInvoices({ page = 1, per_page = 25, type, payment_method } = {}) {
  const params = { page, per_page };
  if (type) params.type = type;
  if (payment_method) params.payment_method = payment_method;

  const data = await apiRequest('GET', '/documents', null, params);
  return data.data || [];
}

export async function getInvoice(invoiceId) {
  const data = await apiRequest('GET', `/documents/${invoiceId}`);
  return data;
}

export async function createInvoice(invoiceData) {
  const data = await apiRequest('POST', '/documents', invoiceData);
  return data;
}

export async function deleteInvoice(invoiceId) {
  const data = await apiRequest('DELETE', `/documents/${invoiceId}`);
  return data;
}

export async function sendInvoice(invoiceId, { emails } = {}) {
  const body = { emails };
  const data = await apiRequest('POST', `/documents/${invoiceId}/send`, body);
  return data;
}

// ============================================================
// PARTNERS (CUSTOMERS)
// ============================================================

export async function listPartners({ page = 1, per_page = 25 } = {}) {
  const params = { page, per_page };
  const data = await apiRequest('GET', '/partners', null, params);
  return data.data || [];
}

export async function getPartner(partnerId) {
  const data = await apiRequest('GET', `/partners/${partnerId}`);
  return data;
}

export async function createPartner(partnerData) {
  const data = await apiRequest('POST', '/partners', partnerData);
  return data;
}

export async function updatePartner(partnerId, partnerData) {
  const data = await apiRequest('PUT', `/partners/${partnerId}`, partnerData);
  return data;
}

export async function deletePartner(partnerId) {
  const data = await apiRequest('DELETE', `/partners/${partnerId}`);
  return data;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function listProducts({ page = 1, per_page = 25 } = {}) {
  const params = { page, per_page };
  const data = await apiRequest('GET', '/products', null, params);
  return data.data || [];
}

export async function getProduct(productId) {
  const data = await apiRequest('GET', `/products/${productId}`);
  return data;
}

export async function createProduct(productData) {
  const data = await apiRequest('POST', '/products', productData);
  return data;
}

export async function updateProduct(productId, productData) {
  const data = await apiRequest('PUT', `/products/${productId}`, productData);
  return data;
}

export async function deleteProduct(productId) {
  const data = await apiRequest('DELETE', `/products/${productId}`);
  return data;
}

// ============================================================
// BANK ACCOUNTS
// ============================================================

export async function listBankAccounts({ page = 1, per_page = 25 } = {}) {
  const params = { page, per_page };
  const data = await apiRequest('GET', '/bank-accounts', null, params);
  return data.data || [];
}

export async function getBankAccount(accountId) {
  const data = await apiRequest('GET', `/bank-accounts/${accountId}`);
  return data;
}

export async function createBankAccount(accountData) {
  const data = await apiRequest('POST', '/bank-accounts', accountData);
  return data;
}

// ============================================================
// ORGANIZATIONS
// ============================================================

export async function getOrganization() {
  const data = await apiRequest('GET', '/organization');
  return data;
}

export async function listCurrencies() {
  const data = await apiRequest('GET', '/currencies');
  return data || [];
}
