import { getUserByEmail } from '../../models/userModels/user.models.js';
import { createPasswordResetToken, getPasswordResetToken, markTokenAsUsed } from '../../models/authModels/passwordReset.models.js';
import { updateUser } from '../../models/userModels/user.models.js';
import bcrypt from 'bcrypt';
import { passwordResetLimiter } from '../../middleware/rateLimit.middleware.js';
import { sendPasswordResetEmail } from '../../services/emailServices.js';

// Request password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = await createPasswordResetToken(user.user_id);

        // Send email with reset link
        await sendPasswordResetEmail(user.email, resetToken.token);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive password reset instructions.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating password reset token',
            error: error.message
        });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const resetToken = await getPasswordResetToken(token);
        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password
        await updateUser(resetToken.user_id, { password: hashedPassword });

        // Mark token as used
        await markTokenAsUsed(resetToken.token_id);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
}; 