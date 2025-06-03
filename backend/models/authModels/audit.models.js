import pool from '../../config/db.config.js';

const createAuditLog = async (userId, action, details) => {
    const query = `
        INSERT INTO audit_logs (user_id, action, details)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [userId, action, details];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getAuditLogs = async ({ limit, offset, userId, action, startDate, endDate }) => {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (userId) {
        query += ` AND user_id = $${paramCount}`;
        values.push(userId);
        paramCount++;
    }

    if (action) {
        query += ` AND action = $${paramCount}`;
        values.push(action);
        paramCount++;
    }

    if (startDate) {
        query += ` AND created_at >= $${paramCount}`;
        values.push(startDate);
        paramCount++;
    }

    if (endDate) {
        query += ` AND created_at <= $${paramCount}`;
        values.push(endDate);
        paramCount++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const { rows: countRows } = await pool.query(countQuery, values);
    const total = parseInt(countRows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return { logs: rows, total };
};

export { createAuditLog, getAuditLogs }; 