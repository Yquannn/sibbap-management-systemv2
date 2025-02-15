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
    const [member] = await db.query(`
      SELECT 
        ma.*, 
        m.*, 
        s.amount AS savingsAmount  -- Get the savings amount
      FROM member_account ma
      JOIN members m ON ma.memberId = m.memberId
      LEFT JOIN regular_savings s ON ma.memberId = s.memberId  -- Join saving table
      WHERE ma.email = ?
    `, [email]);

    return member.length > 0 ? member[0] : null;  
  } catch (error) {
    console.error('Error fetching member by email:', error.message);
    throw new Error('Error fetching member');
  }
};
