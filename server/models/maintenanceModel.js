const db = require('../config/db');

// Function to add a maintenance record to the database
const addMaintenanceRecord = (month, memberCode, name, service, dividend) => {
    const sql = 'INSERT INTO file_maintenance (month, memberCode, name, service, dividend) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        // Ensure the order of variables in the array matches the SQL query placeholders
        db.query(sql, [month, memberCode, name, service, dividend], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to retrieve all maintenance records from the database
const getData = async () => {
    const query = 'SELECT * FROM file_maintenance';
  
    try {
      const [result] = await db.execute(query);
      return result; 
    } catch (error) {
      console.error('Error fetching maintenance records from database:', error.message);
      throw new Error('Error fetching maintenance records from the database');
    }
};

module.exports = {
    addMaintenanceRecord,
    getData
};
