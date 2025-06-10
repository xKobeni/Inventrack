# Backend Libraries Documentation

This document provides information about the libraries used in the Inventrack backend application.

## Core Dependencies

### Express.js
- **Version**: Latest
- **Description**: A fast, unopinionated, minimalist web framework for Node.js
- **Purpose**: Used as the main web application framework to handle HTTP requests, routing, and middleware
- **Documentation**: [Express.js Documentation](https://expressjs.com/)

### CORS (Cross-Origin Resource Sharing)
- **Version**: Latest
- **Description**: A Node.js package for providing a Connect/Express middleware that can be used to enable CORS
- **Purpose**: Enables cross-origin requests, allowing the frontend to communicate with the backend API
- **Documentation**: [CORS Documentation](https://github.com/expressjs/cors)

### Helmet
- **Version**: Latest
- **Description**: A security middleware for Express.js applications
- **Purpose**: Helps secure the application by setting various HTTP headers to prevent common web vulnerabilities
- **Documentation**: [Helmet Documentation](https://helmetjs.github.io/)

### Morgan
- **Version**: Latest
- **Description**: HTTP request logger middleware for Node.js
- **Purpose**: Logs HTTP requests in a developer-friendly format, useful for debugging and monitoring
- **Documentation**: [Morgan Documentation](https://github.com/expressjs/morgan)

### dotenv
- **Version**: Latest
- **Description**: Loads environment variables from a .env file into process.env
- **Purpose**: Manages environment variables and configuration settings
- **Documentation**: [dotenv Documentation](https://github.com/motdotla/dotenv)

### express-rate-limit
- **Version**: Latest
- **Description**: Basic rate-limiting middleware for Express
- **Purpose**: Prevents abuse of the API by limiting repeated requests from a single IP address
- **Documentation**: [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)

### Socket.io
- **Version**: Latest
- **Description**: Real-time, bidirectional and event-based communication
- **Purpose**: Enables real-time features like live updates and notifications
- **Documentation**: [Socket.io Documentation](https://socket.io/)

### jsonwebtoken
- **Version**: Latest
- **Description**: JSON Web Token implementation
- **Purpose**: Handles authentication and authorization using JWT tokens
- **Documentation**: [jsonwebtoken Documentation](https://github.com/auth0/node-jsonwebtoken)

### bcrypt
- **Version**: Latest
- **Description**: Password hashing library
- **Purpose**: Securely hashes passwords before storing them in the database
- **Documentation**: [bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)

### express-validator
- **Version**: Latest
- **Description**: Input validation and sanitization
- **Purpose**: Validates and sanitizes request data
- **Documentation**: [express-validator Documentation](https://express-validator.github.io/)

### pg (node-postgres)
- **Version**: Latest
- **Description**: PostgreSQL client for Node.js
- **Purpose**: Database connection and query execution
- **Documentation**: [node-postgres Documentation](https://node-postgres.com/)

### winston
- **Version**: Latest
- **Description**: Logging library
- **Purpose**: Advanced logging with multiple transports
- **Documentation**: [winston Documentation](https://github.com/winstonjs/winston)

### jest
- **Version**: Latest
- **Description**: JavaScript testing framework
- **Purpose**: Unit and integration testing
- **Documentation**: [Jest Documentation](https://jestjs.io/)

## Usage in the Application

The libraries are configured in `app.js` as follows:

1. **Express.js**: Used as the main application framework
2. **CORS**: Enabled for all routes to allow frontend communication
3. **Helmet**: Applied globally for security headers
4. **Morgan**: Configured in "dev" mode for development logging
5. **dotenv**: Loaded at application startup to configure environment variables
6. **express-rate-limit**: Configured to limit requests to 100 per IP address per 15 minutes
7. **Socket.io**: Configured for real-time features
8. **jsonwebtoken**: Used for authentication
9. **bcrypt**: Used for password hashing
10. **express-validator**: Used for input validation
11. **pg**: Used for database operations
12. **winston**: Used for logging
13. **jest**: Used for testing

## Security Considerations

- Helmet is used to set secure HTTP headers
- Rate limiting is implemented to prevent DDoS attacks
- CORS is configured to control which origins can access the API
- Environment variables are used for sensitive configuration
- JWT tokens are used for secure authentication
- Passwords are hashed using bcrypt
- Input validation is performed using express-validator
- Real-time features are secured using Socket.io authentication

## Best Practices

1. Always keep dependencies updated to their latest stable versions
2. Regularly check for security vulnerabilities using `npm audit`
3. Use environment variables for sensitive configuration
4. Monitor rate limiting logs for potential abuse
5. Keep the Morgan logging level appropriate for the environment (dev/prod)
6. Implement proper error handling for all middleware
7. Use connection pooling for database operations
8. Implement proper session management
9. Use proper validation for all input data
10. Implement proper logging for debugging and monitoring
11. Use proper testing for all features
12. Implement proper security measures
13. Use proper documentation
14. Implement proper error handling
15. Use proper monitoring 