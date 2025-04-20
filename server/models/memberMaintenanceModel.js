const db = require('../config/db');

// Get all active contribution types
exports.getAllContributionTypes = async () => {
    const [rows] = await db.query(`SELECT * FROM contribution_types WHERE is_active = 1`);
    return rows;
};

exports.getAllContributionTypesArchive = async () => {
    const [rows] = await db.query(`SELECT * FROM contribution_types WHERE is_active = 0`);
    return rows;
};

// Restore (reactivate) a contribution type
exports.restoreArchive = async (id) => {
    const [result] = await db.query(
        `UPDATE contribution_types 
         SET is_active = 1, updated_at = NOW() 
         WHERE contribution_type_id = ?`,
        [id]
    );
    return result.affectedRows;
};


// Get a single contribution type by ID
exports.getContributionTypeById = async (id) => {
    const [rows] = await db.query(
        `SELECT * FROM contribution_types WHERE contribution_type_id = ? LIMIT 1`,
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Add a new contribution type
exports.addContributionType = async (name, amount, description) => {
    const [result] = await db.query(
        `INSERT INTO contribution_types (name, amount, description) VALUES (?, ?, ?)`,
        [name, amount, description]
    );
    return result.insertId;
};

// Update a contribution type
exports.updateContributionType = async (id, name, amount, description) => {
    const [result] = await db.query(
        `UPDATE contribution_types SET name = ?, amount = ?, description = ?, updated_at = NOW() WHERE contribution_type_id = ?`,
        [name, amount, description, id]
    );
    return result.affectedRows;
};

// Soft delete (deactivate) a contribution type
exports.archiveContributionType = async (id) => {
    const [result] = await db.query(
        `UPDATE contribution_types SET is_active = 0, updated_at = NOW() WHERE contribution_type_id = ?`,
        [id]
    );
    return result.affectedRows;
};
