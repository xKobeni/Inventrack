import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import { getUserByEmail, createUser } from '../models/user.models.js';
import { addToBlacklist } from '../utils/tokenBlacklist.js';

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
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' + error.message });
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

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: createdUser.id,
                email: createdUser.email,
                role: createdUser.role,
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal server error' + error.message });
    }
}

const logout = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        addToBlacklist(token);
        
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export { login, registerUser, logout };