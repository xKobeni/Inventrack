import pool from '../config/db.config.js';

const getAllDepartments = async () => {
    const query = 'SELECT * FROM departments ORDER BY name';
    const { rows } = await pool.query(query);
    return rows;
}

const getDepartmentById = async (departmentId) => {
    const query = 'SELECT * FROM departments WHERE department_id = $1';
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createDepartment = async (name) => {
    const query = 'INSERT INTO departments (name) VALUES ($1) RETURNING *';
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateDepartment = async (departmentId, name) => {
    const query = 'UPDATE departments SET name = $1 WHERE department_id = $2 RETURNING *';
    const values = [name, departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteDepartment = async (departmentId) => {
    const query = 'DELETE FROM departments WHERE department_id = $1 RETURNING *';
    const values = [departmentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

export {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
