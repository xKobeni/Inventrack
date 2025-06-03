import pool from '../config/db.config.js';

const createIncidentReport = async (reportData) => {
    const { reported_by, item_id, type, description, custom_item } = reportData;
    
    // If custom_item is provided, we'll use null for item_id
    const query = `
        INSERT INTO incident_reports 
        (reported_by, item_id, type, description, custom_item) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;
    const values = [reported_by, item_id || null, type, description, custom_item || null];
    const { rows } = await pool.query(query, values);
    
    // Get the reporter's name
    const reporterQuery = 'SELECT name FROM users WHERE user_id = $1';
    const reporterResult = await pool.query(reporterQuery, [reported_by]);
    const reporterName = reporterResult.rows[0]?.name;

    return {
        ...rows[0],
        reporter_name: reporterName
    };
};

const getIncidentReportById = async (reportId) => {
    const query = `
        SELECT 
            ir.*,
            u.name as reporter_name,
            i.name as item_name,
            CASE 
                WHEN ir.custom_item IS NOT NULL THEN ir.custom_item
                ELSE i.name
            END as display_name
        FROM incident_reports ir
        INNER JOIN users u ON ir.reported_by = u.user_id
        LEFT JOIN inventory_items i ON ir.item_id = i.item_id
        WHERE ir.report_id = $1`;
    const values = [reportId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getAllIncidentReports = async () => {
    const query = `
        SELECT 
            ir.*,
            u.name as reporter_name,
            i.name as item_name,
            CASE 
                WHEN ir.custom_item IS NOT NULL THEN ir.custom_item
                ELSE i.name
            END as display_name
        FROM incident_reports ir
        INNER JOIN users u ON ir.reported_by = u.user_id
        LEFT JOIN inventory_items i ON ir.item_id = i.item_id
        ORDER BY ir.created_at DESC`;
    const { rows } = await pool.query(query);
    return rows;
};

const updateIncidentReport = async (reportId, updateData) => {
    const { status, resolved_by, resolved_at } = updateData;
    const query = `
        UPDATE incident_reports 
        SET status = COALESCE($1, status),
            resolved_by = COALESCE($2, resolved_by),
            resolved_at = COALESCE($3, resolved_at)
        WHERE report_id = $4 
        RETURNING *`;
    const values = [status, resolved_by, resolved_at, reportId];
    const { rows } = await pool.query(query, values);
    
    if (rows[0]) {
        // Get the reporter's name
        const reporterQuery = 'SELECT name FROM users WHERE user_id = $1';
        const reporterResult = await pool.query(reporterQuery, [rows[0].reported_by]);
        const reporterName = reporterResult.rows[0]?.name;

        return {
            ...rows[0],
            reporter_name: reporterName
        };
    }
    return null;
};

const getIncidentReportsByUser = async (userId) => {
    const query = `
        SELECT 
            ir.*,
            u.name as reporter_name,
            i.name as item_name,
            CASE 
                WHEN ir.custom_item IS NOT NULL THEN ir.custom_item
                ELSE i.name
            END as display_name
        FROM incident_reports ir
        INNER JOIN users u ON ir.reported_by = u.user_id
        LEFT JOIN inventory_items i ON ir.item_id = i.item_id
        WHERE ir.reported_by = $1
        ORDER BY ir.created_at DESC`;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows;
};

const getIncidentReportsByItem = async (itemId) => {
    const query = `
        SELECT 
            ir.*,
            u.name as reporter_name,
            i.name as item_name,
            CASE 
                WHEN ir.custom_item IS NOT NULL THEN ir.custom_item
                ELSE i.name
            END as display_name
        FROM incident_reports ir
        INNER JOIN users u ON ir.reported_by = u.user_id
        LEFT JOIN inventory_items i ON ir.item_id = i.item_id
        WHERE ir.item_id = $1
        ORDER BY ir.created_at DESC`;
    const values = [itemId];
    const { rows } = await pool.query(query, values);
    return rows;
};

export {
    createIncidentReport,
    getIncidentReportById,
    getAllIncidentReports,
    updateIncidentReport,
    getIncidentReportsByUser,
    getIncidentReportsByItem
};
