// models/loanTypeModel.js
const pool = require('../config/db');

class LoanType {
  /** 
   * Fetch all loan types, optionally including archived ones,
   * and join any commodity details if they exist.
   * 
   * 
   */
  static async getAll(includeArchived = false) {
    let sql = `
      SELECT 
        lt.*, 
        lcd.commodity_type, 
        lcd.price_per_unit, 
        lcd.max_units, 
        lcd.loan_percentage 
      FROM loan_types lt
      LEFT JOIN loan_commodity_details lcd 
        ON lt.id = lcd.loan_type_id
    `;
    if (!includeArchived) {
      sql += ' WHERE lt.is_archived = 0';
    }
    const [rows] = await pool.query(sql);
    return rows;
  }


  static async getByLoanType(loanTypeName, exact = false) {
    let sql = `
      SELECT 
        lt. loan_type,
        lt.interest_rate,
        lt.service_fee,
        lt.penalty_fee,
        lt.additional_savings_deposit, 
        lcd.commodity_type, 
        lcd.price_per_unit, 
        lcd.loan_percentage 
      FROM loan_types lt
      LEFT JOIN loan_commodity_details lcd 
        ON lt.id = lcd.loan_type_id
      WHERE lt.is_archived = 0 AND 
    `;
    
    if (exact) {
      sql += 'lt.loan_type = ?';
    } else {
      sql += 'lt.loan_type LIKE ?';
      loanTypeName = `%${loanTypeName}%`;
    }
    
    const [rows] = await pool.query(sql, [loanTypeName]);
    return rows;
  }

  /**
   * Fetch one loan type by ID, including its commodity details.
   */
  static async getById(id) {
    const sql = `
      SELECT 
        lt.*, 
        lcd.commodity_type, 
        lcd.price_per_unit, 
        lcd.max_units, 
        lcd.loan_percentage 
      FROM loan_types lt
      LEFT JOIN loan_commodity_details lcd 
        ON lt.id = lcd.loan_type_id
      WHERE lt.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new loan type and (optionally) its commodity details in one transaction.
   * Defaults loan_percentage to 70.00 if not provided.
   */
  static async create(data) {
    const {
      loan_type,
      interest_rate,
      service_fee,
      penalty_fee,
      // new field:
      additional_savings_deposit = 0.00,
      commodity_type,
      price_per_unit,
      max_units,
      loan_percentage = 70.0
    } = data;
  
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
  
      // include the new column in your INSERT
      const [res] = await conn.query(
        `INSERT INTO loan_types 
          (loan_type, interest_rate, service_fee, penalty_fee, additional_savings_deposit) 
         VALUES (?, ?, ?, ?, ?)`,
        [loan_type, interest_rate, service_fee, penalty_fee, additional_savings_deposit]
      );
      const loanTypeId = res.insertId;
  
      if (commodity_type && price_per_unit && max_units) {
        await conn.query(
          `INSERT INTO loan_commodity_details 
            (loan_type_id, commodity_type, price_per_unit, max_units, loan_percentage) 
           VALUES (?, ?, ?, ?, ?)`,
          [loanTypeId, commodity_type, price_per_unit, max_units, loan_percentage]
        );
      }
  
      await conn.commit();
      return loanTypeId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  
  /**
   * Update a loan type and create/update its commodity details in one transaction.
   */
  static async update(id, data) {
    const {
      loan_type,
      interest_rate,
      service_fee,
      penalty_fee,
      additional_savings_deposit,
      commodity_type,
      price_per_unit,
      max_units,
      loan_percentage = 70.0
    } = data;
   
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
   
      await conn.query(
        `UPDATE loan_types 
           SET loan_type = ?, interest_rate = ?, service_fee = ?, penalty_fee = ?, additional_savings_deposit = ?
         WHERE id = ?`,
        [loan_type, interest_rate, service_fee, penalty_fee, additional_savings_deposit || null, id]
      );
   
      if (commodity_type && price_per_unit && max_units) {
        const [exists] = await conn.query(
          `SELECT id 
             FROM loan_commodity_details 
            WHERE loan_type_id = ?`,
          [id]
        );
   
        if (exists.length) {
          await conn.query(
            `UPDATE loan_commodity_details
               SET commodity_type = ?, price_per_unit = ?, max_units = ?, loan_percentage = ?
             WHERE loan_type_id = ?`,
            [commodity_type, price_per_unit, max_units, loan_percentage, id]
          );
        } else {
          await conn.query(
            `INSERT INTO loan_commodity_details
              (loan_type_id, commodity_type, price_per_unit, max_units, loan_percentage)
             VALUES (?, ?, ?, ?, ?)`,
            [id, commodity_type, price_per_unit, max_units, loan_percentage]
          );
        }
      }
   
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
   }
  /**
   * Soft‐archive a loan type.
   */
  static async archive(id) {
    const [res] = await pool.query(
      `UPDATE loan_types 
          SET is_archived = 1, archived_date = CURDATE() 
        WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  }

  /**
   * Restore an archived loan type.
   */
  static async unarchive(id) {
    const [res] = await pool.query(
      `UPDATE loan_types 
          SET is_archived = 0, archived_date = NULL 
        WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  }
}

module.exports = LoanType;
