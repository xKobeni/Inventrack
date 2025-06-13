import SibApiV3Sdk from 'sib-api-v3-sdk';

// Debug: Check if API key exists
if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set in environment variables');
}

// Debug: Check FRONTEND_URL
if (!process.env.FRONTEND_URL) {
    console.error('FRONTEND_URL is not set in environment variables');
} else {
    console.log('FRONTEND_URL is set to:', process.env.FRONTEND_URL);
}

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create an instance of the TransactionalEmailsApi
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Email templates
const EMAIL_TEMPLATES = {
    WELCOME: 1, // Replace with your actual template ID
    PASSWORD_RESET: 3, // Replace with your actual template ID
    EMAIL_VERIFICATION: 2, // Replace with your actual template ID
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
        // Debug: Log the request details
        console.log('\n=== Email Send Attempt ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Template ID:', templateId);
        console.log('Template Params:', JSON.stringify(params, null, 2));

        // Validate required parameters
        if (!to) throw new Error('Recipient email is required');
        if (!templateId && !htmlContent) throw new Error('Either templateId or htmlContent is required');
        if (templateId && !EMAIL_TEMPLATES[Object.keys(EMAIL_TEMPLATES).find(key => EMAIL_TEMPLATES[key] === templateId)]) {
            throw new Error(`Invalid template ID: ${templateId}`);
        }

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

        // Debug: Log the API request
        console.log('\nSending email with configuration:');
        console.log(JSON.stringify(sendSmtpEmail, null, 2));

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('\nEmail sent successfully:', data);
        console.log('=== End Email Send ===\n');
        return { success: true, data };
    } catch (error) {
        console.error('\n=== Email Send Error ===');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        
        if (error.response) {
            console.error('API Response Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                body: error.response.body
            });
        }
        
        console.error('=== End Error ===\n');
        throw new Error(`Failed to send email: ${error.message}`);
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
            loginUrl: `${process.env.FRONTEND_URL}/`
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
    const firstName = email.split('@')[0]; // Basic name extraction from email
    
    // Debug: Log verification attempt
    console.log('Attempting to send verification email:', {
        to: email,
        firstName,
        verificationToken: verificationToken.substring(0, 8) + '...',
        templateId: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
        frontendUrl: process.env.FRONTEND_URL
    });

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    return sendEmail({
        to: email,
        subject: 'Verify Your Email - Welcome to Inventrack',
        templateId: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
        params: {
            verificationUrl: verificationUrl,
            contact: {
                FIRSTNAME: firstName
            },
            company: {
                name: 'Inventrack',
                website: process.env.FRONTEND_URL || 'http://localhost:3000',
                email: 'inventrack1@gmail.com'
            },
            // Additional parameters that might be needed by the template
            logo_url: 'https://inventrack.gov.ph/assets/logo.png',
            current_year: new Date().getFullYear()
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