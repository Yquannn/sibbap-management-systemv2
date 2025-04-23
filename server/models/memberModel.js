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
      'UPDATE member_account SET accountStatus = ? WHERE memberId = ?',
      ['ACTIVATED',  memberId]
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

  try {
    await connection.beginTransaction();

    // 1) Maybe generate a brand-new memberCode if share_capital was provided
    let memberCode = null;
    let memberType = null;
    if (share_capital !== null) {
      const memberInfo = await generateUniqueMemberCode(share_capital);
      memberCode = memberInfo.memberCode;
      memberType = memberInfo.memberType;
      // update the members table with that new code below…
    }

    // 2) Update the members table fields
    const updateFields = [];
    const updateValues = [];
    const addFieldIfNotNull = (field, value) => {
      if (value !== null) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    };
    addFieldIfNotNull('share_capital', share_capital);
    addFieldIfNotNull('initial_shared_capital', share_capital);
    addFieldIfNotNull('identification_card_fee', identification_card_fee);
    addFieldIfNotNull('membership_fee', membership_fee);
    addFieldIfNotNull('kalinga_fund_fee', kalinga_fund_fee);
    addFieldIfNotNull('initial_savings', initial_savings);

    if (memberCode) {
      addFieldIfNotNull('memberCode', memberCode);
      addFieldIfNotNull('member_type', memberType);
      addFieldIfNotNull('status', 'Active');
    }

    if (updateFields.length) {
      const sql = `
        UPDATE members SET
          ${updateFields.join(', ')}
        WHERE memberId = ?
      `;
      updateValues.push(memberId);
      const [res] = await connection.execute(sql, updateValues);
      if (res.affectedRows === 0) {
        throw new Error("No member found with that ID");
      }
    }

    // 3) Now figure out the FINAL memberCode in use:
    //    — if we just generated one, use that
    //    — otherwise pull the existing one from the DB
    let dbMemberCode = memberCode;
    if (!dbMemberCode) {
      const [rows] = await connection.execute(
        'SELECT memberCode FROM members WHERE memberId = ?',
        [memberId]
      );
      if (!rows.length || !rows[0].memberCode) {
        throw new Error("Unable to fetch memberCode for memberId " + memberId);
      }
      dbMemberCode = rows[0].memberCode;
    }

    // 4) Share-capital transactions (unchanged)
    if (share_capital !== null && share_capital > 0) {
      const ref = await generateTransactionNumber();
      await connection.execute(
        `INSERT INTO share_capital_transactions
          (memberCode, transaction_number, transaction_type, amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [dbMemberCode, ref, 'deposit', share_capital, 'Initial share capital']
      );
      await connection.execute(
        `INSERT INTO share_capital
          (memberId, memberCode, total_amount)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_amount = total_amount + VALUES(total_amount)`,
        [memberId, dbMemberCode, share_capital]
      );
    }

    // 5) Member account creation/upsert (unchanged)
    if (memberCode) {
      const accountSql = `
        INSERT INTO member_account
          (memberId, email, password, accountStatus)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          password = VALUES(password),
          accountStatus = VALUES(accountStatus)
      `;
      await connection.execute(accountSql, [
        memberId,
        email || dbMemberCode,
        password || dbMemberCode,
        'NOT ACTIVATED'
      ]);
    }

    if (initial_savings !== null && initial_savings > 0) {
      // 1) Generate a unique savings-account number
      const accountNumber = await generateUniqueAccountNumber();
    
      // 2) Upsert into regular_savings (so we either create a new row or bump the total_amount)
      const [upsertResult] = await connection.execute(
        `INSERT INTO regular_savings
           (memberId, account_number, amount)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           amount = amount + VALUES(amount)`,
        [memberId, accountNumber, initial_savings]
      );
    
      // 3) Figure out the savingsId of the row we just touched
      let savingsId;
      if (upsertResult.insertId && upsertResult.insertId > 0) {
        // we just inserted a brand-new row
        savingsId = upsertResult.insertId;
      } else {
        // we updated an existing row—lookup its PK
        const [rows] = await connection.execute(
          `SELECT savingsId
             FROM regular_savings
            WHERE memberId = ?
            ORDER BY updated_at DESC
            LIMIT 1`,
          [memberId]
        );
        if (!rows.length) throw new Error("Could not retrieve savingsId for member");
        savingsId = rows[0].savingsId;
      }
    
      // 4) Insert the transaction history
      const transactionNumber   = await generateTransactionNumber();
      const authorizedUserType  = "System";
      const transactionType     = "Initial Savings Deposit";
      const transactionAmount   = initial_savings;
      const transactionDateTime = new Date();
    
      await connection.execute(
        `INSERT INTO regular_savings_transaction
           (transaction_number, authorized, transaction_type, amount, transaction_date_time, regular_savings_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transactionNumber,
          authorizedUserType,
          transactionType,
          transactionAmount,
          transactionDateTime,
          savingsId
        ]
      );
    }
    
    await connection.commit();
    return {
      success: true,
      message: "Membership successfully updated",
      memberCode: dbMemberCode,
      memberType
    };

  } catch (err) {
    if (connection && !connection.connection._closing) {
      await connection.rollback();
    }
    throw err;
  } finally {
    if (connection && !connection.connection._closing) {
      connection.release();
    }
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


