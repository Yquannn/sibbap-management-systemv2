// models/memberModel.js

const db = require('../config/db'); // Import your DB configuration
const { generateUniqueMemberCode } = require('../utils/databaseHelper'); // Import the helper
const { generateTransactionNumber } = require('../utils/generateTransactionNumber'); // Import the transaction number generator
exports.activateAccount = async (memberId) => {
  try {
    // Fetch memberCode using the memberId
    const [memberResult] = await db.query(
      'SELECT memberCode FROM members WHERE memberId = ?',
      [memberId]
    );

    // If member doesn't exist, return null to indicate member not found
    if (memberResult.length === 0) {
      return null;
    }

    const memberCode = memberResult[0].memberCode; // Get the memberCode

    // Update the member_account table with default credentials using the memberCode
    const [result] = await db.query(
      'UPDATE member_account SET accountStatus = ?, email = ?, password = ? WHERE memberId = ?',
      ['ACTIVATED', memberCode, memberCode, memberId]
    );

    return result;
  } catch (error) {
    throw error;
  }
};

exports.getMemberByEmail = async (email) => {
  try {
    const [members] = await db.query(
      `SELECT 
        ma.*, 
        m.*, 
        s.savingsId AS regular_savings_id,
        s.amount AS savingsAmount,
        s.earnings AS totalEarnings,
        s.account_number,
        l.amount AS timeDepositAmount
      FROM member_account ma
      JOIN members m ON ma.memberId = m.memberId
      LEFT JOIN regular_savings s ON ma.memberId = s.memberId
      LEFT JOIN time_deposit l ON ma.memberId = l.memberId
      WHERE ma.email = ?`,
      [email]
    );

    if (members.length === 0) {
      console.log("No member found with that email.");
      return null;
    }

    const memberData = members[0];

    if (!memberData.regular_savings_id) {
      console.log("No savings account found for this member.");
      return { ...memberData, transactions: [] };
    }

    const [transactions] = await db.query(
      `SELECT * FROM regular_savings_transaction WHERE regular_savings_id = ?`,
      [memberData.regular_savings_id]
    );
  
    return {
      ...memberData,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching member by email:", error.message);
    throw new Error("Error fetching member data from the database.");
  }
};



// Generate a unique regular savings account number.
const generateUniqueAccountNumber = async () => {
  // For example, prefix "RS", then use the last 8 digits of Date.now()
  // and two random digits (zero-padded) to increase uniqueness.
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${timestampPart}${randomPart}`;
};


exports.updateMemberFinancials = async (memberId, financialData) => {
  const connection = await db.getConnection();

  const {
    share_capital,
    identification_card_fee,
    membership_fee,
    kalinga_fund_fee,
    initial_savings,
    email,
    password
  } = financialData;

  if (
    share_capital == null ||
    identification_card_fee == null ||
    membership_fee == null ||
    kalinga_fund_fee == null ||
    initial_savings == null
  ) {
    throw new Error("All financial data fields must be provided and cannot be null.");
  }

  const initial_shared_capital = share_capital;

  try {
    await connection.beginTransaction();

    // Generate memberCode and memberType using share_capital
    const { memberCode, memberType } = await generateUniqueMemberCode(share_capital);

    const updateQuery = `
      UPDATE members SET
        share_capital = ?,
        initial_shared_capital = ?,
        identification_card_fee = ?,
        membership_fee = ?,
        kalinga_fund_fee = ?,
        initial_savings = ?,
        memberCode = ?,
        member_type = ?,
        status = 'Active'
      WHERE memberId = ?
    `;
    const [result] = await connection.execute(updateQuery, [
      share_capital,
      initial_shared_capital,
      identification_card_fee,
      membership_fee,
      kalinga_fund_fee,
      initial_savings,
      memberCode,
      memberType,
      memberId
    ]);

    if (result.affectedRows === 0) {
      throw new Error("No rows updated. Check that the memberId exists.");
    }

    const defaultEmail = email || memberCode;
    const defaultPassword = password || memberCode;
    const accountStatus = "NOT ACTIVATED";

    const accountQuery = `
      INSERT INTO member_account (memberId, email, password, accountStatus)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        email = VALUES(email), 
        password = VALUES(password), 
        accountStatus = VALUES(accountStatus)
    `;
    await connection.execute(accountQuery, [
      memberId,
      defaultEmail,
      defaultPassword,
      accountStatus
    ]);

    // Only add savings and a transaction record if initial_savings > 0
    if (initial_savings > 0) {
      // Insert into regular_savings table
      const accountNumber = await generateUniqueAccountNumber();
      const savingsQuery = `
        INSERT INTO regular_savings (memberId, account_number, amount)
        VALUES (?, ?, ?)
      `;
      await connection.execute(savingsQuery, [memberId, accountNumber, initial_savings]);

      // ------------------ Add Regular Transaction History Entry ------------------
      // Generate a unique transaction number (ensure you implement this function)
      const transactionNumber = await generateTransactionNumber();
      // Set authorized user type (adjust or pass this value as needed)
      const authorizedUserType = "System";
      // Define transaction type (e.g., "Initial Savings Deposit")
      const transactionType = "Initial Savings Deposit";
      // Use initial_savings as the transaction amount (adjust if needed)
      const transactionAmount = initial_savings;
      // Use current date/time
      const transactionDateTime = new Date();

      // Retrieve the corresponding savingsId for the member from the regular_savings table
      // Ordering by savingsId DESC ensures you get the most recent record if multiple exist
      const getSavingsIdQuery = `
        SELECT savingsId 
        FROM regular_savings 
        WHERE memberId = ?
        ORDER BY savingsId DESC
        LIMIT 1
      `;
      const [rows] = await connection.execute(getSavingsIdQuery, [memberId]);

      if (rows.length === 0) {
        throw new Error('No regular savings record found for this member');
      }

      const savingsId = rows[0].savingsId;

      // Now, insert the transaction record using the valid savingsId
      const transactionQuery = `
        INSERT INTO regular_savings_transaction 
          (transaction_number, authorized, transaction_type, amount, transaction_date_time, regular_savings_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(transactionQuery, [
        transactionNumber,
        authorizedUserType,
        transactionType,
        transactionAmount,
        transactionDateTime,
        savingsId
      ]);
      // ---------------------------------------------------------------------------
    }

    await connection.commit();

    return { success: true, message: "Membership Successfully." };

  } catch (err) {
    await connection.rollback();
    console.error("Transaction error:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};




// In memberModel.js
exports.addPurchaseHistory = async (memberId, service, amount) => {
  const sql = `
    INSERT INTO purchase_history (memberId, service, amount, purchase_date)
    VALUES (?, ?, ?, NOW())
  `;
  const [result] = await db.execute(sql, [memberId, service, amount]);
  return result;
};
