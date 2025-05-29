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

## Usage in the Application

The libraries are configured in `app.js` as follows:

1. **Express.js**: Used as the main application framework
2. **CORS**: Enabled for all routes to allow frontend communication
3. **Helmet**: Applied globally for security headers
4. **Morgan**: Configured in "dev" mode for development logging
5. **dotenv**: Loaded at application startup to configure environment variables
6. **express-rate-limit**: Configured to limit requests to 100 per IP address per 15 minutes

## Security Considerations

- Helmet is used to set secure HTTP headers
- Rate limiting is implemented to prevent DDoS attacks
- CORS is configured to control which origins can access the API
- Environment variables are used for sensitive configuration

## Best Practices

1. Always keep dependencies updated to their latest stable versions
2. Regularly check for security vulnerabilities using `npm audit`
3. Use environment variables for sensitive configuration
4. Monitor rate limiting logs for potential abuse
5. Keep the Morgan logging level appropriate for the environment (dev/prod) 