import pool from '../../config/db.config.js';

const createSession = async (userId, token, deviceInfo, ipAddress) => {
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours from now

    const query = `
        INSERT INTO user_sessions (user_id, token, device_info, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [userId, token, deviceInfo, ipAddress, expiresAt];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getSession = async (token) => {
    const query = `
        SELECT * FROM user_sessions
        WHERE token = $1 AND expires_at > NOW()
    `;
    const values = [token];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateSessionActivity = async (sessionId) => {
    const query = `
        UPDATE user_sessions
        SET last_activity = NOW()
        WHERE session_id = $1
        RETURNING *
    `;
    const values = [sessionId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteSession = async (sessionId) => {
    const query = `
        DELETE FROM user_sessions
        WHERE session_id = $1
        RETURNING *
    `;
    const values = [sessionId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteAllUserSessions = async (userId) => {
    const query = `
        DELETE FROM user_sessions
        WHERE user_id = $1
        RETURNING *
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
};

const getActiveSessions = async (userId) => {
    const query = `
        SELECT * FROM user_sessions
        WHERE user_id = $1 AND expires_at > NOW()
        ORDER BY last_activity DESC
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
};

export {
    createSession,
    getSession,
    updateSessionActivity,
    deleteSession,
    deleteAllUserSessions,
    getActiveSessions
}; 