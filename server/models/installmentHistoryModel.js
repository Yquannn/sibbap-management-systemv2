// models/installmentModel.js
const db = require('../config/db');

class InstallmentModel {
  static async bulkCreateInstallments(list) {
    const placeholders = list.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = list.flatMap(inst => [
      inst.loan_application_id,
      inst.installment_number,
      inst.beginning_balance,
      inst.amortization,
      inst.principal,
      inst.interest,
      inst.savings_deposit,
      inst.penalty,
      inst.ending_balance,
      inst.due_date
    ]);

    await db.query(
      `INSERT INTO installments
         (loan_application_id, installment_number, beginning_balance,
          amortization, principal, interest, savings_deposit,
          penalty, ending_balance, due_date)
       VALUES ${placeholders}`,
      values
    );
  }

  static async getInstallmentsByLoanId(loanId) {
    const [rows] = await db.query(
      'SELECT * FROM installments WHERE loan_application_id = ? ORDER BY installment_number',
      [loanId]
    );
    return rows;
  }
}

module.exports = InstallmentModel;
