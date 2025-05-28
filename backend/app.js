import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config(); // Load environment variables from .env file
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet()); // Security middleware for HTTP headers
app.use(morgan("dev")); // Logging middleware

app.get("/", (req, res) => {
    res.send("Hello, sino ka ba ha!");
});

// Import routes
app.use("/auth", authRoutes);


export default app;