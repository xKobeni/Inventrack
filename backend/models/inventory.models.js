import pool from '../config/db.config.js';

const getAllInventoryItems = async () => {
    const query = `
        SELECT i.*, d.name as department_name, u.name as created_by_name 
        FROM inventory_items i
        LEFT JOIN departments d ON i.department_id = d.department_id
        LEFT JOIN users u ON i.created_by = u.user_id
        ORDER BY i.name`;
    const { rows } = await pool.query(query);
    return rows;
}

const getInventoryItemById = async (itemId) => {
    const query = `
        SELECT i.*, d.name as department_name, u.name as created_by_name 
        FROM inventory_items i
        LEFT JOIN departments d ON i.department_id = d.department_id
        LEFT JOIN users u ON i.created_by = u.user_id
        WHERE i.item_id = $1`;
    const values = [itemId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createInventoryItem = async (itemData) => {
    const { name, description, category, quantity, unit, condition, status, expiration_date, department_id, created_by } = itemData;
    const query = `
        INSERT INTO inventory_items 
        (name, description, category, quantity, unit, condition, status, expiration_date, department_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`;
    const values = [name, description, category, quantity, unit, condition, status, expiration_date, department_id, created_by];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateInventoryItem = async (itemId, itemData) => {
    const { name, description, category, quantity, unit, condition, status, expiration_date, department_id } = itemData;
    const query = `
        UPDATE inventory_items 
        SET name = $1, description = $2, category = $3, quantity = $4, 
            unit = $5, condition = $6, status = $7, expiration_date = $8, 
            department_id = $9
        WHERE item_id = $10
        RETURNING *`;
    const values = [name, description, category, quantity, unit, condition, status, expiration_date, department_id, itemId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteInventoryItem = async (itemId) => {
    const query = 'DELETE FROM inventory_items WHERE item_id = $1 RETURNING *';
    const values = [itemId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

export {
    getAllInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
