/**
 * KhoChuan POS - Backend API Service
 * Main entry point for the Cloudflare Workers backend
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Import services
import { DatabaseService } from './services/database.js';
import { AuthService } from './services/authService.js';
import { ProductService } from './services/productService.js';
import { CustomerService } from './services/customerService.js';
import { OrderService } from './services/orderService.js';
import { AnalyticsService } from './services/analyticsService.js';
import { GamificationService } from './services/gamificationService.js';
import { SettingsService } from './services/settingsService.js';
import { AIService } from './services/aiService.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import staffRoutes from './routes/staff.js';
import aiRoutes from './routes/ai.js';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin) => origin,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check route
app.get('/', (c) => {
  return c.json({
    status: 'success',
    message: 'KhoChuan POS API is running',
    version: c.env.API_VERSION || 'v1',
    environment: c.env.NODE_ENV || 'development'
  });
});

// Initialize services and routes
app.use('*', async (c, next) => {
  // Initialize database service
  const db = DatabaseService.initialize(c.env);
  c.set('db', db);
  
  // Initialize services
  c.set('authService', new AuthService(db, c.env));
  c.set('productService', new ProductService(db, c.env));
  c.set('customerService', new CustomerService(db, c.env));
  c.set('orderService', new OrderService(db, c.env));
  c.set('analyticsService', new AnalyticsService(db, c.env));
  c.set('gamificationService', new GamificationService(db, c.env));
  c.set('settingsService', new SettingsService(db, c.env));
  c.set('aiService', new AIService(db, c.env));
  
  await next();
});

// Register routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/products', productRoutes);
app.route('/api/v1/customers', customerRoutes);
app.route('/api/v1/orders', orderRoutes);
app.route('/api/v1/analytics', analyticsRoutes);
app.route('/api/v1/staff', staffRoutes);
app.route('/api/v1/ai', aiRoutes);

// Error handling
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  return c.json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    code: err.status || 500
  }, err.status || 500);
});

// Not found handler
app.notFound((c) => {
  return c.json({
    status: 'error',
    message: 'Endpoint not found',
    code: 404
  }, 404);
});

// Export app for Cloudflare Workers
export default app;