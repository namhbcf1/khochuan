/**
 * Customer API Routes
 * Handles customer-facing endpoints for product lookup, warranty information, and order details
 */

import { Router } from 'itty-router';
import { verifyToken } from '../middleware/auth';
import { corsHeaders } from '../utils/cors';

const router = Router({ base: '/customer' });

/**
 * @route GET /customer/lookup
 * @desc Look up customer information by phone or order ID
 * @access Public
 */
router.get('/lookup', async (request, env) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const value = url.searchParams.get('value');
    
    if (!type || !value) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    let customer;
    let orders = [];
    let products = [];
    
    // Connect to D1 database
    const db = env.DB;
    
    if (type === 'phone') {
      // Look up by phone number
      customer = await db.prepare(
        'SELECT * FROM customers WHERE phone = ?'
      ).bind(value).first();
      
      if (!customer) {
        return new Response(JSON.stringify({ 
          error: 'Customer not found' 
        }), { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }
      
      // Get customer orders
      orders = await db.prepare(
        'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC'
      ).bind(customer.id).all();
      
      // Get order IDs
      const orderIds = orders.results.map(order => order.id);
      
      if (orderIds.length > 0) {
        // Get products from orders
        products = await db.prepare(
          `SELECT oi.*, p.name, p.category, p.price 
           FROM order_items oi 
           JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
           ORDER BY oi.order_id DESC`
        ).bind(...orderIds).all();
      }
    } else if (type === 'order') {
      // Look up by order ID
      const order = await db.prepare(
        'SELECT * FROM orders WHERE id = ?'
      ).bind(value).first();
      
      if (!order) {
        return new Response(JSON.stringify({ 
          error: 'Order not found' 
        }), { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }
      
      // Get customer
      customer = await db.prepare(
        'SELECT * FROM customers WHERE id = ?'
      ).bind(order.customer_id).first();
      
      // Get all orders for this customer
      orders = await db.prepare(
        'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC'
      ).bind(customer.id).all();
      
      // Get products from this order
      products = await db.prepare(
        `SELECT oi.*, p.name, p.category, p.price 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?
         ORDER BY oi.id`
      ).bind(value).all();
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid lookup type' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Format response
    const response = {
      customer,
      orders: orders.results || [],
      products: products.results || []
    };
    
    return new Response(JSON.stringify(response), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  } catch (error) {
    console.error('Error in customer lookup:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
});

/**
 * @route GET /customer/order/:id
 * @desc Get order details by ID (used for QR code scanning)
 * @access Public
 */
router.get('/order/:id', async (request, env) => {
  try {
    const { id } = request.params;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'Order ID is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Connect to D1 database
    const db = env.DB;
    
    // Get order
    const order = await db.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(id).first();
    
    if (!order) {
      return new Response(JSON.stringify({ 
        error: 'Order not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Get customer
    const customer = await db.prepare(
      'SELECT * FROM customers WHERE id = ?'
    ).bind(order.customer_id).first();
    
    // Get products from this order
    const products = await db.prepare(
      `SELECT oi.*, p.name, p.category, p.price 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?
       ORDER BY oi.id`
    ).bind(id).all();
    
    // Format response
    const response = {
      order,
      customer,
      products: products.results || []
    };
    
    return new Response(JSON.stringify(response), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
});

/**
 * @route GET /customer/warranty/:serialNumber
 * @desc Get warranty information for a product
 * @access Public
 */
router.get('/warranty/:serialNumber', async (request, env) => {
  try {
    const { serialNumber } = request.params;
    
    if (!serialNumber) {
      return new Response(JSON.stringify({ 
        error: 'Serial number is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Connect to D1 database
    const db = env.DB;
    
    // Get product information with warranty
    const product = await db.prepare(
      `SELECT oi.*, p.name, p.category, p.price, o.created_at as purchase_date, c.name as customer_name, c.phone as customer_phone
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       JOIN orders o ON oi.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       WHERE oi.serial_number = ?`
    ).bind(serialNumber).first();
    
    if (!product) {
      return new Response(JSON.stringify({ 
        error: 'Product not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    return new Response(JSON.stringify(product), { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  } catch (error) {
    console.error('Error getting warranty information:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
});

/**
 * @route GET /customer/invoice/:orderId/preview
 * @desc Get invoice preview as blob
 * @access Public
 */
router.get('/invoice/:orderId/preview', async (request, env) => {
  try {
    const { orderId } = request.params;
    
    if (!orderId) {
      return new Response(JSON.stringify({ 
        error: 'Order ID is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Get invoice from R2 storage
    const invoiceKey = `invoices/${orderId}.pdf`;
    const invoice = await env.STORAGE.get(invoiceKey);
    
    if (!invoice) {
      return new Response(JSON.stringify({ 
        error: 'Invoice not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Return invoice as PDF
    return new Response(await invoice.arrayBuffer(), { 
      headers: { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${orderId}.pdf"`,
        ...corsHeaders 
      } 
    });
  } catch (error) {
    console.error('Error getting invoice preview:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
});

/**
 * @route GET /customer/invoice/:orderId
 * @desc Download invoice PDF
 * @access Public
 */
router.get('/invoice/:orderId', async (request, env) => {
  try {
    const { orderId } = request.params;
    
    if (!orderId) {
      return new Response(JSON.stringify({ 
        error: 'Order ID is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Get invoice from R2 storage
    const invoiceKey = `invoices/${orderId}.pdf`;
    const invoice = await env.STORAGE.get(invoiceKey);
    
    if (!invoice) {
      return new Response(JSON.stringify({ 
        error: 'Invoice not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    // Return invoice as downloadable PDF
    return new Response(await invoice.arrayBuffer(), { 
      headers: { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderId}.pdf"`,
        ...corsHeaders 
      } 
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
});

export default router; 