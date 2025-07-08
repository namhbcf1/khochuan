import { Router } from 'itty-router';
import { createCors } from 'itty-cors';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { validationMiddleware } from './middleware/validation.js';

// Route Handlers
import authRoutes from './handlers/auth.js';
import productRoutes from './handlers/products.js';
import orderRoutes from './handlers/orders.js';
import inventoryRoutes from './handlers/inventory.js';
import customerRoutes from './handlers/customers.js';
import analyticsRoutes from './handlers/analytics.js';
import gamificationRoutes from './handlers/gamification.js';
import aiRoutes from './handlers/ai.js';

// Durable Objects
export { RealtimeHandler } from './durableObjects/RealtimeHandler.js';

// CORS Configuration
const { preflight, corsify } = createCors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  origins: ['https://smartpos.pages.dev', 'https://*.pages.dev', 'http://localhost:3000'],
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  },
});

// Create Router
const router = Router();

// Global Middleware
router.all('*', preflight);
router.all('/api/*', rateLimitMiddleware);
router.all('/api/protected/*', authMiddleware);

// Health Check
router.get('/health', () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// API Routes
router.all('/api/auth/*', authRoutes.handle);
router.all('/api/products/*', productRoutes.handle);
router.all('/api/orders/*', orderRoutes.handle);
router.all('/api/inventory/*', inventoryRoutes.handle);
router.all('/api/customers/*', customerRoutes.handle);
router.all('/api/analytics/*', analyticsRoutes.handle);
router.all('/api/gamification/*', gamificationRoutes.handle);
router.all('/api/ai/*', aiRoutes.handle);

// WebSocket Upgrade for Real-time Features
router.get('/ws', async (request, env) => {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const realtimeId = env.REALTIME.idFromName('global');
  const realtimeStub = env.REALTIME.get(realtimeId);
  return realtimeStub.fetch(request);
});

// 404 Handler
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Main Export
export default {
  async fetch(request, env, ctx) {
    try {
      // Add environment to request for access in handlers
      request.env = env;
      request.ctx = ctx;
      
      // Handle request
      const response = await router.handle(request);
      
      // Apply CORS
      return corsify(response);
      
    } catch (error) {
      console.error('Unhandled error:', error);
      
      // Log error to analytics
      if (env.ANALYTICS) {
        env.ANALYTICS.writeDataPoint({
          blobs: [error.message, error.stack],
          doubles: [1],
          indexes: ['error']
        });
      }
      
      return corsify(new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  },

  // Cron Triggers for scheduled tasks
  async scheduled(event, env, ctx) {
    console.log('Cron trigger executed:', event.cron);
    
    switch (event.cron) {
      case '0 0 * * *': // Daily at midnight
        await runDailyTasks(env);
        break;
      case '0 * * * *': // Hourly
        await runHourlyTasks(env);
        break;
      case '*/15 * * * *': // Every 15 minutes
        await runPeriodicTasks(env);
        break;
    }
  },

  // Queue Consumer for background jobs
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        await processQueueMessage(message, env);
        message.ack();
      } catch (error) {
        console.error('Queue processing error:', error);
        message.retry();
      }
    }
  }
};

// Background Task Functions
async function runDailyTasks(env) {
  console.log('Running daily tasks...');
  
  // Clean up old sessions
  await cleanupExpiredSessions(env);
  
  // Generate daily reports
  await generateDailyReports(env);
  
  // Backup critical data
  await backupData(env);
  
  // Update AI models
  await updateAIModels(env);
}

async function runHourlyTasks(env) {
  console.log('Running hourly tasks...');
  
  // Sync inventory levels
  await syncInventoryLevels(env);
  
  // Process pending orders
  await processPendingOrders(env);
  
  // Update analytics data
  await updateAnalytics(env);
}

async function runPeriodicTasks(env) {
  console.log('Running periodic tasks...');
  
  // Health checks
  await performHealthChecks(env);
  
  // Cache warming
  await warmCache(env);
  
  // Real-time data sync
  await syncRealtimeData(env);
}

async function processQueueMessage(message, env) {
  const { type, data } = message.body;
  
  switch (type) {
    case 'order_created':
      await handleOrderCreated(data, env);
      break;
    case 'inventory_updated':
      await handleInventoryUpdated(data, env);
      break;
    case 'user_registered':
      await handleUserRegistered(data, env);
      break;
    case 'email_notification':
      await sendEmailNotification(data, env);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
}

// Helper Functions
async function cleanupExpiredSessions(env) {
  // Implementation for cleaning expired sessions
}

async function generateDailyReports(env) {
  // Implementation for generating daily reports
}

async function backupData(env) {
  // Implementation for data backup
}

async function updateAIModels(env) {
  // Implementation for AI model updates
}

async function syncInventoryLevels(env) {
  // Implementation for inventory sync
}

async function processPendingOrders(env) {
  // Implementation for processing pending orders
}

async function updateAnalytics(env) {
  // Implementation for analytics updates
}

async function performHealthChecks(env) {
  // Implementation for health checks
}

async function warmCache(env) {
  // Implementation for cache warming
}

async function syncRealtimeData(env) {
  // Implementation for real-time data sync
}

async function handleOrderCreated(data, env) {
  // Implementation for order created event
}

async function handleInventoryUpdated(data, env) {
  // Implementation for inventory updated event
}

async function handleUserRegistered(data, env) {
  // Implementation for user registered event
}

async function sendEmailNotification(data, env) {
  // Implementation for email notifications
}