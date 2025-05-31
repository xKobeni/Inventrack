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

## User Management Endpoints

### Get All Users (Admin Only)
- **Method**: GET
- **Endpoint**: `/users`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Array of user objects

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

### Deactivate Any User (Admin Only)
- **Method**: POST
- **Endpoint**: `/users/:id/deactivate`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

### Activate Any User (Admin Only)
- **Method**: POST
- **Endpoint**: `/users/:id/activate`
- **Headers**: 
  - Authorization: Bearer token
- **Response**: Success message

### Update Any User Profile (Admin Only)
- **Method**: PUT
- **Endpoint**: `/users/:id`
- **Headers**: 
  - Authorization: Bearer token
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string"
  }
  ```
- **Response**: Updated user object

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

## Environment Variables
Create a new environment in Postman with the following variables:
- `base_url`: http://localhost:5001/api
- `token`: Your JWT token after login

## Testing the API
1. First, authenticate using the login endpoint
2. Copy the JWT token from the response
3. Set the token in your environment variables
4. Use the token in the Authorization header for subsequent requests 