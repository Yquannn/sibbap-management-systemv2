// installments.model.js
const pool = require("../config/db");
// const { v4: uuidv4 } = require("uuid");


exports.getInstallmentsWithRepayments = async (installment_id) => {
  const query = `
    SELECT 
      i.installment_id,
      i.loan_application_id,
      i.installment_number,
      i.amortization,
      i.status AS installment_status,
      r.repayment_id,
      r.amount_paid,
      r.transaction_number,
      r.payment_date,
      r.method
    FROM installments i
    LEFT JOIN repayments r 
      ON i.installment_id = r.installment_id
    WHERE i.installment_id = ?
    ORDER BY i.installment_number, r.payment_date
  `;
  const [rows] = await pool.execute(query, [installment_id]);
  return rows;
};

function generateTransactionNumber() {
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${timestamp}-${randomNum}`;
  }

  exports.addRepayment = async (installment_id, amount_paid, method, status = "Paid", transaction_type = "Repayment", authorized) => {
    try {
      // Generate a unique transaction number.
      const transactionNumber = generateTransactionNumber();
  
      // Insert a new repayment record including the unique transaction number.
      const insertQuery = `
        INSERT INTO repayments (transaction_number, installment_id, amount_paid, payment_date, method, transaction_type, authorized)
        VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
      `;
      const [result] = await pool.execute(insertQuery, [
        transactionNumber,
        installment_id,
        amount_paid,
        method,
        transaction_type,
        authorized,
      ]);
      const repaymentId = result.insertId;
  
      // Update the installment record: set repayment_id, paid_date, and status.
      const updateQuery = `
        UPDATE installments
        SET repayment_id = ?, paid_date = CURDATE(), status = ?
        WHERE installment_id = ?
      `;
      await pool.execute(updateQuery, [repaymentId, status, installment_id]);
  
      // Retrieve the loan_application_id from the installment record.
      const [rows] = await pool.execute(
        "SELECT loan_application_id FROM installments WHERE installment_id = ?",
        [installment_id]
      );
      if (rows.length > 0) {
        const loan_application_id = rows[0].loan_application_id;
  
        // Update the loan's balance and automatically update the loan_status.
        const updateLoanQuery = `
          UPDATE loan_applications
          SET 
            balance = (@newBalance := balance - ?),
            loan_status = IF(@newBalance <= 0, 'Paid Off', loan_status)
          WHERE loan_application_id = ?
        `;
        await pool.execute(updateLoanQuery, [amount_paid, loan_application_id]);
  
        // Retrieve updated balance, original loan_amount, and memberId.
        const [loanRows] = await pool.execute(
          "SELECT balance, loan_amount, memberId FROM loan_applications WHERE loan_application_id = ?",
          [loan_application_id]
        );
        if (loanRows.length > 0) {
          const { balance, loan_amount, memberId } = loanRows[0];
          // If the remaining balance equals half (or less) of the original loan amount, update is_borrower to 0.
          if (Number(balance) <= Number(loan_amount) / 2) {
            await pool.execute("UPDATE members SET is_borrower = 0 WHERE memberId = ?", [memberId]);
            console.log(`is_borrower updated to 0 for member with ID ${memberId} because balance is half of the loan amount.`);
          }
        }
      }
  
      return { repaymentId, status, transactionNumber };
    } catch (error) {
      console.error("Error in addRepayment:", error);
      throw error;
    }
  };
  