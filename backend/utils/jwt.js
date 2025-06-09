import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const generateToken = (user) => {
    const payload = {
        id: user.id,
        role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expiration time
    });
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded.exp < Date.now() / 1000; // Check if the token is expired
    } catch (error) {
        return true; // If decoding fails, consider it expired
    }
}

// Store for blacklisted tokens (in memory - consider using Redis for production)
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
    tokenBlacklist.add(token);
}

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
}

const removeFromBlacklist = (token) => {
    tokenBlacklist.delete(token);
}


export { generateToken, verifyToken, isTokenExpired };