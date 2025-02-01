const db = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcrypt for password comparison

// Function to find a member by email and check password
exports.findByEmail = async (email, password) => {
    // Find the member by email
    const [rows] = await db.execute('SELECT * FROM member_account WHERE email = ?', [email]);

    // If the member is not found, return null
    if (!rows[0]) {
        return null;
    }

    const member = rows[0]; // The found member

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, member.password);

    if (isMatch) {
        return member; // Return the member if the password is correct
    } else {
        return null; // Return null if the password doesn't match
    }
};
