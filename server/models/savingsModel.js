const db = require('../config/db');

/**
 * Find a savings record by memberId
 * @param {number} memberId - The ID of the member
 * @returns {object|null} - The savings record or null if not found
 */
const findSavingsByMemberId = async (memberId) => {
    if (!memberId) {
      throw new Error('Member ID is undefined or invalid');
    }
  
    const query = 'SELECT * FROM regular_savings WHERE memberId = ?';
  
    try {
      const [rows] = await db.execute(query, [memberId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching savings record:', error.message);
      throw new Error('Database query failed');
    }
  };
  

/**
 * Update the savings amount by memberId
 * @param {number} memberId - The ID of the member
 * @param {number} newAmount - The new amount to set
 * @returns {boolean} - True if the record was updated, false otherwise
 */
const updateSavingsAmount = async (memberId, newAmount) => {
    const query = 'UPDATE regular_savings SET amount = ? WHERE memberId = ?';
    try {
      const [result] = await db.execute(query, [newAmount, memberId]);
      return result.affectedRows > 0; // Return true if at least one row was updated
    } catch (error) {
      console.error('Error updating savings amount:', error.message);
      throw new Error('Database query failed');
    }
  };


  const getEarnings = async (memberId) => {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Fetch earnings for a specific member
      const query = 'SELECT earnings FROM regular_savings WHERE MemberId = ?';
      const [result] = await connection.query(query, [memberId]);
  
      if (result.length === 0) {
        console.warn(`No earnings found for MemberId: ${memberId}`);
        return 0;
      }
  
      return result[0].earnings; // Return the earnings amount
    } catch (error) {
      console.error('Failed to get earnings:', error.message);
      return 0;
    } finally {
      if (connection) connection.release();
    }
  };
  

/**
 * Create a new savings record
 * @param {number} memberId - The ID of the member
 * @param {number} [initialAmount=0] - The initial amount for the savings record
 * @returns {number} - The ID of the newly created record
 */


// async function applyInterest() {
//   let connection;
//   try {
//     connection = await db.getConnection();

//     // Update query using the correct interest rate calculation
//     const query = `
//       UPDATE regular_savings 
//       SET 
//         earnings = earnings + (amount * 0.005 / 365),  -- Daily interest added to earnings
//         amount = amount + (amount * 0.005 / 365)       -- Daily interest added to amount
//       WHERE amount >= 1000;
//     `;

//     const [result] = await connection.query(query);
//     console.log(`✅ Interest applied to ${result.affectedRows} accounts.`);
//   } catch (error) {
//     console.error('❌ Failed to apply interest:', error.message);
//   } finally {
//     if (connection) connection.release();
//   }
// }

// setInterval(applyInterest, 50000);



function generateTransactionNumber() {
  const timestamp = Date.now();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${timestamp}-${randomPart}`;
}


async function applyInterest() {
  let connection;
  const transactionNumber = generateTransactionNumber(); // Keep this constant

  try {
    connection = await db.getConnection();

    // Fetch eligible accounts
    const fetchQuery = `
      SELECT savingsId, amount, COALESCE(earnings, 0) AS earnings 
      FROM regular_savings 
      WHERE amount >= 1000;
    `;
    const [accounts] = await connection.query(fetchQuery);

    if (accounts.length === 0) {
      console.log("⚠️ No eligible accounts for interest.");
      return;
    }

    console.log(`🔍 Found ${accounts.length} eligible accounts.`);

    // Start transaction
    await connection.beginTransaction();

    const interestRate = 0.005 / 365; // Daily interest rate
    for (const account of accounts) {
      // Convert earnings and amount to numbers explicitly
      const currentAmount = parseFloat(account.amount);
      const currentEarnings = parseFloat(account.earnings);

      const interestAmount = parseFloat((currentAmount * interestRate).toFixed(2)); // Round to 2 decimal places
      const updatedEarnings = parseFloat((currentEarnings + interestAmount).toFixed(2));
      const newAmount = parseFloat((currentAmount + interestAmount).toFixed(2));

      // Update savings account
      const updateQuery = `
        UPDATE regular_savings 
        SET earnings = ?, amount = ? 
        WHERE savingsId = ?;
      `;
      const [updateResult] = await connection.query(updateQuery, [updatedEarnings, newAmount, account.savingsId]);

      if (updateResult.affectedRows === 0) {
        throw new Error(`❌ Update failed for savingsId ${account.savingsId}`);
      }

      console.log(`✅ Updated savingsId ${account.savingsId}`);

      // Insert into transaction history
      const insertQuery = `
        INSERT INTO regular_savings_transaction 
          (regular_savings_id, transaction_number, transaction_type, interest_amount, transaction_date_time) 
        VALUES (?, ?, 'Savings Interest', ?, NOW());
      `;
      const [insertResult] = await connection.query(insertQuery, [account.savingsId, transactionNumber, interestAmount]);

      if (insertResult.affectedRows === 0) {
        throw new Error(`❌ Insert failed for savingsId ${account.savingsId}`);
      }

      console.log(`📌 Transaction recorded for savingsId ${account.savingsId}`);
    }

    // Commit transaction
    await connection.commit();
    console.log(`✅ Interest applied to ${accounts.length} accounts.`);
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Failed to apply interest:", error.message);
  } finally {
    if (connection) connection.release();
  }
}





function runDaily(applyInterest) {
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(24, 0, 0, 0); 

  const timeUntilNextRun = nextRun - now; // Time difference in milliseconds

  setTimeout(() => {
    applyInterest(); // Execute the function
      setInterval(applyInterest(), 24 * 60 * 60 * 1000); // Run every 24 hours
  }, timeUntilNextRun);
}

runDaily(() => console.log("Running daily task!"));

// setInterval(() => {
//   applyInterest();
// }, 5000); // 50 seconds




async function createTransaction(transactionData) {
  let conn;

  try {
    if (
      !transactionData.regular_savings_id ||
      !transactionData.transaction_type ||
      transactionData.interest_amount === undefined
    ) {
      throw new Error("All fields are required");
    }

    conn = await db.getConnection();
    await conn.beginTransaction(); // Start transaction

    // Generate unique transaction number
    const transactionNumber = generateTransactionNumber();

    const query = `
      INSERT INTO regular_savings_transaction 
      (regular_savings_id, transaction_number, transaction_type, interest_amount, transaction_date_time)
      VALUES (?, ?, ?, ?, NOW())  -- Use NOW() for current timestamp
    `;

    const values = [
      transactionData.regular_savings_id,
      transactionNumber,
      transactionData.transaction_type,
      transactionData.interest_amount
    ];

    const [result] = await conn.query(query, values);
    
    await conn.commit(); // Commit transaction



    return { success: true, transactionNumber, insertId: result.insertId }; // Return success response
  } catch (error) {
    if (conn) await conn.rollback(); // Rollback on error
    console.error("❌ Error inserting transaction:", error.message);
    throw error; // Throw error so it can be handled by the caller
  } finally {
    if (conn) conn.release(); // Release DB connection
  }
}


// Get all transactions
async function getAllTransactions() {
  const query = `SELECT * FROM regular_savings_transaction  ORDER BY transaction_date_time DESC`;
  const [rows] = await db.query(query);
  return rows;
}

// Get a transaction by ID
async function getTransactionById(transactionNumber) {
  const query = `SELECT * FROM regular_savings_transaction  WHERE transaction_number = ?`;
  const [rows] = await db.query(query, [transactionNumber]);
  return rows[0];
}


module.exports = {
  findSavingsByMemberId,
  updateSavingsAmount,
  getEarnings,
  createTransaction,
  getAllTransactions,
  getTransactionById
};
