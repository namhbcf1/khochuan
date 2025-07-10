import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Create router instance
const router = Router({ base: '/cashier' });

// GET /cashier/pos/products - Get products for POS
router.get('/pos/products', async (request, env) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          products: [
            { id: '1', name: 'Product 1', price: 100, sku: 'SKU001', image: 'product1.jpg' },
            { id: '2', name: 'Product 2', price: 200, sku: 'SKU002', image: 'product2.jpg' },
            { id: '3', name: 'Product 3', price: 300, sku: 'SKU003', image: 'product3.jpg' }
          ]
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
        error: 'Failed to retrieve products'
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

// POST /cashier/pos/order - Create a new order
router.post('/pos/order', async (request, env) => {
  try {
    const body = await request.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderId: crypto.randomUUID(),
          orderNumber: 'ORD-' + Date.now(),
          total: body.total || 0,
          status: 'completed'
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
        error: 'Failed to create order'
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