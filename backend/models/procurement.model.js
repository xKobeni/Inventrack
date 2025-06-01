import pool from '../config/db.config.js';

const getAllProcurementRequests = async () => {
    const query = `
        WITH request_items_data AS (
            SELECT 
                ri.request_id,
                json_agg(
                    json_build_object(
                        'id', ri.id,
                        'item_id', ri.item_id,
                        'quantity', ri.quantity,
                        'item_name', i.name,
                        'description', i.description,
                        'unit', i.unit
                    )
                ) as items
            FROM request_items ri
            LEFT JOIN inventory_items i ON ri.item_id = i.item_id
            GROUP BY ri.request_id
        )
        SELECT 
            pr.*, 
            u.name as requested_by_name,
            d.name as department_name,
            r.name as reviewed_by_name,
            COALESCE(rid.items, '[]'::json) as items
        FROM procurement_requests pr
        LEFT JOIN users u ON pr.requested_by = u.user_id
        LEFT JOIN departments d ON pr.department_id = d.department_id
        LEFT JOIN users r ON pr.reviewed_by = r.user_id
        LEFT JOIN request_items_data rid ON pr.request_id = rid.request_id
        ORDER BY pr.requested_at DESC`;
    const { rows } = await pool.query(query);
    return rows;
};

const getProcurementRequestById = async (requestId) => {
    const query = `
        WITH request_items_data AS (
            SELECT 
                ri.request_id,
                json_agg(
                    json_build_object(
                        'id', ri.id,
                        'item_id', ri.item_id,
                        'quantity', ri.quantity,
                        'item_name', i.name,
                        'description', i.description,
                        'unit', i.unit
                    )
                ) as items
            FROM request_items ri
            LEFT JOIN inventory_items i ON ri.item_id = i.item_id
            WHERE ri.request_id = $1
            GROUP BY ri.request_id
        )
        SELECT 
            pr.*, 
            u.name as requested_by_name,
            d.name as department_name,
            r.name as reviewed_by_name,
            COALESCE(rid.items, '[]'::json) as items
        FROM procurement_requests pr
        LEFT JOIN users u ON pr.requested_by = u.user_id
        LEFT JOIN departments d ON pr.department_id = d.department_id
        LEFT JOIN users r ON pr.reviewed_by = r.user_id
        LEFT JOIN request_items_data rid ON pr.request_id = rid.request_id
        WHERE pr.request_id = $1`;
    const values = [requestId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getRequestItems = async (requestId) => {
    const query = `
        SELECT ri.*, i.name as item_name, i.description
        FROM request_items ri
        LEFT JOIN inventory_items i ON ri.item_id = i.item_id
        WHERE ri.request_id = $1`;
    const values = [requestId];
    const { rows } = await pool.query(query, values);
    return rows;
};

const createProcurementRequest = async (requestData) => {
    const {
        requested_by,
        department_id,
        justification,
        priority,
        required_by_date,
        category,
        subcategory,
        items
    } = requestData;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert procurement request
        const requestQuery = `
            INSERT INTO procurement_requests 
            (requested_by, department_id, justification, priority, required_by_date, category, subcategory)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
        const requestValues = [
            requested_by,
            department_id,
            justification,
            priority || 'medium',
            required_by_date,
            category,
            subcategory
        ];

        console.log('Creating procurement request with values:', {
            requested_by,
            department_id,
            justification,
            priority,
            required_by_date,
            category,
            subcategory
        });

        const { rows: [request] } = await client.query(requestQuery, requestValues);

        // Insert request items
        if (items && items.length > 0) {
            const itemValues = items.map(item => 
                `(${request.request_id}, ${item.item_id}, ${item.quantity})`
            ).join(',');
            
            const itemsQuery = `
                INSERT INTO request_items (request_id, item_id, quantity)
                VALUES ${itemValues}
                RETURNING *`;
            const { rows: requestItems } = await client.query(itemsQuery);
            request.items = requestItems;
        }

        await client.query('COMMIT');
        return request;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in createProcurementRequest:', error);
        throw error;
    } finally {
        client.release();
    }
};

const updateProcurementRequest = async (requestId, requestData) => {
    const {
        status,
        reviewed_by,
        justification,
        priority,
        required_by_date,
        category,
        subcategory
    } = requestData;

    const query = `
        UPDATE procurement_requests 
        SET status = COALESCE($1, status),
            reviewed_by = COALESCE($2, reviewed_by),
            reviewed_at = CASE WHEN $2 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE reviewed_at END,
            justification = COALESCE($3, justification),
            priority = COALESCE($4, priority),
            required_by_date = COALESCE($5, required_by_date),
            category = COALESCE($6, category),
            subcategory = COALESCE($7, subcategory)
        WHERE request_id = $8
        RETURNING *`;
    
    const values = [
        status,
        reviewed_by,
        justification,
        priority,
        required_by_date,
        category,
        subcategory,
        requestId
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const deleteProcurementRequest = async (requestId) => {
    const query = 'DELETE FROM procurement_requests WHERE request_id = $1 RETURNING *';
    const values = [requestId];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const getProcurementRequestsByUser = async (userId) => {
    try {
        console.log('Fetching requests for user:', userId);
        
        // First, verify the user exists
        const userCheckQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userCheckResult = await pool.query(userCheckQuery, [userId]);
        console.log('User check result:', {
            userExists: userCheckResult.rows.length > 0,
            user: userCheckResult.rows[0]
        });

        // Then, check if there are any requests for this user
        const requestCheckQuery = 'SELECT COUNT(*) FROM procurement_requests WHERE requested_by = $1';
        const requestCheckResult = await pool.query(requestCheckQuery, [userId]);
        console.log('Request check result:', {
            requestCount: requestCheckResult.rows[0].count
        });

        // Main query with detailed logging
        const query = `
            WITH request_items_data AS (
                SELECT 
                    ri.request_id,
                    json_agg(
                        json_build_object(
                            'id', ri.id,
                            'item_id', ri.item_id,
                            'quantity', ri.quantity,
                            'item_name', i.name,
                            'description', i.description,
                            'unit', i.unit
                        )
                    ) as items
                FROM request_items ri
                LEFT JOIN inventory_items i ON ri.item_id = i.item_id
                GROUP BY ri.request_id
            )
            SELECT 
                pr.*, 
                u.name as requested_by_name,
                d.name as department_name,
                r.name as reviewed_by_name,
                COALESCE(rid.items, '[]'::json) as items
            FROM procurement_requests pr
            LEFT JOIN users u ON pr.requested_by = u.user_id
            LEFT JOIN departments d ON pr.department_id = d.department_id
            LEFT JOIN users r ON pr.reviewed_by = r.user_id
            LEFT JOIN request_items_data rid ON pr.request_id = rid.request_id
            WHERE pr.requested_by = $1
            ORDER BY pr.requested_at DESC`;
        
        const values = [userId];
        console.log('Executing main query with values:', values);
        
        const { rows } = await pool.query(query, values);
        console.log('Main query results:', {
            rowCount: rows.length,
            firstRow: rows[0],
            query: query,
            values: values
        });

        // If no results, check the table structure
        if (rows.length === 0) {
            const tableInfoQuery = `
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'procurement_requests'`;
            const tableInfo = await pool.query(tableInfoQuery);
            console.log('Table structure:', tableInfo.rows);
        }
        
        return rows;
    } catch (error) {
        console.error('Error in getProcurementRequestsByUser:', {
            error: error.message,
            stack: error.stack,
            userId: userId
        });
        throw error;
    }
};

const getProcurementRequestsByDepartment = async (departmentId) => {
    const query = `
        WITH request_items_data AS (
            SELECT 
                ri.request_id,
                json_agg(
                    json_build_object(
                        'id', ri.id,
                        'item_id', ri.item_id,
                        'quantity', ri.quantity,
                        'item_name', i.name,
                        'description', i.description,
                        'unit', i.unit
                    )
                ) as items
            FROM request_items ri
            LEFT JOIN inventory_items i ON ri.item_id = i.item_id
            GROUP BY ri.request_id
        )
        SELECT 
            pr.*, 
            u.name as requested_by_name,
            d.name as department_name,
            r.name as reviewed_by_name,
            COALESCE(rid.items, '[]'::json) as items
        FROM procurement_requests pr
        LEFT JOIN users u ON pr.requested_by = u.user_id
        LEFT JOIN departments d ON pr.department_id = d.department_id
        LEFT JOIN users r ON pr.reviewed_by = r.user_id
        LEFT JOIN request_items_data rid ON pr.request_id = rid.request_id
        WHERE pr.department_id = $1
        ORDER BY pr.requested_at DESC`;
    
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows;
};

export {
    getAllProcurementRequests,
    getProcurementRequestById,
    getRequestItems,
    createProcurementRequest,
    updateProcurementRequest,
    deleteProcurementRequest,
    getProcurementRequestsByUser,
    getProcurementRequestsByDepartment
};
