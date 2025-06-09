import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import { getUserByEmail, createUser } from '../../models/userModels/user.models.js';
import { addToBlacklist } from '../../utils/tokenBlacklist.js';
import { createSession, deleteSession, findSimilarSession, updateSessionActivity, updateSessionTokenAndActivity, deleteSessionByDevice } from '../../models/authModels/session.models.js';

// Helper to parse browser and platform from user-agent
function parseUserAgent(ua) {
    let browser = 'Unknown';
    let platform = 'Unknown';
    if (!ua) return { browser, platform };
    ua = ua.toLowerCase();
    // Browser
    if (ua.includes('edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('chrome/')) browser = 'Chromium';
    else if (ua.includes('opera/')) browser = 'Opera';
    else if (ua.includes('brave/')) browser = 'Brave';
    else if (ua.includes('opera gx/')) browser = 'Opera GX';
    else if (ua.includes('firefox/')) browser = 'Firefox';
    else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
    // Platform
    if (ua.includes('windows')) platform = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) platform = 'MacOS';
    else if (ua.includes('linux')) platform = 'Linux';
    else if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) platform = 'iOS';
    return { browser, platform };
}

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

        // Generate token with only id and role
        const token = generateToken({
            id: user.user_id,
            role: user.role
        });
        
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
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name, email, password: hashedPassword, role };
        const createdUser = await createUser(newUser);

        // Convert profile_picture buffer to base64 data URL if it exists
        let profilePicture = null;
        if (createdUser.profile_picture && createdUser.profile_picture_type) {
            profilePicture = `data:${createdUser.profile_picture_type};base64,${Buffer.from(createdUser.profile_picture).toString('base64')}`;
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: createdUser.id,
                email: createdUser.email,
                role: createdUser.role,
                profile_picture: profilePicture,
                profile_picture_type: createdUser.profile_picture_type,
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal server error' + error.message });
    }
}

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
        await deleteSessionByDevice(user.id, deviceInfo);

        // Add token to blacklist
        addToBlacklist(token);

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}


export { login, registerUser, logout };