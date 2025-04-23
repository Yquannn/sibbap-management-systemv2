// models/loanHistoryModel.js
const db = require('../config/db');

class LoanModel {
  static async getAllLoans() {
    const [rows] = await db.query('SELECT * FROM loan_applications');
    return rows;
  }

  static async getLoanById(id) {
    const [rows] = await db.query(
      'SELECT * FROM loan_applications WHERE loan_application_id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async getLoansByMemberId(memberId) {
    const [rows] = await db.query(
      'SELECT * FROM loan_applications WHERE memberId = ?',
      [memberId]
    );
    return rows;
  }

  static async createLoan(data) {
    const {
      client_voucher_number,
      memberId,
      loan_type,
      application,
      loan_amount,
      loanable_amount,
      interest,
      terms,
      balance,
      service_fee,
      status,
      remarks,
      disbursed_date,
      approval_date,
      completion_date
    } = data;

    const [result] = await db.query(
      `INSERT INTO loan_applications
        (client_voucher_number, memberId, loan_type, application,
         loan_amount, loanable_amount, interest, terms,
         balance, service_fee, status, remarks,
         disbursed_date, approval_date, completion_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_voucher_number, memberId, loan_type, application,
        loan_amount, loanable_amount, interest, terms,
        balance, service_fee, status || 'Waiting for Approval', remarks || null,
        disbursed_date || null, approval_date || null, completion_date || null
      ]
    );
    return result.insertId;
  }

  static async updateLoan(id, data) {
    const {
      client_voucher_number,
      memberId,
      loan_type,
      application,
      loan_amount,
      loanable_amount,
      interest,
      terms,
      balance,
      service_fee,
      status,
      remarks,
      disbursed_date,
      approval_date,
      completion_date
    } = data;

    await db.query(
      `UPDATE loan_applications SET
         client_voucher_number = ?,
         memberId               = ?,
         loan_type              = ?,
         application            = ?,
         loan_amount            = ?,
         loanable_amount        = ?,
         interest               = ?,
         terms                  = ?,
         balance                = ?,
         service_fee            = ?,
         status                 = ?,
         remarks                = ?,
         disbursed_date         = ?,
         approval_date          = ?,
         completion_date        = ?
       WHERE loan_application_id = ?`,
      [
        client_voucher_number, memberId, loan_type, application,
        loan_amount, loanable_amount, interest, terms,
        balance, service_fee, status, remarks,
        disbursed_date, approval_date, completion_date,
        id
      ]
    );
    return id;
  }

  static async deleteLoan(id) {
    await db.query(
      'DELETE FROM loan_applications WHERE loan_application_id = ?',
      [id]
    );
    return id;
  }
}

module.exports = LoanModel;
