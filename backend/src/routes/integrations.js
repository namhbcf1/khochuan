/**
 * ============================================================================
 * INTEGRATIONS ROUTES
 * ============================================================================
 * Handles third-party integrations and external services
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/integrations/status
 * Get integration status
 */
router.get('/api/integrations/status', async (request, env, ctx) => {
  try {
    // Mock integration status - in real implementation, check actual services
    const integrations = [
      {
        name: 'Shopee',
        type: 'ecommerce',
        status: 'connected',
        last_sync: '2024-01-15T10:30:00Z'
      },
      {
        name: 'Lazada',
        type: 'ecommerce',
        status: 'disconnected',
        last_sync: null
      },
      {
        name: 'Payment Gateway',
        type: 'payment',
        status: 'connected',
        last_sync: '2024-01-15T11:00:00Z'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      data: integrations
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get integrations status error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch integrations status',
      code: 'FETCH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;