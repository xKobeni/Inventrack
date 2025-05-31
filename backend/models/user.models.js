import pool from '../config/db.config.js';

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the first user found
}

const getUserById = async (userId) => {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the user found
}

const getAllUsers = async () => {
    const query = 'SELECT * FROM users ORDER BY user_id';
    const { rows } = await pool.query(query);
    return rows; // Return all users
}

const createUser = async (user) => {
    const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [user.name, user.email, user.password, user.role];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the created user
}

const deactivateUser = async (userId) => {
    const query = 'UPDATE users SET is_active = false WHERE user_id = $1 RETURNING *';
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the deactivated user
}

const activateUser = async (userId) => {
    const query = 'UPDATE users SET is_active = true WHERE user_id = $1 RETURNING *';
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the activated user
}

const updateUser = async (userId, userData) => {
    const { name, email, password, role } = userData;
    const query = `
        UPDATE users 
        SET name = COALESCE($1, name), 
            email = COALESCE($2, email), 
            password = COALESCE($3, password), 
            role = COALESCE($4, role) 
        WHERE user_id = $5 
        RETURNING *`;
    const values = [name, email, password, role, userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the updated user
}

const deleteUser = async (userId) => {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the deleted user
}

export { 
    getUserByEmail, 
    createUser, 
    getUserById, 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    activateUser, 
    deactivateUser 
};
// This module handles user-related database operations, such as fetching a user by email and creating a new user.