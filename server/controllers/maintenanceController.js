const MaintenanceModel = require('../models/maintenanceModel');

exports.addMaintenance = async (req, res) => {
    const { month, memberCode, service } = req.body;
    const records = req.body.data; // Parsed Excel data

    try {
        records.forEach(async record => {
            // if (!month || !service || !record.memberCode || !record.name || !record.dividend) {
            //     throw new Error('All fields must be filled');
            // }
            await MaintenanceModel.addMaintenanceRecord(month, memberCode, record.name, service, record.dividend);
        });
        console.log('Maintenance data added successfully');
        res.send({ message: 'Maintenance data added successfully' });
    } catch (error) {
        console.error('Error adding maintenance record:', error);
        res.status(500).send({ message: 'Failed to add maintenance data' });
    }
};

exports.getAllData = async (req, res) => {
    try {
  
      const users = await MaintenanceModel.getData();
  
      if (users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      // Send success response with the list of users
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ message: 'Error fetching users from the database' });
    }
  };