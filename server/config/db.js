const mysql = require('mysql2/promise'); // Import mysql2 with promise support

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sibbap_management_system',
  connectionLimit: 10 // You can adjust this limit as needed
});

// Optionally test the connection pool
db.getConnection()
  .then(connection => {
    console.log('Connected to the MySQL database.');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

module.exports = db; // Export the pool for use in other files
