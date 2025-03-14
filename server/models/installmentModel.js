// installments.model.js
const pool = require("../config/db");
// const { v4: uuidv4 } = require("uuid");


// Get installments with the sum of repayments for a given loan application
exports.getInstallmentsWithRepayments = async (loan_application_id) => {
  const query = `
    SELECT 
      i.*,
      IFNULL(SUM(r.amount_paid), 0) AS amount_repaid
    FROM installments i
    LEFT JOIN repayments r ON i.installment_id = r.installment_id
    WHERE i.loan_application_id = ?
    GROUP BY i.installment_id
    ORDER BY i.installment_number
  `;
  const [rows] = await pool.execute(query, [loan_application_id]);
  return rows;
};

function generateTransactionNumber() {
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${timestamp}-${randomNum}`;
  }
  

exports.addRepayment = async (installment_id, amount_paid, method, status = "Paid") => {
  try {
    // Generate a unique transaction number using uuid.
    const transactionNumber = generateTransactionNumber()

    // Insert a new repayment record including the unique transaction_number.
    const insertQuery = `
      INSERT INTO repayments (transaction_number, installment_id, amount_paid, payment_date, method)
      VALUES (?, ?, ?, CURDATE(), ?)
    `;
    const [result] = await pool.execute(insertQuery, [transactionNumber, installment_id, amount_paid, method]);
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

      // Update the loan's balance and automatically update the loan_status using a user variable.
      const updateLoanQuery = `
        UPDATE loan_applications
        SET 
          balance = (@newBalance := balance - ?),
          loan_status = IF(@newBalance <= 0, 'Paid Off', loan_status)
        WHERE loan_application_id = ?
      `;
      await pool.execute(updateLoanQuery, [amount_paid, amount_paid, loan_application_id]);
    }

    return { repaymentId, status, transactionNumber };
  } catch (error) {
    console.error("Error in addRepayment:", error);
    throw error;
  }
};
