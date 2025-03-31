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


exports.updateMemberFinancials = async (memberId, financialData) => {
  const connection = await db.getConnection();

  const {
    share_capital,
    identification_card_fee,
    membership_fee,
    kalinga_fund_fee,
    initial_savings
  } = financialData;

  console.log(
    "INPUT VALUES BEFORE QUERY EXECUTION:",
    financialData,
    "MEMBER ID:",
    memberId
  );

  try {
    await connection.beginTransaction();

    const query = `
      UPDATE members SET
        share_capital = ?,
        identification_card_fee = ?,
        membership_fee = ?,
        kalinga_fund_fee = ?,
        initial_savings = ?
      WHERE memberId = ?
    `;

    const [result] = await connection.execute(query, [
      share_capital,
      identification_card_fee,
      membership_fee,
      kalinga_fund_fee,
      initial_savings,
      memberId
    ]);

    console.log("ROWS AFFECTED BY QUERY:", result.affectedRows);

    if (result.affectedRows === 0) {
      throw new Error("No rows updated. Check that the memberId exists.");
    }

    await connection.commit();

    return { success: true, message: "Simplified update success." };

  } catch (err) {
    await connection.rollback();
    console.error("Simplified transaction error:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};