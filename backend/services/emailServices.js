import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create an instance of the TransactionalEmailsApi
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Email templates
const EMAIL_TEMPLATES = {
    WELCOME: 1, // Replace with your actual template ID
    PASSWORD_RESET: 2, // Replace with your actual template ID
    EMAIL_VERIFICATION: 3, // Replace with your actual template ID
    NOTIFICATION: 4 // Replace with your actual template ID
};

/**
 * Send a transactional email using Brevo
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML content of the email
 * @param {Object} options.templateId - Template ID to use
 * @param {Object} options.params - Template parameters
 * @returns {Promise} - Promise with the email sending result
 */
const sendEmail = async ({ to, subject, htmlContent, templateId, params }) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;

        if (templateId) {
            sendSmtpEmail.templateId = templateId;
            if (params) {
                sendSmtpEmail.params = params;
            }
        } else {
            sendSmtpEmail.htmlContent = htmlContent;
        }

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(error.message || 'Failed to send email');
    }
};

/**
 * Send a welcome email to a new user
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @returns {Promise} - Promise with the email sending result
 */
const sendWelcomeEmail = async (email, name) => {
    return sendEmail({
        to: email,
        subject: 'Welcome to Inventrack!',
        templateId: EMAIL_TEMPLATES.WELCOME,
        params: {
            name: name,
            loginUrl: `${process.env.FRONTEND_URL}/login`
        }
    });
};

/**
 * Send a password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - Promise with the email sending result
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    return sendEmail({
        to: email,
        subject: 'Reset Your Password',
        templateId: EMAIL_TEMPLATES.PASSWORD_RESET,
        params: {
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
    });
};

/**
 * Send an email verification email
 * @param {string} email - User's email
 * @param {string} verificationToken - Email verification token
 * @returns {Promise} - Promise with the email sending result
 */
const sendVerificationEmail = async (email, verificationToken) => {
    return sendEmail({
        to: email,
        subject: 'Verify Your Email',
        templateId: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
        params: {
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
    });
};

/**
 * Send a notification email
 * @param {string} email - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} message - Notification message
 * @returns {Promise} - Promise with the email sending result
 */
const sendNotificationEmail = async (email, subject, message) => {
    return sendEmail({
        to: email,
        subject: subject,
        templateId: EMAIL_TEMPLATES.NOTIFICATION,
        params: {
            message: message
        }
    });
};

export {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendNotificationEmail
};
