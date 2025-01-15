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
      ['Active', memberCode, memberCode, memberId]  // Default password set as an example
    );

    return result; // Return the result to check if the update was successful
  } catch (error) {
    throw error; // Throw the error to be handled in the controller
  }
};
