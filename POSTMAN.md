# Inventrack API Documentation for Postman

## Base URL
```
http://localhost:5001/api
```

## Authentication
All endpoints require authentication using JWT. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Environment Variables
Create a new environment in Postman with the following variables:
- `base_url`: http://localhost:5001/api
- `token`: Your JWT token after login
- `user_id`: Current user's ID
- `department_id`: Current department's ID

## User Management Endpoints

### Get All Users (Admin Only)
- **Method**: GET
- **Endpoint**: `/users`
- **Headers**: 
  - Authorization: Bearer token
- **Query Parameters**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `search`: Search term (optional)
  - `role`: Filter by role (optional)
- **Response**: Array of user objects with pagination

### Get User by ID
- **Method**: GET
- **Endpoint**: `/users/:id`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: User object

### Get Current User Profile
- **Method**: GET
- **Endpoint**: `/users/profile/me`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: User profile object

### Update User Profile
- **Method**: PUT
- **Endpoint**: `/users/profile/me`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
  ```
- **Response**: Updated user object

### Delete User Account
- **Method**: DELETE
- **Endpoint**: `/users/profile/me`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

### Deactivate User Account
- **Method**: POST
- **Endpoint**: `/users/profile/me/deactivate`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

### Activate User Account
- **Method**: POST
- **Endpoint**: `/users/profile/me/activate`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

## Department Management

### Get All Departments
- **Method**: GET
- **Endpoint**: `/departments`
- **Headers**: 
  - Authorization: Bearer token
- **Query Parameters**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `search`: Search term (optional)
- **Response**: Array of department objects with pagination

### Get Department by ID
- **Method**: GET
- **Endpoint**: `/departments/:id`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Department object

### Create Department
- **Method**: POST
- **Endpoint**: `/departments`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "manager": "string"
  }
  ```
- **Response**: Created department object

## Inventory Management

### Get All Inventory Items
- **Method**: GET
- **Endpoint**: `/inventory`
- **Headers**: 
  - Authorization: Bearer token
- **Query Parameters**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `search`: Search term (optional)
  - `category`: Filter by category (optional)
  - `sort`: Sort field (optional)
  - `order`: Sort order (optional)
- **Response**: Array of inventory items with pagination

### Get Inventory Item by ID
- **Method**: GET
- **Endpoint**: `/inventory/:id`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Inventory item object

### Create Inventory Item
- **Method**: POST
- **Endpoint**: `/inventory`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "price": "number",
    "quantity": "number"
  }
  ```
- **Response**: Created inventory item object

## Procurement Management

### Get All Procurement Requests
- **Method**: GET
- **Endpoint**: `/procurement`
- **Headers**: 
  - Authorization: Bearer token
- **Query Parameters**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `status`: Filter by status (optional)
  - `department`: Filter by department (optional)
  - `dateFrom`: Filter by start date (optional)
  - `dateTo`: Filter by end date (optional)
- **Response**: Array of procurement requests with pagination

### Create Procurement Request
- **Method**: POST
- **Endpoint**: `/procurement`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "item": "string",
    "quantity": "number",
    "department": "string",
    "reason": "string",
    "priority": "string"
  }
  ```
- **Response**: Created procurement request object

## Incident Reports

### Get All Incident Reports
- **Method**: GET
- **Endpoint**: `/incident-reports`
- **Headers**: 
  - Authorization: Bearer token
- **Query Parameters**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `status`: Filter by status (optional)
  - `department`: Filter by department (optional)
  - `dateFrom`: Filter by start date (optional)
  - `dateTo`: Filter by end date (optional)
- **Response**: Array of incident reports with pagination

### Create Incident Report
- **Method**: POST
- **Endpoint**: `/incident-reports`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "department": "string",
    "priority": "string"
  }
  ```
- **Response**: Created incident report object

## User Preferences

### Get User Preferences
- **Method**: GET
- **Endpoint**: `/preferences`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: User preferences object

### Update User Preferences
- **Method**: PUT
- **Endpoint**: `/preferences`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "theme": "string",
    "notifications": "boolean",
    "language": "string",
    "timezone": "string"
  }
  ```
- **Response**: Updated preferences object

## Session Management

### Get Active Sessions
- **Method**: GET
- **Endpoint**: `/sessions`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Array of active sessions

### Terminate Session
- **Method**: DELETE
- **Endpoint**: `/sessions/:id`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

## Error Responses
All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": ["error details"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Importing to Postman
1. Open Postman
2. Click "Import" button
3. Choose "File" > "Upload Files"
4. Select the Postman collection file (if available)
5. Click "Import"

## Testing the API
1. First, authenticate using the login endpoint
2. Copy the JWT token from the response
3. Set the token in your environment variables
4. Use the token in the Authorization header for subsequent requests

## Pre-request Scripts
Add the following pre-request script to automatically add the Authorization header:
```javascript
if (pm.environment.get('token')) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get('token')
    });
}
```

## Test Scripts
Add the following test script to verify successful responses:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success property", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

## Rate Limiting
The API implements rate limiting:
- 100 requests per 15 minutes per IP
- Rate limit headers in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset` 