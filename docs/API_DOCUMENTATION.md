# KM MOTOS - API Documentation

## Base URL
```
https://jwsxkmbvqtjhvxotiegx.supabase.co/rest/v1/
```

## Authentication
All requests require authentication headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3hrbWJ2cXRqaHZ4b3RpZWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODIyNTQsImV4cCI6MjA2NzE1ODI1NH0.FeaICosHsNc57r251y4e3KfAJ1cKoeolEfrj0a1SPuk
```

## Core Endpoints

### Authentication
- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - Login user
- `POST /auth/v1/logout` - Logout user
- `POST /auth/v1/recover` - Password recovery

### Products
- `GET /products` - Get all products
- `GET /products?id=eq.{id}` - Get product by ID
- `GET /products?category_id=eq.{category_id}` - Get products by category
- `GET /products?name=ilike.%{search}%` - Search products
- `POST /rpc/search_products` - Advanced product search

### Categories
- `GET /categories` - Get all categories
- `GET /categories?id=eq.{id}` - Get category by ID

### Brands
- `GET /brands` - Get all brands
- `GET /brands?id=eq.{id}` - Get brand by ID

### User Profile
- `GET /profiles?id=eq.{user_id}` - Get user profile
- `PATCH /profiles?id=eq.{user_id}` - Update user profile
- `POST /profiles` - Create user profile

### Addresses
- `GET /addresses?user_id=eq.{user_id}` - Get user addresses
- `POST /addresses` - Create new address
- `PATCH /addresses?id=eq.{address_id}` - Update address
- `DELETE /addresses?id=eq.{address_id}` - Delete address

### Orders
- `GET /orders?user_id=eq.{user_id}` - Get user orders
- `POST /rpc/create_order_with_items` - Create order with items
- `PATCH /orders?id=eq.{order_id}` - Update order status

### Order Items
- `GET /order_items?order_id=eq.{order_id}` - Get order items
- `GET /order_items?order_id=eq.{order_id}&select=*,product:products(*)` - Get order items with product details

### Wholesaler Features
- `POST /wholesaler_requests` - Submit wholesaler request
- `GET /wholesaler_requests?user_id=eq.{user_id}` - Get user wholesaler requests
- `GET /wholesaler_pricing?product_id=eq.{product_id}` - Get wholesaler pricing
- `POST /rpc/get_wholesaler_pricing` - Get formatted wholesaler pricing

### Stores
- `GET /stores` - Get all stores
- `GET /stores?is_active=eq.true` - Get active stores

### Delivery Options
- `GET /delivery_options` - Get all delivery options
- `GET /delivery_options?is_active=eq.true` - Get active delivery options

### Coupons
- `GET /coupons?code=eq.{code}` - Get coupon by code
- `POST /rpc/validate_coupon` - Validate coupon

### Product Reviews
- `GET /product_reviews?product_id=eq.{product_id}` - Get product reviews
- `POST /product_reviews` - Create product review
- `PATCH /product_reviews?id=eq.{review_id}` - Update review

### Support Tickets
- `GET /support_tickets?user_id=eq.{user_id}` - Get user support tickets
- `POST /support_tickets` - Create support ticket

## Custom RPC Functions

### Search Products
```javascript
POST /rpc/search_products
{
  "search_query": "casco",
  "category_filter": "uuid",
  "brand_filter": "uuid", 
  "min_price": 50,
  "max_price": 200,
  "sort_by": "price",
  "sort_order": "asc",
  "page_limit": 20,
  "page_offset": 0
}
```

### Create Order with Items
```javascript
POST /rpc/create_order_with_items
{
  "client_id_param": "uuid",
  "user_id_param": "uuid",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 100.00
    }
  ],
  "delivery_address_id_param": "uuid",
  "delivery_option_id_param": "uuid",
  "payment_method_param": "cash_on_delivery",
  "coupon_code_param": "WELCOME10"
}
```

### Get User Orders
```javascript
POST /rpc/get_user_orders
{
  "user_id_param": "uuid"
}
```

### Validate Coupon
```javascript
POST /rpc/validate_coupon
{
  "coupon_code_param": "WELCOME10",
  "order_amount": 150.00
}
```

### Get Wholesaler Pricing
```javascript
POST /rpc/get_wholesaler_pricing
{
  "product_id_param": 1
}
```

## Response Formats

### Success Response
```json
{
  "data": [...],
  "status": 200,
  "statusText": "OK"
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "details": "Detailed error information",
    "hint": "Suggestion to fix the error",
    "code": "ERROR_CODE"
  }
}
```

## Query Parameters

### Filtering
- `eq` - Equals
- `neq` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `like` - Pattern matching
- `ilike` - Case insensitive pattern matching
- `in` - In list
- `is` - Is null/not null

### Ordering
- `order=column.asc` - Ascending order
- `order=column.desc` - Descending order

### Pagination
- `limit=20` - Limit results
- `offset=0` - Skip results

### Selection
- `select=*` - Select all columns
- `select=id,name,price` - Select specific columns
- `select=*,category:categories(name)` - Join with related table

## Example Requests

### Get Products with Category and Brand
```javascript
GET /products?select=*,category:categories(name),brand:brands(name)&limit=20
```

### Search Products by Name
```javascript
GET /products?name=ilike.%casco%&select=*&order=price.asc
```

### Get User Orders with Items
```javascript
GET /orders?user_id=eq.{user_id}&select=*,order_items:order_items(*,product:products(*))
```

### Create New Address
```javascript
POST /addresses
{
  "user_id": "uuid",
  "label": "Casa",
  "address_line_1": "Jr. Miguel Grau 129",
  "city": "Lima",
  "country": "Honduras",
  "is_default": true
}
```

### Update User Profile
```javascript
PATCH /profiles?id=eq.{user_id}
{
  "full_name": "Paolo Fernandez",
  "phone_number": "+504 9400-1163",
  "is_wholesaler": true
}
```

## Rate Limits
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks
Available webhook events:
- `order.created`
- `order.updated`
- `user.registered`
- `wholesaler_request.submitted`

Configure webhooks in Supabase Dashboard under Database > Webhooks.