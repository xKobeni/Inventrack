import pool from '../../config/db.config.js';

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

const getAllUsers = async ({ limit, offset, search, role, isActive, sortBy, sortOrder }) => {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add search condition
    if (search) {
        query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        values.push(`%${search}%`);
        paramCount++;
    }

    // Add role filter
    if (role) {
        query += ` AND role = $${paramCount}`;
        values.push(role);
        paramCount++;
    }

    // Add active status filter
    if (isActive !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        values.push(isActive === 'true');
        paramCount++;
    }

    // Get total count before pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].count);

    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return { users: rows, total };
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

const bulkUpdateUsers = async (userIds, updateData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const results = [];
        for (const userId of userIds) {
            const query = `
                UPDATE users 
                SET name = COALESCE($1, name), 
                    email = COALESCE($2, email), 
                    password = COALESCE($3, password), 
                    role = COALESCE($4, role),
                    is_active = COALESCE($5, is_active)
                WHERE user_id = $6 
                RETURNING *`;
            const values = [
                updateData.name,
                updateData.email,
                updateData.password,
                updateData.role,
                updateData.is_active,
                userId
            ];
            const { rows } = await client.query(query, values);
            if (rows[0]) {
                results.push(rows[0]);
            }
        }

        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const bulkDeleteUsers = async (userIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const results = [];
        for (const userId of userIds) {
            const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
            const values = [userId];
            const { rows } = await client.query(query, values);
            if (rows[0]) {
                results.push(rows[0]);
            }
        }

        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const bulkActivateUsers = async (userIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
            UPDATE users 
            SET is_active = true 
            WHERE user_id = ANY($1)
            RETURNING *`;
        const values = [userIds];
        const { rows } = await client.query(query, values);

        await client.query('COMMIT');
        return rows;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const bulkDeactivateUsers = async (userIds) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
            UPDATE users 
            SET is_active = false 
            WHERE user_id = ANY($1)
            RETURNING *`;
        const values = [userIds];
        const { rows } = await client.query(query, values);

        await client.query('COMMIT');
        return rows;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export { 
    getUserByEmail, 
    createUser, 
    getUserById, 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    activateUser, 
    deactivateUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
    bulkActivateUsers,
    bulkDeactivateUsers
};
// This module handles user-related database operations, such as fetching a user by email and creating a new user.