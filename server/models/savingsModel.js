const db = require('../config/db');
const { generateTransactionNumber } = require('../utils/generateTransactionNumber')

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

const updateSavingsAmount = async (memberId, amount, transactionType) => {
  let conn;
  const transactionNumber = generateTransactionNumber(); // Generate the transaction number

  try {
    // Ensure the amount is valid
    if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    // Fetch the current savings balance to calculate the new amount
    const savings = await findSavingsByMemberId(memberId);
    if (!savings) {
      throw new Error('Savings record not found for the member');
    }

    let newAmount;
    if (transactionType === 'Deposit') {
      // Add deposit amount to current balance
      newAmount = parseFloat(savings.amount) + parseFloat(amount);
    } else if (transactionType === 'Withdrawal') {
      // Ensure sufficient funds for withdrawal
      if (parseFloat(savings.amount) < amount) {
        throw new Error('Insufficient funds for withdrawal');
      }
      // Subtract amount for withdrawal
      newAmount = parseFloat(savings.amount) - parseFloat(amount);
    } else {
      throw new Error('Invalid transaction type');
    }

    // Ensure newAmount is a valid number and round to two decimal places
    newAmount = parseFloat(newAmount).toFixed(2);
    if (isNaN(newAmount)) {
      throw new Error('Invalid new amount calculated');
    }

    console.log(`New amount calculated for memberId=${memberId}: ${newAmount}`);

    // Start a database transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update the savings balance
    const queryUpdate = 'UPDATE regular_savings SET amount = ? WHERE memberId = ?';
    const [updateResult] = await conn.execute(queryUpdate, [newAmount, memberId]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Failed to update savings amount');
    }

    // Step 2: Insert a new transaction history record
    const amountToStore = transactionType === 'Withdrawal' ? -Math.abs(amount) : Math.abs(amount);

    const queryInsertTransaction = `
      INSERT INTO regular_savings_transaction 
      (regular_savings_id, transaction_number, transaction_type, amount, transaction_date_time)
      VALUES (
        (SELECT savingsId FROM regular_savings WHERE memberId = ? LIMIT 1),
        ?, ?, ?, NOW()
      )
    `;
    const values = [memberId, transactionNumber, transactionType, amountToStore];
    const [insertResult] = await conn.execute(queryInsertTransaction, values);

    if (insertResult.affectedRows === 0) {
      throw new Error('Failed to record transaction');
    }

    // Commit the transaction if both steps succeed
    await conn.commit();

    return { success: true, message: 'Savings amount updated and transaction recorded' };
  } catch (error) {
    if (conn) await conn.rollback(); // Rollback in case of error
    console.error('Error updating savings amount and transaction:', error.message);
    throw error; // Throw error to be handled by the caller
  } finally {
    if (conn) conn.release(); // Release DB connection
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

// setInterval(applyInterest, 5000);




async function applyInterest() {
  let connection;

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

    // Loop over eligible accounts
    for (const account of accounts) {
      // Generate a new transaction number for each account
      const transactionNumber = generateTransactionNumber(); // Generate a new transaction number per iteration
      console.log(`Generated transaction number: ${transactionNumber}`);

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
          (regular_savings_id, transaction_number, transaction_type, amount, transaction_date_time) 
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
// }, 10000); // 50 seconds




async function createTransaction(transactionData) {
  let conn;

  try {
    if (
      !transactionData.regular_savings_id ||
      !transactionData.transaction_type ||
      transactionData.amount === undefined
    ) {
      throw new Error("All fields are required");
    }

    conn = await db.getConnection();
    await conn.beginTransaction(); // Start transaction

    // Generate unique transaction number
    const transactionNumber = generateTransactionNumber();

    const query = `
      INSERT INTO regular_savings_transaction 
      (regular_savings_id, transaction_number, transaction_type, amount, transaction_date_time)
      VALUES (?, ?, ?, ?, NOW())  -- Use NOW() for current timestamp
    `;

    const values = [
      transactionData.regular_savings_id,
      transactionNumber,
      transactionData.transaction_type,
      transactionData.amount
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



async function getRegularSavingsMemberInfoById(memberId) {
  try {
    const query = `
      SELECT m.*, rs.* 
      FROM members AS m
      INNER JOIN regular_savings AS rs ON m.memberId = rs.memberId
      WHERE m.memberId = ?`;
      
    const [rows] = await db.query(query, [memberId]);
    return rows[0]; // Returns the first matching record (or undefined if not found)
  } catch (error) {
    console.error("Error fetching member info:", error);
    throw error;
  }
}




module.exports = {
  findSavingsByMemberId,
  updateSavingsAmount,
  getEarnings,
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getRegularSavingsMemberInfoById,
};
