import { Router } from 'itty-router';
import { handleCors, addCorsHeaders } from './utils/cors';

// Import routes
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import cashierRoutes from './routes/cashier';
import staffRoutes from './routes/staff';
import customerRoutes from './routes/customer';

// Create the router
const router = Router();

// CORS handling for preflight requests
router.options('*', handleCors);

// Route definitions
router.all('/auth/*', authRoutes.handle);
router.all('/admin/*', adminRoutes.handle);
router.all('/cashier/*', cashierRoutes.handle);
router.all('/staff/*', staffRoutes.handle);
router.all('/customer/*', customerRoutes.handle);

// Root route - API info
router.get('/', () => {
  return new Response(JSON.stringify({
    name: 'Khochuan API',
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
    uptime: process.uptime(),
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

// Durable Objects definition
export class RealtimeHandler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    this.connections = new Map();
  }
  
  // Handle fetch requests
  async fetch(request) {
    // Simple response for verification
    return new Response(JSON.stringify({ 
      message: 'RealtimeHandler ready',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // WebSocket handlers would go here in a real implementation
}

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