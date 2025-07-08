/**
 * CORS Headers Utility
 * Provides CORS headers for cross-origin requests
 */

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 * @param {Request} request - The incoming request
 * @returns {Response} - Response with CORS headers
 */
export function handleCors(request) {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  // For other requests, return null to continue processing
  return null;
}

/**
 * Add CORS headers to a response
 * @param {Response} response - The response to add headers to
 * @returns {Response} - Response with CORS headers
 */
export function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Return new response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
} 