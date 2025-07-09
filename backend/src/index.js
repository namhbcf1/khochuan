/**
 * ============================================================================
 * ENTERPRISE POS SYSTEM - CLOUDFLARE WORKERS BACKEND
 * ============================================================================
 * Main entry point for the Cloudflare Workers backend API
 * Handles routing, middleware, and database initialization
 */

import { Router } from 'itty-router';
import { createDatabaseService } from './services/database.js';
import { corsHeaders } from './utils/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Import route handlers
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import inventoryRoutes from './routes/inventory.js';
import staffRoutes from './routes/staff.js';
import analyticsRoutes from './routes/analytics.js';
import posRoutes from './routes/pos.js';
import gamificationRoutes from './routes/gamification.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import integrationRoutes from './routes/integrations.js';

// Create router instance
const router = Router();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// CORS preflight handler
router.options('*', () => {
  return new Response(null, {
    headers: corsHeaders
  });
});

// Global middleware for database injection
router.all('*', async (request, env, ctx) => {
  // Initialize database service
  request.db = createDatabaseService(env);

  // Add environment to request
  request.env = env;
  request.ctx = ctx;

  // Continue to next handler
  return undefined;
});

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Health check endpoint
router.get('/health', async (request) => {
  try {
    // Test database connection
    const stats = await request.db.getStats();

    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: true,
        stats
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: false,
        error: error.message
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// API info endpoint
router.get('/api/info', () => {
  return new Response(JSON.stringify({
    name: 'Enterprise POS API',
    version: '1.0.0',
    description: 'Complete POS system with AI, gamification, and analytics',
    endpoints: {
      auth: '/api/auth/*',
      products: '/api/products/*',
      orders: '/api/orders/*',
      customers: '/api/customers/*',
      inventory: '/api/inventory/*',
      staff: '/api/staff/*',
      analytics: '/api/analytics/*',
      pos: '/api/pos/*',
      gamification: '/api/gamification/*',
      ai: '/api/ai/*',
      reports: '/api/reports/*',
      integrations: '/api/integrations/*'
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// ============================================================================
// AUTHENTICATION ROUTES (Public)
// ============================================================================
router.all('/api/auth/*', authRoutes.handle);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Apply authentication middleware to all protected routes
router.all('/api/*', authMiddleware);

// Register protected route handlers
router.all('/api/products/*', productRoutes.handle);
router.all('/api/orders/*', orderRoutes.handle);
router.all('/api/customers/*', customerRoutes.handle);
router.all('/api/inventory/*', inventoryRoutes.handle);
router.all('/api/staff/*', staffRoutes.handle);
router.all('/api/analytics/*', analyticsRoutes.handle);
router.all('/api/pos/*', posRoutes.handle);
router.all('/api/gamification/*', gamificationRoutes.handle);
router.all('/api/ai/*', aiRoutes.handle);
router.all('/api/reports/*', reportRoutes.handle);
router.all('/api/integrations/*', integrationRoutes.handle);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString()
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// ============================================================================
// WORKER EXPORT
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      return errorHandler(error, request, env, ctx);
    }
  }
};

// Export Durable Objects
export { RealtimeHandler } from './durable-objects/RealtimeHandler.js';