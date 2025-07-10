# KhoChuan POS - AI API Documentation

This document provides detailed information about the AI features available in the KhoChuan POS system and how to use them through the API.

## Base URL

```
/api/v1/ai
```

All endpoints require authentication via JWT token in the Authorization header, unless otherwise specified.

```
Authorization: Bearer <token>
```

## AI Features Overview

The KhoChuan POS system includes the following AI features:

1. **Customer Segmentation** - Segment customers based on RFM (Recency, Frequency, Monetary) analysis
2. **Demand Forecasting** - Predict future product demand to optimize inventory
3. **Price Optimization** - Recommend optimal pricing strategies based on elasticity and market factors
4. **Product Recommendations** - Generate personalized product recommendations for customers

## Endpoints

### Customer Segmentation

#### Get Customer Segments

```
GET /customer-segments
```

Segments customers based on their purchase history using RFM (Recency, Frequency, Monetary) analysis.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timeframe | string | No | Time period for analysis. Options: '30d', '90d', '180d', '365d'. Default: '90d' |
| segment_count | integer | No | Number of segments to create. Range: 3-10. Default: 5 |

**Response:**

```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "id": "champions",
        "name": "Champions",
        "description": "High-value customers who purchased recently and frequently",
        "customer_count": 120,
        "percentage": 12.5,
        "avg_recency_days": 5.2,
        "avg_frequency": 8.3,
        "avg_monetary": 1250.45,
        "customers": [
          {
            "id": 1045,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "rfm_score": {
              "recency": 5,
              "frequency": 5,
              "monetary": 5,
              "total": 15
            },
            "last_purchase": "2023-05-15T10:30:00Z",
            "purchase_count": 12,
            "total_spent": 1850.75
          }
          // More customers...
        ]
      }
      // More segments...
    ],
    "metadata": {
      "total_customers": 960,
      "analysis_timeframe": "90d",
      "segment_count": 5,
      "generated_at": "2023-06-01T08:15:30Z"
    }
  }
}
```

### Demand Forecasting

#### Get Demand Forecast

```
GET /demand-forecast
```

Generates demand forecasts for products to optimize inventory planning.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| forecast_period | string | No | Forecast horizon. Options: '7d', '14d', '30d', '90d'. Default: '30d' |
| category_id | integer | No | Filter by category ID |
| product_id | integer | No | Filter by specific product ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "product_id": 123,
        "product_name": "Smartphone X",
        "sku": "SP-X-001",
        "current_stock": 45,
        "forecast": [
          {
            "date": "2023-06-01",
            "predicted_demand": 5.2,
            "lower_bound": 3.1,
            "upper_bound": 7.3
          },
          // More daily forecasts...
        ],
        "summary": {
          "total_predicted_demand": 156,
          "avg_daily_demand": 5.2,
          "trend": "increasing",
          "seasonal_factors": {
            "monday": 1.2,
            "tuesday": 0.9,
            "wednesday": 1.0,
            "thursday": 1.1,
            "friday": 1.3,
            "saturday": 1.5,
            "sunday": 0.8
          },
          "stock_status": "adequate",
          "days_until_stockout": 28,
          "reorder_recommendation": {
            "should_reorder": false,
            "recommended_quantity": 0,
            "optimal_order_date": "2023-06-25"
          }
        }
      }
      // More product forecasts...
    ],
    "metadata": {
      "forecast_period": "30d",
      "generated_at": "2023-06-01T08:15:30Z",
      "accuracy_metrics": {
        "mape": 0.12,
        "rmse": 2.3
      }
    }
  }
}
```

### Price Optimization

#### Get Price Optimization

```
GET /price-optimization
```

Recommends optimal pricing strategies based on elasticity and market factors.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| optimization_target | string | No | Target to optimize. Options: 'revenue', 'profit', 'units'. Default: 'revenue' |
| category_id | integer | No | Filter by category ID |
| product_id | integer | No | Filter by specific product ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "optimizations": [
      {
        "product_id": 123,
        "product_name": "Smartphone X",
        "sku": "SP-X-001",
        "current_price": 499.99,
        "optimized_price": 529.99,
        "cost": 350.00,
        "current_revenue": 24999.50,
        "expected_revenue": 26499.50,
        "current_profit": 7499.50,
        "expected_profit": 8999.50,
        "current_units": 50,
        "expected_units": 48,
        "price_elasticity": -1.2,
        "confidence_score": 0.85
      }
      // More product optimizations...
    ],
    "metadata": {
      "optimization_target": "revenue",
      "total_revenue_increase_percentage": 6.0,
      "total_profit_increase_percentage": 8.5,
      "average_price_change_percentage": 3.2,
      "generated_at": "2023-06-01T08:15:30Z"
    }
  }
}
```

#### Simulate Price

```
POST /price-simulation
```

Simulates the impact of a specific price change for a product.

**Request Body:**

```json
{
  "product_id": 123,
  "price": 529.99
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product_id": 123,
    "product_name": "Smartphone X",
    "sku": "SP-X-001",
    "cost": 350.00,
    "current_price": 499.99,
    "optimized_price": 529.99,
    "simulated_price": 529.99,
    "price_elasticity": -1.2,
    "current_demand": 50,
    "simulated_demand": 48,
    "current_revenue": 24999.50,
    "simulated_revenue": 25439.52,
    "current_profit": 7499.50,
    "simulated_profit": 8639.52,
    "elasticity_curve": [
      {
        "price": 449.99,
        "expected_demand": 55
      },
      {
        "price": 474.99,
        "expected_demand": 52
      },
      {
        "price": 499.99,
        "expected_demand": 50
      },
      {
        "price": 524.99,
        "expected_demand": 48
      },
      {
        "price": 549.99,
        "expected_demand": 45
      }
      // More price points...
    ]
  }
}
```

### Product Recommendations

#### Get Recommendations

```
GET /recommendations
```

Generates personalized product recommendations for a specific customer.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID to generate recommendations for |
| limit | integer | No | Maximum number of recommendations per type. Range: 1-20. Default: 5 |

**Response:**

```json
{
  "success": true,
  "data": {
    "personalized": [
      {
        "product_id": 123,
        "product_name": "Smartphone X",
        "sku": "SP-X-001",
        "price": 499.99,
        "image_url": "https://example.com/images/smartphone-x.jpg",
        "category_id": 5,
        "category_name": "Smartphones",
        "recommendation_type": "personalized",
        "recommendation_reason": "Based on your shopping history"
      }
      // More personalized recommendations...
    ],
    "trending": [
      // Trending product recommendations...
    ],
    "similar": [
      // Similar product recommendations...
    ],
    "complementary": [
      // Complementary product recommendations...
    ]
  }
}
```

#### Get Trending Products

```
GET /trending-products
```

Returns trending products based on recent sales and popularity.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | integer | No | Filter by category ID |
| limit | integer | No | Maximum number of trending products. Range: 1-20. Default: 5 |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "product_id": 123,
      "product_name": "Smartphone X",
      "sku": "SP-X-001",
      "price": 499.99,
      "image_url": "https://example.com/images/smartphone-x.jpg",
      "category_id": 5,
      "category_name": "Smartphones",
      "recommendation_type": "trending",
      "recommendation_reason": "Selling fast"
    }
    // More trending products...
  ]
}
```

#### Get Similar Products

```
GET /similar-products/:productId
```

Returns products similar to the specified product.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | integer | Yes | Product ID to find similar products for |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum number of similar products. Range: 1-20. Default: 5 |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "product_id": 124,
      "product_name": "Smartphone Y",
      "sku": "SP-Y-001",
      "price": 549.99,
      "image_url": "https://example.com/images/smartphone-y.jpg",
      "category_id": 5,
      "category_name": "Smartphones",
      "recommendation_type": "similar",
      "recommendation_reason": "Similar to Smartphone X"
    }
    // More similar products...
  ]
}
```

#### Get Complementary Products

```
GET /complementary-products/:productId
```

Returns complementary products (frequently bought together) for the specified product.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | integer | Yes | Product ID to find complementary products for |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum number of complementary products. Range: 1-20. Default: 5 |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "product_id": 456,
      "product_name": "Phone Case",
      "sku": "PC-001",
      "price": 29.99,
      "image_url": "https://example.com/images/phone-case.jpg",
      "category_id": 8,
      "category_name": "Accessories",
      "recommendation_type": "complementary",
      "recommendation_reason": "Frequently bought with Smartphone X"
    }
    // More complementary products...
  ]
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information or error code"
}
```

Common HTTP status codes:

- `400 Bad Request` - Invalid parameters or request body
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions to access the resource
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error 