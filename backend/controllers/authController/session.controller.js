import {
    createSession,
    getSession,
    updateSessionActivity,
    updateSessionActivityWithInfo,
    deleteSession,
    deleteAllUserSessions,
    getActiveSessions,
    getSessionById
} from '../../models/authModels/session.models.js';
import { generateToken } from '../../utils/jwt.js';

// Get a specific session by ID
export const getSessionByIdController = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await getSessionById(sessionId, userId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or you do not have permission to access it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session retrieved successfully',
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving session',
            error: error.message
        });
    }
};

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

// Logout from a specific session by ID
export const logoutSessionByIdController = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Get the session to verify ownership
        const sessions = await getActiveSessions(userId);
        const targetSession = sessions.find(s => s.session_id === sessionId);

        if (!targetSession) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or you do not have permission to access it'
            });
        }

        // Delete the session
        await deleteSession(sessionId);

        res.status(200).json({
            success: true,
            message: 'Session logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out session',
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

        // Generate new token with updated user info
        const token = generateToken({
            id: userId,
            role: req.user.role
        });
        
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

// Update session activity
export const updateSessionActivityController = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { device_info, ip_address } = req.body;

        // Get the session first to verify it exists and belongs to the user
        const session = await getSessionById(sessionId, userId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or you do not have permission to access it'
            });
        }

        // Update the session activity
        const updatedSession = device_info || ip_address
            ? await updateSessionActivityWithInfo(sessionId, userId, device_info, ip_address)
            : await updateSessionActivity(sessionId, userId);

        if (!updatedSession) {
            return res.status(400).json({
                success: false,
                message: 'Failed to update session activity'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session activity updated successfully',
            data: { session: updatedSession }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating session activity',
            error: error.message
        });
    }
}; 