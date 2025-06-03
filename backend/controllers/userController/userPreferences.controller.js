import { getUserPreferences, createUserPreferences, updateUserPreferences } from '../../models/userModels/userPreferences.models.js';

// Get user preferences
export const getUserPreferencesController = async (req, res) => {
    try {
        const userId = req.user.id;
        let preferences = await getUserPreferences(userId);

        // If no preferences exist, create default ones
        if (!preferences) {
            preferences = await createUserPreferences(userId, {});
        }

        res.status(200).json({
            success: true,
            message: 'User preferences retrieved successfully',
            data: { preferences }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user preferences',
            error: error.message
        });
    }
};

// Update user preferences
export const updateUserPreferencesController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notification_settings, language, theme, timezone } = req.body;

        let preferences = await getUserPreferences(userId);

        // If no preferences exist, create them
        if (!preferences) {
            preferences = await createUserPreferences(userId, {
                notification_settings,
                language,
                theme,
                timezone
            });
        } else {
            // Update existing preferences
            preferences = await updateUserPreferences(userId, {
                notification_settings,
                language,
                theme,
                timezone
            });
        }

        res.status(200).json({
            success: true,
            message: 'User preferences updated successfully',
            data: { preferences }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user preferences',
            error: error.message
        });
    }
}; 