import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Create router instance
const router = Router({ base: '/admin' });

// GET /admin/dashboard - Dashboard data
router.get('/dashboard', async (request, env) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stats: {
            totalSales: 45000,
            totalOrders: 120,
            averageOrderValue: 375,
            newCustomers: 15
          },
          recentOrders: [],
          topProducts: []
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to retrieve dashboard data'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});

// Export the router
export default router; 