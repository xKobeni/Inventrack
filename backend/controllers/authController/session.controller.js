import {
    createSession,
    getSession,
    updateSessionActivity,
    deleteSession,
    deleteAllUserSessions,
    getActiveSessions
} from '../../models/authModels/session.models.js';
import { generateToken } from '../../utils/jwt.js';

// Get all active sessions for the current user
export const getActiveSessionsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await getActiveSessions(userId);

        res.status(200).json({
            success: true,
            message: 'Active sessions retrieved successfully',
            data: { sessions }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving active sessions',
            error: error.message
        });
    }
};

// Logout from current session
export const logoutSessionController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No session token provided'
            });
        }

        const session = await getSession(token);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        await deleteSession(session.session_id);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// Logout from all sessions
export const logoutAllSessionsController = async (req, res) => {
    try {
        const userId = req.user.id;
        await deleteAllUserSessions(userId);

        res.status(200).json({
            success: true,
            message: 'Logged out from all sessions successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out from all sessions',
            error: error.message
        });
    }
};

// Create new session
export const createSessionController = async (req, res) => {
    try {
        const userId = req.user.id;
        const deviceInfo = req.body.device_info || {};
        const ipAddress = req.ip;
        const locationData = {
            country: req.body.location?.country,
            city: req.body.location?.city,
            region: req.body.location?.region
        };

        const token = generateToken(req.user);
        const session = await createSession(userId, token, deviceInfo, ipAddress, locationData);

        res.status(200).json({
            success: true,
            message: 'Session created successfully',
            data: {
                token: session.token,
                expires_at: session.expires_at,
                location: {
                    country: session.location_country,
                    city: session.location_city,
                    region: session.location_region
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating session',
            error: error.message
        });
    }
}; 