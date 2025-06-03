import pool from '../../config/db.config.js';
import crypto from 'crypto';

const createPasswordResetToken = async (userId) => {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    const query = `
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [userId, token, expiresAt];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getPasswordResetToken = async (token) => {
    const query = `
        SELECT * FROM password_reset_tokens
        WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
    `;
    const values = [token];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const markTokenAsUsed = async (tokenId) => {
    const query = `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE token_id = $1
        RETURNING *
    `;
    const values = [tokenId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export { createPasswordResetToken, getPasswordResetToken, markTokenAsUsed }; 