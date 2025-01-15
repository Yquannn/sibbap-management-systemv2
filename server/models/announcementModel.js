const db = require('../config/db');  // Ensure you have the correct path to the db config

// Function to insert the announcement into the database
exports.addAnnouncement = async (title, content, targetAudience, status) => {
  try {
    // Perform the database insert query
    const [result] = await db.execute(
      `INSERT INTO announcements (title, content, targetAudience, status)
       VALUES (?, ?, ?, ?)`,
      [title, content, targetAudience, status]
    );

    // Check if the insertion was successful and return the ID of the inserted announcement
    if (result.affectedRows > 0) {
      return {
        message: 'Announcement added successfully',
        announcementId: result.insertId,  // The ID of the inserted announcement
      };
    } else {
      throw new Error('Failed to insert announcement');
    }
  } catch (error) {
    console.error('Error inserting announcement:', error.message);
    throw new Error('Error inserting announcement into the database');
  }
};

// Function to update an existing announcement in the database
exports.updateAnnouncement = async (announcementId, title, content, targetAudience, status) => {
  if (!announcementId) {
    throw new Error('Announcement ID is required');
  }

  try {
    // Perform the database update query
    const [result] = await db.execute(
      `UPDATE announcements 
       SET title = ?, content = ?, targetAudience = ?, status = ? 
       WHERE announcementId = ?`,
      [title, content, targetAudience, status, announcementId]
    );

    // Check if the update was successful
    if (result.affectedRows > 0) {
      return {
        message: 'Announcement updated successfully',
      };
    } else {
      throw new Error('No announcement found with the given ID');
    }
  } catch (error) {
    console.error('Error updating announcement:', error.message);
    throw new Error('Error updating announcement in the database');
  }
};

// Function to fetch all announcements
exports.getAnnouncement = async () => {
  const query = 'SELECT * FROM announcements';

  try {
    const [result] = await db.execute(query);
    return result; // Return all announcements
  } catch (error) {
    console.error('Error fetching announcements from database:', error.message);
    throw new Error('Error fetching announcements from the database');
  }
};
