import { getUserByEmail } from '../../models/userModels/user.models.js';
import { createPasswordResetToken, getPasswordResetToken, markTokenAsUsed } from '../../models/authModels/passwordReset.models.js';
import { updateUser } from '../../models/userModels/user.models.js';
import bcrypt from 'bcrypt';
import { passwordResetLimiter } from '../../middleware/rateLimit.middleware.js';

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

        // TODO: Send email with reset link
        // For now, we'll just return the token in the response
        res.status(200).json({
            success: true,
            message: 'Password reset token generated successfully',
            data: {
                token: resetToken.token,
                expires_at: resetToken.expires_at
            }
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
        const { token, newPassword } = req.body;

        const resetToken = await getPasswordResetToken(token);
        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

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