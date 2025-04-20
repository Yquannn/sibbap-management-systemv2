const pool = require('../config/db');

// ==========================================
// INTEREST RATE MODULES (BASE TABLE)
// ==========================================

// Create and Save a new Interest Rate Module
exports.createModule = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).send({
        message: "Name cannot be empty!"
      });
    }

    const { name, module_type = 'standard', interest_rate, updated_by } = req.body;

    // SQL query to insert a new module
    const query = `
      INSERT INTO interest_rate_modules 
      (name, module_type, interest_rate, updated_by) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [name, module_type, interest_rate, updated_by]);
    
    res.status(201).send({
      id: result.insertId,
      name,
      module_type,
      interest_rate,
      updated_by
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the module."
    });
  }
};

// Retrieve all Interest Rate Modules
exports.findAllModules = async (req, res) => {
  try {
    const isArchived = req.query.archived === 'true' ? 1 : 0;
    
    const query = `
      SELECT * FROM interest_rate_modules 
      WHERE is_archived = ?
    `;
    
    const [rows] = await pool.query(query, [isArchived]);
    
    res.send(rows);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving modules."
    });
  }
};

// Find a single Interest Rate Module by id
exports.findOneModule = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT * FROM interest_rate_modules 
      WHERE id = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length > 0) {
      res.send(rows[0]);
    } else {
      res.status(404).send({
        message: `Module with id=${id} not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving module with id=${req.params.id}`
    });
  }
};

// Update an Interest Rate Module
exports.updateModule = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, interest_rate, updated_by } = req.body;
    
    // Build query dynamically based on what fields are provided
    let updateFields = [];
    let params = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      params.push(name);
    }
    
    if (interest_rate !== undefined) {
      updateFields.push('interest_rate = ?');
      params.push(interest_rate);
    }
    
    if (updated_by !== undefined) {
      updateFields.push('updated_by = ?');
      params.push(updated_by);
    }
    
    // Add last_edited timestamp
    updateFields.push('last_edited = NOW()');
    
    // Add id to params
    params.push(id);
    
    if (updateFields.length === 0) {
      return res.status(400).send({
        message: "No fields to update"
      });
    }
    
    const query = `
      UPDATE interest_rate_modules 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Module was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update module with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating module with id=${req.params.id}: ${err.message}`
    });
  }
};

// Archive an Interest Rate Module
exports.archiveModule = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      UPDATE interest_rate_modules 
      SET is_archived = 1, archived_date = NOW() 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Module was archived successfully."
      });
    } else {
      res.send({
        message: `Cannot archive module with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error archiving module with id=${req.params.id}`
    });
  }
};

// Restore an archived Interest Rate Module
exports.restoreModule = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      UPDATE interest_rate_modules 
      SET is_archived = 0, archived_date = NULL 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Module was restored successfully."
      });
    } else {
      res.send({
        message: `Cannot restore module with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error restoring module with id=${req.params.id}`
    });
  }
};

// Delete a module permanently
exports.deleteModule = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      DELETE FROM interest_rate_modules 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Module was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete module with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error deleting module with id=${req.params.id}`
    });
  }
};

// ==========================================
// TIME DEPOSIT RATES
// ==========================================

// Create a new Time Deposit Rate
exports.createTimeDepositRate = async (req, res) => {
  try {
    // Validate request
    if (!req.body.module_id || !req.body.term_months || !req.body.threshold || req.body.rate === undefined) {
      return res.status(400).send({
        message: "All fields are required!"
      });
    }

    const { module_id, term_months, threshold, rate } = req.body;

    const query = `
      INSERT INTO time_deposit_rates 
      (module_id, term_months, threshold, rate) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [module_id, term_months, threshold, rate]);
    
    res.status(201).send({
      id: result.insertId,
      module_id,
      term_months,
      threshold,
      rate
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the rate."
    });
  }
};

// Get all time deposit rates for a module
exports.findTimeDepositRates = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    
    const query = `
      SELECT * FROM time_deposit_rates 
      WHERE module_id = ? 
      ORDER BY term_months ASC, threshold ASC
    `;
    
    const [rows] = await pool.query(query, [moduleId]);
    
    res.send(rows);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving rates."
    });
  }
};

// Get time deposit rates for a specific term
exports.findTimeDepositRatesByTerm = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const termMonths = req.params.termMonths;
    
    const query = `
      SELECT * FROM time_deposit_rates 
      WHERE module_id = ? AND term_months = ? 
      ORDER BY threshold ASC
    `;
    
    const [rows] = await pool.query(query, [moduleId, termMonths]);
    
    res.send(rows);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving rates."
    });
  }
};

// Update a Time Deposit Rate
exports.updateTimeDepositRate = async (req, res) => {
  try {
    const id = req.params.id;
    const { threshold, rate } = req.body;
    
    // Build query dynamically based on what fields are provided
    let updateFields = [];
    let params = [];
    
    if (threshold !== undefined) {
      updateFields.push('threshold = ?');
      params.push(threshold);
    }
    
    if (rate !== undefined) {
      updateFields.push('rate = ?');
      params.push(rate);
    }
    
    // Add last_updated timestamp
    updateFields.push('last_updated = NOW()');
    
    // Add id to params
    params.push(id);
    
    if (updateFields.length === 0) {
      return res.status(400).send({
        message: "No fields to update"
      });
    }
    
    const query = `
      UPDATE time_deposit_rates 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Rate was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update rate with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating rate with id=${req.params.id}`
    });
  }
};

// Delete a Time Deposit Rate
exports.deleteTimeDepositRate = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      DELETE FROM time_deposit_rates 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Rate was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete rate with id=${id}. Maybe it was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error deleting rate with id=${req.params.id}`
    });
  }
};

// ==========================================
// SHARE CAPITAL RATES
// ==========================================

// Create a new Share Capital Rate
exports.createShareCapitalRate = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Validate request
    const { module_id, rate, updated_by } = req.body;
    
    if (!module_id || rate === undefined || !updated_by) {
      return res.status(400).send({
        message: "All fields are required!"
      });
    }

    // Start transaction
    await connection.beginTransaction();
    
    // 1. Set end date of current rate to yesterday
    const updateQuery = `
      UPDATE share_capital_rates 
      SET end_date = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
      WHERE module_id = ? AND end_date IS NULL
    `;
    
    await connection.query(updateQuery, [module_id]);
    
    // 2. Insert new rate record
    const insertQuery = `
      INSERT INTO share_capital_rates 
      (module_id, rate, effective_date, updated_by) 
      VALUES (?, ?, CURRENT_DATE(), ?)
    `;
    
    const [result] = await connection.query(insertQuery, [module_id, rate, updated_by]);
    
    // Commit transaction
    await connection.commit();
    
    res.status(201).send({
      id: result.insertId,
      module_id,
      rate,
      effective_date: new Date().toISOString().split('T')[0],
      updated_by
    });
  } catch (err) {
    // Rollback transaction on error
    await connection.rollback();
    
    res.status(500).send({
      message: err.message || "Some error occurred while creating the rate."
    });
  } finally {
    // Release connection back to pool
    connection.release();
  }
};

// Get current share capital rate for a module
exports.findCurrentShareCapitalRate = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    
    const query = `
      SELECT * FROM share_capital_rates 
      WHERE module_id = ? 
      AND effective_date <= CURRENT_DATE() 
      AND (end_date IS NULL OR end_date >= CURRENT_DATE()) 
      ORDER BY effective_date DESC 
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [moduleId]);
    
    if (rows.length > 0) {
      res.send(rows[0]);
    } else {
      res.status(404).send({
        message: `No current rate found for module id=${moduleId}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the rate."
    });
  }
};

// Get share capital rate history for a module
exports.findShareCapitalRateHistory = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    
    const query = `
      SELECT * FROM share_capital_rates 
      WHERE module_id = ? 
      ORDER BY effective_date DESC
    `;
    
    const [rows] = await pool.query(query, [moduleId]);
    
    res.send(rows);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving rate history."
    });
  }
};

// ==========================================
// REGULAR SAVINGS RATES
// ==========================================

// Update a Regular Savings Rate (simplified, just uses the base module)
exports.updateRegularSavingsRate = async (req, res) => {
  try {
    const id = req.params.id;
    const { interest_rate, updated_by } = req.body;
    
    if (interest_rate === undefined) {
      return res.status(400).send({
        message: "Interest rate is required!"
      });
    }
    
    const query = `
      UPDATE interest_rate_modules 
      SET interest_rate = ?, updated_by = ?, last_edited = NOW() 
      WHERE id = ? AND module_type = 'standard'
    `;
    
    const [result] = await pool.query(query, [interest_rate, updated_by, id]);
    
    if (result.affectedRows > 0) {
      res.send({
        message: "Regular savings rate was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update rate for module with id=${id}. Maybe it was not found or is not a standard module!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating regular savings rate: ${err.message}`
    });
  }
};