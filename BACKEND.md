# Inventrack Backend Documentation

## Overview
The Inventrack backend is a Node.js/Express.js application that provides a RESTful API for inventory management, procurement, user management, and department management.

## Tech Stack
- Node.js
- Express.js
- PostgreSQL (with Neon Serverless)
- JWT Authentication
- Various security middleware (helmet, cors, rate limiting)

## Project Structure
```
backend/
├── app.js              # Main application setup
├── server.js           # Server entry point
├── routes/             # API route definitions
├── controllers/        # Request handlers
├── services/          # Business logic layer
├── models/            # Database models
├── middleware/        # Custom middleware
├── utils/            # Utility functions
├── config/           # Configuration files
└── database/         # Database connection and setup
```

## API Endpoints

### Authentication (`/auth`)
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/logout` - User logout

### Users (`/users`)
- GET `/users` - Get all users
- GET `/users/:id` - Get user by ID
- POST `/users` - Create new user
- PUT `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

### Departments (`/departments`)
- GET `/departments` - Get all departments
- GET `/departments/:id` - Get department by ID
- POST `/departments` - Create new department
- PUT `/departments/:id` - Update department
- DELETE `/departments/:id` - Delete department

### Inventory (`/inventory`)
- GET `/inventory` - Get all inventory items
- GET `/inventory/:id` - Get inventory item by ID
- POST `/inventory` - Create new inventory item
- PUT `/inventory/:id` - Update inventory item
- DELETE `/inventory/:id` - Delete inventory item

### Procurement (`/procurement`)
- GET `/procurement` - Get all procurement records
- GET `/procurement/:id` - Get procurement record by ID
- POST `/procurement` - Create new procurement record
- PUT `/procurement/:id` - Update procurement record
- DELETE `/procurement/:id` - Delete procurement record

## Security Features
1. Rate Limiting
   - 100 requests per 15 minutes per IP
   - Prevents brute force attacks
   - Configurable limits per endpoint

2. Security Headers (Helmet)
   - Sets various HTTP headers for security
   - Protects against common web vulnerabilities
   - Content Security Policy (CSP) enabled

3. CORS Protection
   - Cross-Origin Resource Sharing configuration
   - Controls which domains can access the API
   - Configurable allowed origins

4. Request Logging (Morgan)
   - Development logging for debugging
   - Request/response monitoring
   - Custom log format

## Error Handling
The application implements a global error handling middleware that:
- Logs errors to console
- Returns appropriate HTTP status codes
- Provides structured error responses
- Handles 404 (Not Found) errors
- Custom error classes for different error types

## Environment Variables
Required environment variables:
- `PORT` - Server port (defaults to 5001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `NODE_ENV` - Environment (development/production)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file
   - Add required environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Best Practices
1. All routes are protected by rate limiting
2. JSON parsing middleware for request bodies
3. Proper error handling and logging
4. Modular architecture with separate routes, controllers, services, and models
5. Security headers and CORS protection
6. Structured API responses
7. Input validation using express-validator
8. Database connection pooling
9. Transaction support for critical operations

## API Response Format
All API responses follow a consistent format:
```json
{
    "success": true/false,
    "data": {}, // For successful responses
    "error": "Error name", // For error responses
    "message": "Response message"
}
``` 