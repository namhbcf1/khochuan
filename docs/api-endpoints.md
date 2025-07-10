# KhoChuan POS API Documentation

This document provides details on the available API endpoints for the KhoChuan POS system.

## Base URL

All API endpoints are relative to:
```
https://khochuan-pos-api.bangachieu2.workers.dev/api/v1
```

## Authentication

Most API endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

To obtain a token, use the login endpoint:

### Login

```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "admin|cashier|staff|customer"
    },
    "token": "jwt_token_string",
    "permissions": ["permission1", "permission2", ...]
  }
}
```

## API Endpoints

### 1. Authentication Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | User login | None |
| `/auth/register` | POST | User registration | None |
| `/auth/profile` | GET | Get current user profile | Required |
| `/auth/profile` | PUT | Update user profile | Required |
| `/auth/change-password` | POST | Change user password | Required |
| `/auth/verify` | GET | Verify token validity | Required |

### 2. Product Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/products` | GET | Get all products | Required |
| `/products/:id` | GET | Get product by ID | Required |
| `/products` | POST | Create new product | Admin only |
| `/products/:id` | PUT | Update product | Admin only |
| `/products/:id` | DELETE | Delete product | Admin only |
| `/products/categories` | GET | Get all categories | Required |
| `/products/:id/inventory` | GET | Get product inventory | Required |
| `/products/inventory/log` | POST | Log inventory change | Admin, Cashier |

### 3. Customer Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/customers` | GET | Get all customers | Required |
| `/customers/:id` | GET | Get customer by ID | Required |
| `/customers/profile/me` | GET | Get current customer profile | Customer |
| `/customers` | POST | Create new customer | Admin, Cashier |
| `/customers/:id` | PUT | Update customer | Admin, Cashier |
| `/customers/profile/me` | PUT | Update own profile | Customer |
| `/customers/:id` | DELETE | Delete customer | Admin only |
| `/customers/:id/orders` | GET | Get customer orders | Required |
| `/customers/:id/loyalty` | GET | Get loyalty points | Required |
| `/customers/:id/loyalty/add` | POST | Add loyalty points | Admin, Cashier |
| `/customers/:id/loyalty/redeem` | POST | Redeem loyalty points | Admin, Cashier |
| `/customers/:id/warranties` | GET | Get customer warranties | Required |
| `/customers/:id/warranty-claims` | GET | Get warranty claims | Required |
| `/customers/warranty` | POST | Register warranty | Required |
| `/customers/warranty-claim` | POST | Submit warranty claim | Required |

### 4. Order Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/orders` | GET | Get all orders | Required |
| `/orders/:id` | GET | Get order by ID | Required |
| `/orders` | POST | Create new order | Admin, Cashier |
| `/orders/:id` | PUT | Update order | Admin, Cashier |
| `/orders/:id` | DELETE | Cancel order | Admin only |
| `/orders/:id/refund` | POST | Process refund | Admin, Cashier |
| `/orders/reports/sales` | GET | Get sales reports | Admin only |
| `/orders/reports/daily` | GET | Get daily sales | Admin, Cashier |

### 5. Analytics Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/analytics/dashboard` | GET | Get dashboard data | Admin only |
| `/analytics/sales` | GET | Get sales analytics | Admin only |
| `/analytics/customers` | GET | Get customer analytics | Admin only |
| `/analytics/inventory` | GET | Get inventory analytics | Admin only |
| `/analytics/staff` | GET | Get staff performance | Admin only |
| `/analytics/forecasts/demand` | GET | Get demand forecasts | Admin only |
| `/analytics/reports` | POST | Generate custom report | Admin only |

### 6. Staff Endpoints

| Endpoint | Method | Description | Authorization |
|----------|--------|-------------|---------------|
| `/staff` | GET | Get all staff members | Admin, Manager |
| `/staff/:id` | GET | Get staff by ID | Admin, Manager |
| `/staff` | POST | Create new staff | Admin, Manager |
| `/staff/:id` | PUT | Update staff | Admin, Manager |
| `/staff/:id` | DELETE | Deactivate staff | Admin, Manager |
| `/staff/:id/stats` | GET | Get staff stats | Admin, Manager, Self |
| `/staff/me/stats` | GET | Get own stats | Staff, Cashier |
| `/staff/:id/points` | POST | Award points to staff | Admin, Manager |
| `/staff/badges` | GET | Get all badges | Any Auth |
| `/staff/challenges` | GET | Get all challenges | Any Auth |
| `/staff/challenges` | POST | Create new challenge | Admin, Manager |
| `/staff/leaderboard` | GET | Get staff leaderboard | Any Auth |

## Testing the API

You can test the API using the provided PowerShell script:

```
.\scripts\test-staff-api.ps1
```

This script will test all the major endpoints of the Staff API, including:
1. Authentication
2. Getting staff list
3. Creating staff
4. Getting staff stats
5. Awarding points
6. Getting leaderboard
7. Getting badges and challenges
8. Updating and deactivating staff

## Response Format

All API responses follow the same format:

Success response:
```json
{
  "status": "success",
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

Error response:
```json
{
  "status": "error",
  "message": "Error message",
  "code": 400 // HTTP status code
}
``` 