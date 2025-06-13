import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createSession, deleteSession, findSimilarSession, updateSessionActivity, updateSessionTokenAndActivity, deleteSessionByDevice } from '../../models/authModels/session.models.js';
import { createVerificationToken } from '../../models/authModels/emailVerification.models.js';
import { sendVerificationEmail } from '../../services/emailServices.js';
import { addToBlacklist } from '../../utils/tokenBlacklist.js';
import { getUserByEmail, createUser } from '../../models/userModels/user.models.js';

// Helper to parse browser and platform from user-agent
const parseUserAgent = (userAgent) => {
    const browser = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    const platform = userAgent.match(/(windows|mac|linux|android|ios)/i) || [];
    return {
        browser: browser[1] || 'unknown',
        browserVersion: browser[2] || 'unknown',
        platform: platform[1] || 'unknown'
    };
};

// Clean sec-ch-ua and sec-ch-ua-platform values
function cleanBrowserString(browserStr) {
    if (!browserStr) return 'Unknown';
    // e.g. "'Chromium';v='134', 'Not:A-Brand';v='24', 'Opera GX';v='119'"
    const match = browserStr.match(/'([^']+)'/);
    return match ? match[1] : browserStr.split(';')[0].replace(/['"]/g, '').trim();
}
function cleanPlatformString(platformStr) {
    if (!platformStr) return 'Unknown';
    return platformStr.replace(/['"]/g, '').trim();
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!password || !user.password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ 
                message: 'Please verify your email before logging in',
                requiresVerification: true,
                email: user.email
            });
        }

        // Generate token with only id and role
        const token = jwt.sign({
            id: user.user_id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Robust device info extraction
        const ua = req.headers['user-agent'] || '';
        let browser = req.headers['sec-ch-ua'] || '';
        let platform = req.headers['sec-ch-ua-platform'] || '';
        // Normalize if missing or complex
        if (!browser || browser === '""') {
            browser = parseUserAgent(ua).browser;
        } else {
            browser = cleanBrowserString(browser);
        }
        if (!platform || platform === '""') {
            platform = parseUserAgent(ua).platform;
        } else {
            platform = cleanPlatformString(platform);
        }
        const deviceInfo = {
            userAgent: ua,
            platform,
            browser
        };
        // Deduplication: check for existing session
        const existingSession = await findSimilarSession(user.user_id, deviceInfo);
        let session;
        if (existingSession) {
            // Update last_activity and update token to the new one
            session = await updateSessionTokenAndActivity(existingSession.session_id, user.user_id, token);
        } else {
            session = await createSession(user.user_id, token, deviceInfo, req.realIP, req.body.location || {});
        }

        // Convert profile_picture buffer to base64 data URL if it exists
        let profilePicture = null;
        if (user.profile_picture && user.profile_picture_type) {
            profilePicture = `data:${user.profile_picture_type};base64,${Buffer.from(user.profile_picture).toString('base64')}`;
        }

        return res.status(200).json({
            message: 'Login successful',
            token,
            session: {
                id: session.session_id,
                expires_at: session.expires_at
            },
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_picture: profilePicture,
                profile_picture_type: user.profile_picture_type,
                department_id: user.department_id,
                department_name: user.department_name || null,
                is_verified: user.is_verified
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department_id } = req.body;

        // Check if user already exists
        const userExists = await getUserByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = { name, email, password: hashedPassword, role, department_id };
        const createdUser = await createUser(newUser);

        // Generate verification token and send verification email
        const token = await createVerificationToken(createdUser.user_id);
        await sendVerificationEmail(createdUser.email, token);

        // Convert profile_picture buffer to base64 data URL if it exists
        let profilePicture = null;
        if (createdUser.profile_picture && createdUser.profile_picture_type) {
            profilePicture = `data:${createdUser.profile_picture_type};base64,${Buffer.from(createdUser.profile_picture).toString('base64')}`;
        }

        return res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: createdUser.user_id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                profile_picture: profilePicture,
                profile_picture_type: createdUser.profile_picture_type,
                department_id: createdUser.department_id,
            },
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Get user info from token (assume auth middleware already ran)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Robust device info extraction
        const ua = req.headers['user-agent'] || '';
        let browser = req.headers['sec-ch-ua'] || '';
        let platform = req.headers['sec-ch-ua-platform'] || '';
        if (!browser || browser === '""') {
            browser = parseUserAgent(ua).browser;
        } else {
            browser = cleanBrowserString(browser);
        }
        if (!platform || platform === '""') {
            platform = parseUserAgent(ua).platform;
        } else {
            platform = cleanPlatformString(platform);
        }
        const deviceInfo = { userAgent: ua, platform, browser };

        // Delete all sessions for this device/browser
        await deleteSessionByDevice(user.user_id, deviceInfo);

        // Add token to blacklist
        addToBlacklist(token);

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}


export { login, registerUser, logout};