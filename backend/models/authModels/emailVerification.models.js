import pool from '../../config/db.config.js';
import crypto from 'crypto';

/**
 * Generate and store a verification token for a user
 * @param {number} userId - The user's ID
 * @returns {Promise<string>} The generated token
 */
export const createVerificationToken = async (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
        'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );

    return token;
};

/**
 * Find a valid verification token
 * @param {string} token - The verification token
 * @returns {Promise<Object|null>} The token data if valid, null otherwise
 */
export const findValidToken = async (token) => {
    const result = await pool.query(
        `SELECT t.*, u.email, u.name 
         FROM email_verification_tokens t
         JOIN users u ON t.user_id = u.user_id
         WHERE t.token = $1 
         AND t.expires_at > CURRENT_TIMESTAMP
         AND t.verified_at IS NULL`,
        [token]
    );
    return result.rows[0] || null;
};

/**
 * Mark a verification token as used
 * @param {number} tokenId - The token ID
 * @returns {Promise<void>}
 */
export const markTokenAsUsed = async (tokenId) => {
    await pool.query(
        'UPDATE email_verification_tokens SET verified_at = CURRENT_TIMESTAMP WHERE token_id = $1',
        [tokenId]
    );
};

/**
 * Update user verification status
 * @param {number} userId - The user's ID
 * @returns {Promise<void>}
 */
export const updateUserVerificationStatus = async (userId) => {
    await pool.query(
        'UPDATE users SET is_verified = TRUE WHERE user_id = $1',
        [userId]
    );
};

/**
 * Check if user's email is verified
 * @param {number} userId - The user's ID
 * @returns {Promise<boolean>} Whether the user's email is verified
 */
export const isEmailVerified = async (userId) => {
    const result = await pool.query(
        'SELECT is_verified FROM users WHERE user_id = $1',
        [userId]
    );
    return result.rows[0]?.is_verified || false;
};

/**
 * Delete expired verification tokens
 * @returns {Promise<void>}
 */
export const cleanupExpiredTokens = async () => {
    await pool.query(
        'DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP'
    );
}; 