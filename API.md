# Inventrack API Documentation

This document provides detailed information about the Inventrack API endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:5001
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

Request Body:
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string" // optional, defaults to "user"
}
```

Response:
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

#### Login
```http
POST /auth/login
```

Request Body:
```json
{
    "email": "string",
    "password": "string"
}
```

Response:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "string",
        "user": {
            "id": "string",
            "username": "string",
            "email": "string",
            "role": "string"
        }
    }
}
```

#### Logout
```http
POST /auth/logout
```

Response:
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Inventory Management

#### Get All Products
```http
GET /api/products
```

Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for product name/description
- `category` (optional): Filter by category
- `sort` (optional): Sort field (e.g., "name", "price", "createdAt")
- `order` (optional): Sort order ("asc" or "desc")

Response:
```json
{
    "success": true,
    "data": {
        "products": [
            {
                "id": "string",
                "name": "string",
                "description": "string",
                "category": "string",
                "price": "number",
                "quantity": "number",
                "createdAt": "date",
                "updatedAt": "date"
            }
        ],
        "pagination": {
            "total": "number",
            "page": "number",
            "limit": "number",
            "pages": "number"
        }
    }
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

Response:
```json
{
    "success": true,
    "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "quantity": "number",
        "createdAt": "date",
        "updatedAt": "date"
    }
}
```

#### Create Product
```http
POST /api/products
```

Request Body:
```json
{
    "name": "string",
    "description": "string",
    "category": "string",
    "price": "number",
    "quantity": "number"
}
```

Response:
```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "quantity": "number",
        "createdAt": "date",
        "updatedAt": "date"
    }
}
```

#### Update Product
```http
PUT /api/products/:id
```

Request Body:
```json
{
    "name": "string",
    "description": "string",
    "category": "string",
    "price": "number",
    "quantity": "number"
}
```

Response:
```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "quantity": "number",
        "createdAt": "date",
        "updatedAt": "date"
    }
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

Response:
```json
{
    "success": true,
    "message": "Product deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "success": false,
    "error": "Validation error",
    "message": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "error": "Unauthorized",
    "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "error": "Forbidden",
    "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
    "success": false,
    "error": "Not Found",
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Data Types

- `string`: Text data
- `number`: Numeric data (integers and decimals)
- `date`: ISO 8601 formatted date strings
- `boolean`: true/false values

## Best Practices

1. Always include the `Authorization` header for protected endpoints
2. Use appropriate HTTP methods for each operation
3. Handle rate limiting by implementing exponential backoff
4. Cache responses when appropriate
5. Implement proper error handling
6. Use pagination for large data sets
7. Validate input data before sending requests 