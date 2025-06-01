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

## Postman Collection

You can import the Postman collection using the following link:
[Inventrack API Collection](https://www.postman.com/collections/your-collection-id)

The collection includes:
- Environment variables setup
- Pre-request scripts for authentication
- Example requests for all endpoints
- Test scripts for response validation

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

### User Management

#### Get All Users
```http
GET /users
```

Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for username/email
- `role` (optional): Filter by role

Response:
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": "string",
                "username": "string",
                "email": "string",
                "role": "string",
                "createdAt": "date"
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

#### Get User by ID
```http
GET /users/:id
```

Response:
```json
{
    "success": true,
    "data": {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "createdAt": "date"
    }
}
```

#### Update User
```http
PUT /users/:id
```

Request Body:
```json
{
    "username": "string",
    "email": "string",
    "role": "string"
}
```

Response:
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "updatedAt": "date"
    }
}
```

### Department Management

#### Get All Departments
```http
GET /departments
```

Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for department name

Response:
```json
{
    "success": true,
    "data": {
        "departments": [
            {
                "id": "string",
                "name": "string",
                "description": "string",
                "manager": "string",
                "createdAt": "date"
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

#### Create Department
```http
POST /departments
```

Request Body:
```json
{
    "name": "string",
    "description": "string",
    "manager": "string"
}
```

Response:
```json
{
    "success": true,
    "message": "Department created successfully",
    "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "manager": "string",
        "createdAt": "date"
    }
}
```

### Inventory Management

#### Get All Inventory Items
```http
GET /inventory
```

Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for item name/description
- `category` (optional): Filter by category
- `sort` (optional): Sort field (e.g., "name", "price", "createdAt")
- `order` (optional): Sort order ("asc" or "desc")

Response:
```json
{
    "success": true,
    "data": {
        "items": [
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

#### Get Inventory Item by ID
```http
GET /inventory/:id
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

#### Create Inventory Item
```http
POST /inventory
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
    "message": "Inventory item created successfully",
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

#### Update Inventory Item
```http
PUT /inventory/:id
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
    "message": "Inventory item updated successfully",
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

#### Delete Inventory Item
```http
DELETE /inventory/:id
```

Response:
```json
{
    "success": true,
    "message": "Inventory item deleted successfully"
}
```

### Procurement Management

#### Get All Procurement Requests
```http
GET /procurement
```

Query Parameters:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by status (pending, approved, rejected)
- `department` (optional): Filter by department
- `dateFrom` (optional): Filter by start date
- `dateTo` (optional): Filter by end date

Response:
```json
{
    "success": true,
    "data": {
        "requests": [
            {
                "id": "string",
                "item": "string",
                "quantity": "number",
                "department": "string",
                "requestedBy": "string",
                "status": "string",
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

#### Create Procurement Request
```http
POST /procurement
```

Request Body:
```json
{
    "item": "string",
    "quantity": "number",
    "department": "string",
    "reason": "string",
    "priority": "string" // high, medium, low
}
```

Response:
```json
{
    "success": true,
    "message": "Procurement request created successfully",
    "data": {
        "id": "string",
        "item": "string",
        "quantity": "number",
        "department": "string",
        "requestedBy": "string",
        "status": "pending",
        "createdAt": "date"
    }
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

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

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