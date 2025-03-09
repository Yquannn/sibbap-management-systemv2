const db = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcrypt for password comparison

// Function to find a member by email and check password
exports.findByEmail = async (email, password) => {
    // Find the member by email (no domain restrictions)
    const [rows] = await db.execute('SELECT * FROM member_account WHERE email = ?', [email]);

    // If the member is not found, return null
    if (!rows[0]) {
        return null;
    }

    const member = rows[0]; // The found member

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, member.password);

    return isMatch ? member : null; // Return member if password matches, otherwise null
};
