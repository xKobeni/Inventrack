import pool from '../config/db.config.js';

const getAllInventoryItems = async () => {
    const query = `
        SELECT i.*, d.name as department_name, u.name as created_by_name, c.name as category_name
        FROM inventory_items i
        LEFT JOIN departments d ON i.department_id = d.department_id
        LEFT JOIN users u ON i.created_by = u.user_id
        LEFT JOIN item_categories c ON i.category_id = c.category_id
        ORDER BY i.name`;
    const { rows } = await pool.query(query);
    return rows;
}

const getInventoryItemById = async (itemId) => {
    const query = `
        SELECT i.*, d.name as department_name, u.name as created_by_name, c.name as category_name
        FROM inventory_items i
        LEFT JOIN departments d ON i.department_id = d.department_id
        LEFT JOIN users u ON i.created_by = u.user_id
        LEFT JOIN item_categories c ON i.category_id = c.category_id
        WHERE i.item_id = $1`;
    const values = [itemId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createInventoryItem = async (itemData) => {
    const {
        name, description, category_id, quantity, unit, condition, status,
        expiration_date, acquisition_date, unit_cost, location, serial_number,
        property_number, department_id, created_by
    } = itemData;

    const query = `
        INSERT INTO inventory_items 
        (name, description, category_id, quantity, unit, condition, status,
         expiration_date, acquisition_date, unit_cost, location, serial_number,
         property_number, department_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`;
    
    const values = [
        name, description, category_id, quantity, unit, condition, status,
        expiration_date, acquisition_date, unit_cost, location, serial_number,
        property_number, department_id, created_by
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateInventoryItem = async (itemId, itemData) => {
    const {
        name, description, category_id, quantity, unit, condition, status,
        expiration_date, acquisition_date, unit_cost, location, serial_number,
        property_number, department_id, updated_by
    } = itemData;

    const query = `
        UPDATE inventory_items 
        SET name = $1, description = $2, category_id = $3, quantity = $4,
            unit = $5, condition = $6, status = $7, expiration_date = $8,
            acquisition_date = $9, unit_cost = $10, location = $11,
            serial_number = $12, property_number = $13, department_id = $14,
            updated_by = $15, updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $16
        RETURNING *`;
    
    const values = [
        name, description, category_id, quantity, unit, condition, status,
        expiration_date, acquisition_date, unit_cost, location, serial_number,
        property_number, department_id, updated_by, itemId
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteInventoryItem = async (itemId) => {
    const query = 'DELETE FROM inventory_items WHERE item_id = $1 RETURNING *';
    const values = [itemId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// New functions for item categories
const getAllCategories = async () => {
    const query = 'SELECT * FROM item_categories ORDER BY name';
    const { rows } = await pool.query(query);
    return rows;
}

const getCategoryById = async (categoryId) => {
    const query = 'SELECT * FROM item_categories WHERE category_id = $1';
    const values = [categoryId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createCategory = async (name) => {
    const query = 'INSERT INTO item_categories (name) VALUES ($1) RETURNING *';
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateCategory = async (categoryId, name) => {
    const query = 'UPDATE item_categories SET name = $1 WHERE category_id = $2 RETURNING *';
    const values = [name, categoryId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteCategory = async (categoryId) => {
    const query = 'DELETE FROM item_categories WHERE category_id = $1 RETURNING *';
    const values = [categoryId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

export {
    getAllInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
