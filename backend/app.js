import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/userRoutes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import incidentReportsRoutes from "./routes/incidentReports.routes.js";
import userPreferencesRoutes from './routes/userRoutes/userPreferences.routes.js';
import sessionRoutes from './routes/session.routes.js';

dotenv.config(); // Load environment variables from .env file
const app = express();

// Trust proxy to get real IP address
app.set('trust proxy', ['127.0.0.1', '::1']); // Only trust localhost

// IP address middleware
app.use((req, res, next) => {
    // Get IP from various headers in order of preference
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
    
    // Store IP in request object
    req.realIP = ip;
    next();
});

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    keyGenerator: (req) => req.realIP // Use real IP for rate limiting
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(express.json({ limit: '10mb'}));
// app.use(express.urlencoded({ limit: '10mb', extended: true })); // increase the limit of the request body
app.use(cors());
app.use(helmet()); // Security middleware for HTTP headers
app.use(morgan("dev")); // Logging middleware

// Import routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/departments", departmentRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/procurement", procurementRoutes);
app.use("/incident-reports", incidentReportsRoutes);
app.use('/preferences', userPreferencesRoutes);
app.use('/sessions', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.name || "Internal Server Error",
        message: err.message || "An unexpected error occurred"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found",
        message: "The requested resource was not found"
    });
});



export default app;