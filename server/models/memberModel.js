const db = require('../config/db'); // Import your DB configuration

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

    // Now, update the accountStatus, email (set to memberCode), and password (set to a default password)
    const [result] = await db.query(
      'UPDATE member_account SET accountStatus = ?, email = ?, password = ? WHERE memberId = ?',
      ['ACTIVATED', memberCode, memberCode, memberId]  // Default password set as an example
    );

    return result; // Return the result to check if the update was successful
  } catch (error) {
    throw error; // Throw the error to be handled in the controller
  }
};


exports.getMemberByEmail = async (email) => {
  try {
    // Fetch member details along with savings and deposits
    const [members] = await db.query(
      `SELECT 
        ma.*, 
        m.*, 
        s.savingsId AS regular_savings_id,
        s.amount AS savingsAmount,
        s.earnings AS totalEarnings,
        l.amount AS timeDepositAmount
      FROM member_account ma
      JOIN members m ON ma.memberId = m.memberId
      LEFT JOIN regular_savings s ON ma.memberId = s.memberId
      LEFT JOIN time_deposit l ON ma.memberId = l.memberId
      WHERE ma.email = ?`,
      [email]
    );

    if (members.length === 0) return null;

    const memberData = members[0];

    // Ensure the member has a savings account before fetching transactions
    if (!memberData.regular_savings_id) {
      console.log("No savings account found for this member.");
      return { ...memberData, transactions: [] };
    }

    // Fetch all transactions for the member's savings account
    const [transactions] = await db.query(
      `SELECT * FROM regular_savings_transaction WHERE regular_savings_id = ?`,
      [memberData.regular_savings_id]
    );
  
    return {
      ...memberData,
      transactions, // Attach all transactions related to the savings account
    };
  } catch (error) {
    console.error("Error fetching member by email:", error.message);
    throw new Error("Error fetching member");
  }
};
