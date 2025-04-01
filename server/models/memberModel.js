// models/memberModel.js

const db = require('../config/db'); // Import your DB configuration
const { generateUniqueMemberCode } = require('../utils/databaseHelper'); // Import the helper

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
    email,    // optional field
    password  // optional field
  } = financialData;

  // Ensure no financial fields are null or undefined.
  if (
    share_capital == null ||
    identification_card_fee == null ||
    membership_fee == null ||
    kalinga_fund_fee == null ||
    initial_savings == null
  ) {
    throw new Error("All financial data fields must be provided and cannot be null.");
  }

  // Fix: Set the initial_shared_capital equal to share_capital
  const initial_shared_capital = share_capital;

  console.log(
    "INPUT VALUES BEFORE QUERY EXECUTION:",
    { share_capital, initial_shared_capital, identification_card_fee, membership_fee, kalinga_fund_fee, initial_savings },
    "MEMBER ID:",
    memberId
  );

  try {
    await connection.beginTransaction();

    // Determine member type and prefix based on share_capital
    let memberType, codePrefix;
    if (share_capital < 6000) {
      memberType = "Partial Member";
      codePrefix = "PM-";
    } else {
      memberType = "Regular Member";
      codePrefix = "RM-";
    }

    // Generate a unique member code suffix using the helper and prepend the prefix if needed
    const uniqueSuffix = await generateUniqueMemberCode();
    const memberCode = uniqueSuffix; // Alternatively, you might want: codePrefix + uniqueSuffix

    // Update the members table with financials, memberCode, and member type
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

    console.log("ROWS AFFECTED BY QUERY:", result.affectedRows);
    if (result.affectedRows === 0) {
      throw new Error("No rows updated. Check that the memberId exists.");
    }

    // Set default email and password to memberCode if not provided
    const defaultEmail = email ? email : memberCode;
    const defaultPassword = password ? password : memberCode;
    const accountStatus = "NOT ACTIVATED";

    // Insert or update the member_account record
    // Using ON DUPLICATE KEY UPDATE to handle cases where the account already exists
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

    // If the initial savings amount is greater than zero, create a regular savings record
    if (initial_savings > 0) {
      // Generate a unique account number for the regular savings account
      const accountNumber = await generateUniqueAccountNumber();
      const savingsQuery = `
        INSERT INTO regular_savings (memberId, account_number, amount)
        VALUES (?, ?, ?)
      `;
      await connection.execute(savingsQuery, [memberId, accountNumber, initial_savings]);
    }

    await connection.commit();

    return { success: true, message: "Membership Successfully updated." };

  } catch (err) {
    await connection.rollback();
    console.error("Simplified transaction error:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};
