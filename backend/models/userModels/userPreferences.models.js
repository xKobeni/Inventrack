import pool from '../../config/db.config.js';

const getUserPreferences = async (userId) => {
    const query = `
        SELECT * FROM user_preferences
        WHERE user_id = $1
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const createUserPreferences = async (userId, preferences) => {
    const query = `
        INSERT INTO user_preferences (user_id, notification_settings, language, theme, timezone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [
        userId,
        preferences.notification_settings || { email: true, push: true },
        preferences.language || 'en',
        preferences.theme || 'light',
        preferences.timezone || 'UTC'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateUserPreferences = async (userId, preferences) => {
    const query = `
        UPDATE user_preferences
        SET notification_settings = COALESCE($1, notification_settings),
            language = COALESCE($2, language),
            theme = COALESCE($3, theme),
            timezone = COALESCE($4, timezone),
            updated_at = NOW()
        WHERE user_id = $5
        RETURNING *
    `;
    const values = [
        preferences.notification_settings,
        preferences.language,
        preferences.theme,
        preferences.timezone,
        userId
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export { getUserPreferences, createUserPreferences, updateUserPreferences }; 