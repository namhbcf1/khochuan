import { Router } from 'itty-router';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import cashierRoutes from './routes/cashier';
import staffRoutes from './routes/staff';
import customerRoutes from './routes/customer';
import { corsHeaders } from './utils/cors';

// Create a new router
const router = Router();

// CORS preflight handler
router.options('*', request => {
  return new Response(null, {
    headers: corsHeaders
  });
});

// Health check endpoint
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});

// Register routes
router.all('/auth/*', authRoutes.handle);
router.all('/admin/*', adminRoutes.handle);
router.all('/cashier/*', cashierRoutes.handle);
router.all('/staff/*', staffRoutes.handle);
router.all('/customer/*', customerRoutes.handle);

// 404 handler
router.all('*', () => {
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain', ...corsHeaders }
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
    return new Response(JSON.stringify({ message: 'RealtimeHandler ready' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // WebSocket handlers would go here in a real implementation
}

// Export default worker handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  }
};