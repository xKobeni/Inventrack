import jwt from 'jsonwebtoken';
import { getUserById } from '../models/userModels/user.models.js';
import { isBlacklisted } from '../utils/tokenBlacklist.js';


// Dito lang may problema sa pag fetch ng token sa header
export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        //console.log('Auth Header:', authHeader); // Debug auth header

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        //console.log('Extracted Token:', token); // Debug extracted token

        // Check if token is blacklisted
        if (isBlacklisted(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database using ID
        const user = await getUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Attach user to request object
        req.user = {
            id: user.user_id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error authenticating user',
            error: error.message
        });
    }
}; 