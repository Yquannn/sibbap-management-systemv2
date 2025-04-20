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

  const initial_shared_capital = share_capital;

  try {
    await connection.beginTransaction();

    let memberCode = null;
    let memberType = null;
    if (share_capital !== null) {
      const memberInfo = await generateUniqueMemberCode(share_capital);
      memberCode = memberInfo.memberCode;
      memberType = memberInfo.memberType;
    }

    const updateFields = [];
    const updateValues = [];
    const addFieldIfNotNull = (field, value) => {
      if (value !== null) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    };

    addFieldIfNotNull('share_capital', share_capital);
    addFieldIfNotNull('initial_shared_capital', initial_shared_capital);
    addFieldIfNotNull('identification_card_fee', identification_card_fee);
    addFieldIfNotNull('membership_fee', membership_fee);
    addFieldIfNotNull('kalinga_fund_fee', kalinga_fund_fee);
    addFieldIfNotNull('initial_savings', initial_savings);

    if (memberCode !== null) {
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
      const [result] = await connection.execute(sql, updateValues);
      if (result.affectedRows === 0) {
        throw new Error("No rows updated. Check that the memberId exists.");
      }
    }

    if (memberCode) {
      const defaultEmail = email || memberCode;
      const defaultPassword = password || memberCode;
      const accountStatus = "NOT ACTIVATED";

      const accountSql = `
        INSERT INTO member_account (memberId, email, password, accountStatus)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          password = VALUES(password),
          accountStatus = VALUES(accountStatus)
      `;
      await connection.execute(accountSql, [
        memberId, defaultEmail, defaultPassword, accountStatus
      ]);
    }

    if (initial_savings !== null && initial_savings > 0) {
      // ... your existing savings logic ...
    }

    await connection.commit();

    // **Return the generated memberCode (and type)**
    return {
      success: true,
      message: "Membership Successfully Updated.",
      memberCode,
      memberType
    };
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
