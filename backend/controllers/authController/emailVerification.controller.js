import { sendVerificationEmail } from '../../services/emailServices.js';
import {
    createVerificationToken,
    findValidToken,
    markTokenAsUsed,
    updateUserVerificationStatus,
    isEmailVerified
} from '../../models/authModels/emailVerification.models.js';
import pool from '../../config/db.config.js';

/**
 * Request email verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const requestVerification = async (req, res) => {
    try {
        const { email } = req.body;

        // Get user from database
        const userResult = await pool.query(
            'SELECT user_id, name, email, is_verified FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new verification token
        const token = await createVerificationToken(user.user_id);

        // Send verification email
        await sendVerificationEmail(user.email, token);

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Error requesting verification:', error);
        res.status(500).json({ message: 'Error sending verification email' });
    }
};

/**
 * Verify email with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // Find valid token
        const verificationToken = await findValidToken(token);

        if (!verificationToken) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Update user verification status
        await updateUserVerificationStatus(verificationToken.user_id);

        // Mark token as used
        await markTokenAsUsed(verificationToken.token_id);

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
}; 