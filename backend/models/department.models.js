import pool from '../config/db.config.js';

const getAllDepartments = async ({ limit, offset, search, isActive, sortBy = 'name', sortOrder = 'ASC' }) => {
    let query = 'SELECT d.*, u.name as head_name FROM departments d LEFT JOIN users u ON d.head_user_id = u.user_id WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add search condition
    if (search) {
        query += ` AND (d.name ILIKE $${paramCount} OR d.description ILIKE $${paramCount} OR d.contact_email ILIKE $${paramCount})`;
        values.push(`%${search}%`);
        paramCount++;
    }

    // Add active status filter
    if (isActive !== undefined) {
        query += ` AND d.is_active = $${paramCount}`;
        values.push(isActive);
        paramCount++;
    }

    // Get total count before pagination
    const countQuery = query.replace('SELECT d.*, u.name as head_name', 'SELECT COUNT(*)');
    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].count);

    // Add sorting
    query += ` ORDER BY d.${sortBy} ${sortOrder}`;

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return { departments: rows, total };
};

const getDepartmentById = async (departmentId) => {
    const query = `
        SELECT d.*, u.name as head_name 
        FROM departments d 
        LEFT JOIN users u ON d.head_user_id = u.user_id 
        WHERE d.department_id = $1
    `;
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const createDepartment = async (departmentData) => {
    const {
        name,
        description,
        contact_email,
        contact_number,
        head_user_id,
        logo,
        logo_type,
        is_active = true
    } = departmentData;

    const query = `
        INSERT INTO departments (
            name, description, contact_email, contact_number, 
            head_user_id, logo, logo_type, is_active
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
    `;
    
    const values = [
        name,
        description,
        contact_email,
        contact_number,
        head_user_id,
        logo ? Buffer.from(logo, 'base64') : null,
        logo_type,
        is_active
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const updateDepartment = async (departmentId, departmentData) => {
    const {
        name,
        description,
        contact_email,
        contact_number,
        head_user_id,
        logo,
        logo_type,
        is_active
    } = departmentData;

    const query = `
        UPDATE departments 
        SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            contact_email = COALESCE($3, contact_email),
            contact_number = COALESCE($4, contact_number),
            head_user_id = $5,
            logo = COALESCE($6, logo),
            logo_type = COALESCE($7, logo_type),
            is_active = COALESCE($8, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE department_id = $9 
        RETURNING *
    `;
    
    const values = [
        name,
        description,
        contact_email,
        contact_number,
        head_user_id,
        logo ? Buffer.from(logo, 'base64') : null,
        logo_type,
        is_active,
        departmentId
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteDepartment = async (departmentId) => {
    const query = 'DELETE FROM departments WHERE department_id = $1 RETURNING *';
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const activateDepartment = async (departmentId) => {
    const query = 'UPDATE departments SET is_active = true WHERE department_id = $1 RETURNING *';
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deactivateDepartment = async (departmentId) => {
    const query = 'UPDATE departments SET is_active = false WHERE department_id = $1 RETURNING *';
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    activateDepartment,
    deactivateDepartment
};
