import pool from '../config/db.config.js';

// Get overall system statistics
export const getSystemStats = async () => {
    const client = await pool.connect();
    try {
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM departments) as total_departments,
                (SELECT COUNT(*) FROM inventory_items) as total_items,
                (SELECT COUNT(*) FROM procurement_requests) as total_requests,
                (SELECT COUNT(*) FROM incident_reports) as total_incidents,
                (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
                (SELECT COUNT(*) FROM users WHERE role = 'gso_staff') as total_gso_staff,
                (SELECT COUNT(*) FROM users WHERE role = 'department_rep') as total_dept_reps
        `);
        return stats.rows[0];
    } finally {
        client.release();
    }
};

// Get recent activities
export const getRecentActivities = async (limit = 10) => {
    const client = await pool.connect();
    try {
        const activities = await client.query(`
            SELECT 
                al.log_id,
                al.action,
                al.details,
                al.target_table,
                al.target_id,
                al.created_at,
                u.name as user_name,
                u.email as user_email
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);
        return activities.rows;
    } finally {
        client.release();
    }
};

// Get department statistics
export const getDepartmentStats = async () => {
    const client = await pool.connect();
    try {
        const stats = await client.query(`
            SELECT 
                d.department_id,
                d.name as department_name,
                COUNT(DISTINCT u.user_id) as total_users,
                COUNT(DISTINCT i.item_id) as total_items,
                COUNT(DISTINCT pr.request_id) as total_requests,
                COUNT(DISTINCT ir.report_id) as total_incidents
            FROM departments d
            LEFT JOIN users u ON d.department_id = u.department_id
            LEFT JOIN inventory_items i ON d.department_id = i.department_id
            LEFT JOIN procurement_requests pr ON d.department_id = pr.department_id
            LEFT JOIN incident_reports ir ON i.item_id = ir.item_id
            GROUP BY d.department_id, d.name
            ORDER BY d.name
        `);
        return stats.rows;
    } finally {
        client.release();
    }
};

// Get inventory statistics
export const getInventoryStats = async () => {
    const client = await pool.connect();
    try {
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                COUNT(CASE WHEN condition = 'new' THEN 1 END) as new_items,
                COUNT(CASE WHEN condition = 'used' THEN 1 END) as used_items,
                COUNT(CASE WHEN condition = 'damaged' THEN 1 END) as damaged_items,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_items,
                COUNT(CASE WHEN status = 'in_use' THEN 1 END) as in_use_items,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_items
            FROM inventory_items
        `);
        return stats.rows[0];
    } finally {
        client.release();
    }
};

// Get procurement request statistics
export const getProcurementStats = async () => {
    const client = await pool.connect();
    try {
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
                COUNT(CASE WHEN status = 'denied' THEN 1 END) as denied_requests,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
                COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
            FROM procurement_requests
        `);
        return stats.rows[0];
    } finally {
        client.release();
    }
};

// Get user activity statistics
export const getUserActivityStats = async (days = 30) => {
    const client = await pool.connect();
    try {
        const stats = await client.query(`
            SELECT 
                DATE(al.created_at) as activity_date,
                COUNT(*) as activity_count,
                COUNT(DISTINCT al.user_id) as unique_users
            FROM audit_logs al
            WHERE al.created_at >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY DATE(al.created_at)
            ORDER BY activity_date DESC
        `);
        return stats.rows;
    } finally {
        client.release();
    }
};
