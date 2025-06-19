import pool from '../../config/db.config.js';

const getUserByEmail = async (email) => {
    const query = `
        SELECT u.*, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE u.email = $1
    `;
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the first user found
}

const getUserById = async (userId) => {
    const query = `
        SELECT u.*, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE u.user_id = $1
    `;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the user found
}

const getAllUsers = async ({ limit, offset, search, role, isActive, isDeleted, sortBy, sortOrder }) => {
    let query = 'SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.department_id WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add search condition
    if (search) {
        query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR d.name ILIKE $${paramCount})`;
        values.push(`%${search}%`);
        paramCount++;
    }

    // Add role filter
    if (role) {
        query += ` AND u.role = $${paramCount}`;
        values.push(role);
        paramCount++;
    }

    // Add active status filter
    if (isActive !== undefined) {
        query += ` AND u.is_active = $${paramCount}`;
        values.push(isActive === 'true');
        paramCount++;
    }

    // Add deleted status filter
    if (isDeleted !== undefined) {
        query += ` AND u.is_deleted = $${paramCount}`;
        values.push(isDeleted === 'true');
        paramCount++;
    }

    // Get total count before pagination
    const countQuery = query.replace('SELECT u.*, d.name as department_name', 'SELECT COUNT(*)');
    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].count);

    // Add sorting
    query += ` ORDER BY u.${sortBy} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return { users: rows, total };
}

const createUser = async (user) => {
    const profilePictureBuffer = user.profile_picture ? Buffer.from(user.profile_picture, 'base64') : null;
    const query = 'INSERT INTO users (name, email, password, role, department_id, profile_picture, profile_picture_type, contact_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const values = [user.name, user.email, user.password, user.role, user.department_id || null, profilePictureBuffer, user.profile_picture_type, user.contact_number];
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
    const { name, email, password, role, department_id, profile_picture, profile_picture_type, contact_number } = userData;
    const profilePictureBuffer = profile_picture ? Buffer.from(profile_picture, 'base64') : null;
    const query = `
        UPDATE users 
        SET name = COALESCE($1, name), 
            email = COALESCE($2, email), 
            password = COALESCE($3, password), 
            role = COALESCE($4, role),
            department_id = $5,
            profile_picture = COALESCE($6, profile_picture),
            profile_picture_type = COALESCE($7, profile_picture_type),
            contact_number = COALESCE($8, contact_number)
        WHERE user_id = $9 
        RETURNING *`;
    const values = [name, email, password, role, department_id || null, profilePictureBuffer, profile_picture_type, contact_number, userId];
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
            const profilePictureBuffer = updateData.profile_picture ? Buffer.from(updateData.profile_picture, 'base64') : null;
            const query = `
                UPDATE users 
                SET name = COALESCE($1, name), 
                    email = COALESCE($2, email), 
                    password = COALESCE($3, password), 
                    role = COALESCE($4, role),
                    is_active = COALESCE($5, is_active),
                    profile_picture = COALESCE($6, profile_picture),
                    profile_picture_type = COALESCE($7, profile_picture_type),
                    contact_number = COALESCE($8, contact_number)
                WHERE user_id = $9 
                RETURNING *`;
            const values = [
                updateData.name,
                updateData.email,
                updateData.password,
                updateData.role,
                updateData.is_active,
                profilePictureBuffer,
                updateData.profile_picture_type,
                updateData.contact_number,
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

const softDeleteUser = async (userId) => {
    const query = `
        UPDATE users 
        SET is_deleted = true, 
            deleted_at = CURRENT_TIMESTAMP 
        WHERE user_id = $1 
        RETURNING *`;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the soft deleted user
}

const restoreUser = async (userId) => {
    const query = `
        UPDATE users 
        SET is_deleted = false, 
            deleted_at = NULL 
        WHERE user_id = $1 
        RETURNING *`;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the restored user
}

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
    bulkDeactivateUsers,
    softDeleteUser,
    restoreUser
};
// This module handles user-related database operations, such as fetching a user by email and creating a new user.