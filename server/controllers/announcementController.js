const { addAnnouncement, updateAnnouncement, getAnnouncement } = require('../models/announcementModel');

// Function to insert an announcement
exports.insertAnnouncement = async (req, res) => {
  const { title, content, targetAudience, status } = req.body;

  try {
    // Call the model function to insert the announcement
    const { announcementId } = await addAnnouncement(title, content, targetAudience, status);

    res.status(201).json({
      message: 'Announcement added successfully',
      announcementId: announcementId, // Send the announcement ID
    });
  } catch (error) {
    console.error('Error adding announcement:', error.message);
    
    if (error.message.includes('Database connection was refused')) {
      res.status(503).json({ message: 'Database is unavailable, please try again later.' });
    } else {
      res.status(500).json({ message: 'Error adding announcement to the database' });
    }
  }
};

// Function to update an existing announcement
exports.updateAnnouncement = async (req, res) => {
  const { announcementId, title, content, targetAudience, status } = req.body;

  if (!announcementId) {
    return res.status(400).json({ message: 'Announcement ID is required' });
  }

  try {
    // Call the model function to update the announcement
    const result = await updateAnnouncement(announcementId, title, content, targetAudience, status);

    res.status(200).json({
      message: 'Announcement updated successfully',
    });
  } catch (error) {
    console.error('Error updating announcement:', error.message);

    if (error.message.includes('No announcement found')) {
      res.status(404).json({ message: 'Announcement not found' });
    } else {
      res.status(500).json({ message: 'Error updating announcement in the database' });
    }
  }
};

// Function to get all announcements
exports.getAllAnnouncement = async (req, res) => {
  try {
    // Retrieve all announcements from the model
    const announcements = await getAnnouncement();

    if (announcements.length === 0) {
      return res.status(404).json({ message: 'No announcements found' });
    }

    // Send success response with the list of announcements
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error.message);
    res.status(500).json({ message: 'Error fetching announcements from the database' });
  }
};
