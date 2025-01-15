const totalMember = require('../models/dashboardModel.js');

const getTotalMembers = async (req, res) => {
  try {
    const results = await totalMember.getTotalMembers();

    if (!results || results.length === 0) {
      throw new Error('No data returned from the database');
    }

    const totalMembers = results[0].total_members || 0;
    res.json({ totalMembers });

    console.log(`Total Members fetched: ${totalMembers}`);
  } catch (error) {
    console.error('Error fetching total members from MySQL:', error.message);
    res.status(500).json({ message: 'Error fetching total members from MySQL' });
  }
};

module.exports = { getTotalMembers };
