/**
 * KhoChuan POS - AI Service Tests
 * Test suite for AI features including customer segmentation, 
 * demand forecasting, price optimization, and recommendations
 */

import { expect, test, describe, beforeAll, afterAll } from '@playwright/test';
import { loginAsAdmin, loginAsCustomer } from './helpers/auth';

const API_URL = process.env.API_URL || 'https://khochuan-pos.bangachieu2.workers.dev';

describe('AI Service Tests', () => {
  let adminToken;
  let customerToken;
  let testCustomerId = 'cust_test_001';

  beforeAll(async ({ request }) => {
    adminToken = await loginAsAdmin(request);
    customerToken = await loginAsCustomer(request);

    // Create test data if needed
    await request.post(`${API_URL}/api/v1/customers`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        id: testCustomerId,
        name: 'AI Test Customer',
        email: 'ai-test@khochuan.com',
        phone: '0901234567',
        total_spent: 5000000,
        visit_count: 5,
        loyalty_points: 250,
        is_active: true
      }
    });
  });

  afterAll(async ({ request }) => {
    // Clean up test data
    await request.delete(`${API_URL}/api/v1/customers/${testCustomerId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  });

  test('Customer segmentation should return valid segments', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/ai/customer-segmentation`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.segments).toBeDefined();
    expect(data.metadata).toBeDefined();
    expect(data.metadata.totalCustomers).toBeGreaterThan(0);
    
    // Check if all segment types exist
    const segmentTypes = [
      'champions', 'loyal_customers', 'potential_loyalists', 
      'new_customers', 'promising', 'at_risk', 
      'cant_lose', 'hibernating', 'lost'
    ];
    
    segmentTypes.forEach(segment => {
      expect(data.segments[segment]).toBeDefined();
    });
  });

  test('Demand forecasting should return valid predictions', async ({ request }) => {
    // Get a product ID to test with
    const productsResponse = await request.get(`${API_URL}/api/v1/products?limit=1`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const products = await productsResponse.json();
    const testProductId = products.data.products[0].id;
    
    const response = await request.get(`${API_URL}/api/v1/ai/demand-forecasting?productId=${testProductId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.forecast).toBeDefined();
    expect(Array.isArray(data.forecast)).toBeTruthy();
    
    if (data.forecast.length > 0) {
      const product = data.forecast[0];
      expect(product.product_id).toBe(testProductId);
      expect(product.forecast).toBeDefined();
      expect(Array.isArray(product.forecast)).toBeTruthy();
      expect(product.forecast.length).toBeGreaterThan(0);
    }
  });

  test('Price optimization should return valid suggestions', async ({ request }) => {
    // Get a product ID to test with
    const productsResponse = await request.get(`${API_URL}/api/v1/products?limit=1`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const products = await productsResponse.json();
    const testProductId = products.data.products[0].id;
    
    const response = await request.get(`${API_URL}/api/v1/ai/price-optimization?productId=${testProductId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.suggestions).toBeDefined();
    expect(Array.isArray(data.suggestions)).toBeTruthy();
    
    if (data.suggestions.length > 0) {
      const suggestion = data.suggestions[0];
      expect(suggestion.product_id).toBe(testProductId);
      expect(suggestion.current_price).toBeDefined();
      expect(suggestion.suggested_price).toBeDefined();
      expect(suggestion.margin).toBeDefined();
      expect(suggestion.confidence).toBeDefined();
    }
  });

  test('Product recommendations should return personalized suggestions', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/ai/recommendations/${testCustomerId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.customer_id).toBe(testCustomerId);
    expect(data.recommendations).toBeDefined();
    expect(Array.isArray(data.recommendations)).toBeTruthy();
    
    if (data.recommendations.length > 0) {
      const recommendation = data.recommendations[0];
      expect(recommendation.product_id).toBeDefined();
      expect(recommendation.product_name).toBeDefined();
      expect(recommendation.price).toBeDefined();
      expect(recommendation.category).toBeDefined();
      expect(recommendation.reason).toBeDefined();
    }
  });

  test('Only authorized users should be able to access AI endpoints', async ({ request }) => {
    // Test without token
    const response = await request.get(`${API_URL}/api/v1/ai/customer-segmentation`);
    expect(response.status()).toBe(401);
    
    // Test with customer token for admin-only endpoint
    const customerResponse = await request.get(`${API_URL}/api/v1/ai/customer-segmentation`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    expect(customerResponse.status()).toBe(403);
  });
}); 