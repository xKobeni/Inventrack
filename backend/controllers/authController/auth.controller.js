import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import { getUserByEmail, createUser } from '../../models/userModels/user.models.js';
import { addToBlacklist } from '../../utils/tokenBlacklist.js';
import { createSession, deleteSession } from '../../models/authModels/session.models.js';

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

        const token = generateToken(user);
        
        // Create session with device info and IP
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['sec-ch-ua']
        };
        
        const session = await createSession(user.user_id, token, deviceInfo, req.realIP);

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
        
        // Delete the session from the database
        await deleteSession(token);
        
        // Add token to blacklist
        addToBlacklist(token);
        
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}


export { login, registerUser, logout };