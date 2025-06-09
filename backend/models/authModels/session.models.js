import pool from '../../config/db.config.js';

const createSession = async (userId, token, deviceInfo, ipAddress, locationData) => {
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours from now

    const query = `
        INSERT INTO user_sessions (
            user_id, 
            token, 
            device_info, 
            ip_address,
            location_country,
            location_city,
            location_region,
            expires_at,
            created_at,
            last_activity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
    `;
    const values = [
        userId, 
        token, 
        deviceInfo, 
        ipAddress,
        locationData?.country || null,
        locationData?.city || null,
        locationData?.region || null,
        expiresAt
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getSession = async (token) => {
    const query = `
        SELECT 
            s.*,
            u.email,
            u.name,
            u.role
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.token = $1 
        AND s.expires_at > NOW()
        AND u.is_active = true
    `;
    const values = [token];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getSessionById = async (sessionId, userId) => {
    const query = `
        SELECT 
            s.*,
            u.email,
            u.name,
            u.role
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.session_id = $1 
        AND s.user_id = $2
        AND s.expires_at > NOW()
        AND u.is_active = true
    `;
    const values = [sessionId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateSessionActivity = async (sessionId, userId) => {
    const query = `
        UPDATE user_sessions
        SET 
            last_activity = NOW(),
            device_info = CASE 
                WHEN device_info IS NULL THEN $3
                ELSE device_info
            END,
            ip_address = CASE 
                WHEN ip_address IS NULL THEN $4
                ELSE ip_address
            END
        WHERE session_id = $1
        AND user_id = $2
        AND expires_at > NOW()
        RETURNING *
    `;
    const values = [sessionId, userId, null, null]; // device_info and ip_address are optional
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateSessionActivityWithInfo = async (sessionId, userId, deviceInfo = null, ipAddress = null) => {
    const query = `
        UPDATE user_sessions
        SET 
            last_activity = NOW(),
            device_info = CASE 
                WHEN $3::jsonb IS NOT NULL THEN $3::jsonb
                ELSE device_info
            END,
            ip_address = CASE 
                WHEN $4::text IS NOT NULL THEN $4::text
                ELSE ip_address
            END
        WHERE session_id = $1
        AND user_id = $2
        AND expires_at > NOW()
        RETURNING *
    `;
    const values = [sessionId, userId, deviceInfo, ipAddress];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateSessionTokenAndActivity = async (sessionId, userId, newToken) => {
    const query = `
        UPDATE user_sessions
        SET last_activity = NOW(), token = $3
        WHERE session_id = $1 AND user_id = $2 AND expires_at > NOW()
        RETURNING *
    `;
    const values = [sessionId, userId, newToken];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteSession = async (token) => {
    const query = `
        DELETE FROM user_sessions
        WHERE token = $1
        RETURNING *
    `;
    const values = [token];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteSessionByDevice = async (userId, deviceInfo) => {
    const query = `
        DELETE FROM user_sessions
        WHERE user_id = $1
        AND device_info->>'platform' = $2
        AND device_info->>'browser' = $3
        RETURNING *
    `;
    const values = [
        userId,
        deviceInfo.platform,
        deviceInfo.browser
    ];
    const { rows } = await pool.query(query, values);
    return rows;
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
        SELECT 
            s.*,
            u.email,
            u.name,
            u.role
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.user_id = $1 
        AND s.expires_at > NOW()
        AND u.is_active = true
        ORDER BY s.last_activity DESC
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
};

const cleanupExpiredSessions = async () => {
    const query = `
        DELETE FROM user_sessions
        WHERE expires_at < NOW()
        RETURNING *
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const getSessionStats = async (userId) => {
    const query = `
        SELECT 
            COUNT(*) as total_sessions,
            COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
            MAX(last_activity) as last_activity,
            MIN(created_at) as first_session
        FROM user_sessions
        WHERE user_id = $1
    `;
    const values = [userId];
    const { rows } = await pool.query(query);
    return rows[0];
};

const findSimilarSession = async (userId, deviceInfo) => {
    const query = `
        SELECT * FROM user_sessions
        WHERE user_id = $1
        AND device_info->>'platform' = $2
        AND device_info->>'browser' = $3
        AND expires_at > NOW()
        LIMIT 1
    `;
    const values = [
        userId,
        deviceInfo.platform,
        deviceInfo.browser
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export {
    createSession,
    getSession,
    getSessionById,
    updateSessionActivity,
    updateSessionActivityWithInfo,
    updateSessionTokenAndActivity,
    deleteSession,
    deleteSessionByDevice,
    deleteAllUserSessions,
    getActiveSessions,
    cleanupExpiredSessions,
    getSessionStats,
    findSimilarSession
}; 