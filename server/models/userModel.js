const db = require('../config/db'); 

const insertUser = async (userName, age, gender, address, contactNo, email, hashedPassword, userType) => {
  const query = 'INSERT INTO users (userName, age, gender, address, contactNo, email, password, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  try {
    // First, check if the email already exists in the database
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const [existingUser] = await db.execute(checkQuery, [email]);

    if (existingUser.length > 0) {
      // If email already exists, throw an error
      throw new Error('User already exists with this email.');
    }

    // If email does not exist, proceed to insert the new user
    const [result] = await db.execute(query, [userName, age, gender, address, contactNo, email, hashedPassword, userType]);
    
    // Return the ID of the newly inserted user
    return result.insertId;
  } catch (error) {
    // Log the full error object for debugging
    console.error('Error inserting user:', error);
    
    // Handle specific MySQL errors or connection issues
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection was refused. Please ensure the database is running.');
    } else if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) {
      // Handle specific duplicate entry for email
      throw new Error('User already exists with this email.');
    } else {
      throw new Error('Error executing database query: ' + error.message);
    }
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { userName, age, gender, address, contactNo, email, userType } = req.body;

  if (!userName || !age || !gender || !address || !contactNo || !email || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const success = await updateUserById(id, { userName, age, gender, address, contactNo, email, userType });
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Error updating user' });
  }
};


const getAllUsers = async () => {
  const query = 'SELECT * FROM users';

  try {
    const [result] = await db.execute(query);

    return result; // Return all users
  } catch (error) {
    console.error('Error fetching users from database:', error.message);
    throw new Error('Error fetching users from the database');
  }
};

const updateUserById = async (id, userData) => {
  const connection = await db.getConnection();
  try {
    const query = `
      UPDATE users
      SET userName = ?, age = ?, gender = ?, address = ?, contactNo = ?, email = ?, userType = ?
      WHERE id = ?
    `;
    const [result] = await connection.execute(query, [
      userData.userName,
      userData.age,
      userData.gender,
      userData.address,
      userData.contactNo,
      userData.email,
      userData.userType,
      id,
    ]);
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
};


module.exports = { getAllUsers, insertUser, updateUserById };
