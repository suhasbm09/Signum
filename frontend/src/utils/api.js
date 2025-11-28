/**
 * API Helper Utilities - Cookie-based authentication (httpOnly cookies)
 * Cookies are automatically sent by the browser with credentials: 'include'
 */

/**
 * Make an authenticated API request with httpOnly cookies
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Merge headers and ensure credentials are included
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'  // CRITICAL: Send httpOnly cookies with request
  });
};
