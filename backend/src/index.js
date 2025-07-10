/**
 * Khochuan POS - Main API Entry Point
 * Real backend with Cloudflare Workers + D1 Database
 * NO MOCK DATA - 100% REAL DATABASE
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { handleCors, addCorsHeaders } from './utils/cors';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

// Import REAL routes - NO MOCK DATA
import authRoutes from './routes/auth_real';
import productsRoutes from './routes/products_real';
import analyticsRoutes from './routes/analytics';
import inventoryRoutes from './routes/inventory';
import integrationsRoutes from './routes/integrations';
import paymentsRoutes from './routes/payments';

// Create the router
const router = Router();

// CORS handling for preflight requests
router.options('*', handleCors);

// Route definitions
router.all('/auth/*', authRoutes.handle);
router.all('/products/*', productsRoutes.handle);
router.all('/products', productsRoutes.handle);
router.all('/analytics/*', analyticsRoutes.handle);
router.all('/inventory/*', inventoryRoutes.handle);
router.all('/integrations/*', integrationsRoutes.handle);
router.all('/payments/*', paymentsRoutes.handle);

// Root route - API info
router.get('/', () => {
  return new Response(JSON.stringify({
    name: 'Khoaugment API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
    }
  });
});

// Health check endpoint
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
    }
  });
});

// Catch-all 404 route
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested resource was not found',
    status: 404
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
    }
  });
});

// Worker entry point
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight request
      const corsResponse = handleCors(request);
      if (corsResponse) return corsResponse;

      // Route the request
      const response = await router.handle(request, env, ctx);

      // Add CORS headers to the response
      return addCorsHeaders(response, request);
    } catch (error) {
      // Handle errors
      console.error('Error handling request:', error);
      const errorResponse = new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        status: 500
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Add CORS headers to error response
      return addCorsHeaders(errorResponse, request);
    }
  }
};

// Export Durable Objects
export class RealtimeHandler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    this.connections = new Map();
  }

  async fetch(request) {
    return new Response(JSON.stringify({
      message: 'RealtimeHandler ready',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}