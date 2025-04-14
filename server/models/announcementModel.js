const db = require('../config/db');  // Ensure you have the correct path to the db config

exports.addAnnouncement = async (
  title,
  content,
  target_audience,  // Can be a single value or an array of values
  status,
  priority = 'Medium', // Default value is 'Medium', can be overridden
  category = 'General', // Default value is 'General', can be overridden
  authorized= null, // If not provided, null is used
  start_date = null, // If not provided, null is used
  end_date = null // If not provided, null is used
) => {
  const connection = await db.getConnection(); // Use a transaction-safe connection
  
  try {
    // If optional parameters are undefined, set them to null
    start_date = start_date || null; // If start_date is undefined or falsy, set to null
    end_date = end_date || null; // If end_date is undefined or falsy, set to null
    priority = priority || null; // If priority is undefined or falsy, set to null
    category = category || null; // If category is undefined or falsy, set to null
    
    await connection.beginTransaction();
    
    // Convert target_audience to string for database storage
    const storedTargetAudience = Array.isArray(target_audience) 
      ? target_audience.join(',') 
      : target_audience;
    
    // Insert into announcements
    const [announcementResult] = await connection.execute(
      `INSERT INTO announcements
        (title, content, target_audience, status, priority, category, authorized, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, storedTargetAudience, status, priority, category, authorized, start_date, end_date]
    );
    
    if (announcementResult.affectedRows === 0) {
      throw new Error('Failed to insert announcement');
    }
    
    const insertedAnnouncementId = announcementResult.insertId;
    
    // Prepare the notification message
    const message = `New announcement: "${title}"`;
    const isRead = 0;
    
    // Handle multiple target audiences or "All" option
    let targetUsers = [];
    
    // Convert target_audience to array if it's not already
    const audiences = Array.isArray(target_audience) ? target_audience : [target_audience];
    
    if (audiences.includes('All')) {
      // If "All" is included, fetch all users
      const [allUsers] = await connection.execute(`SELECT id FROM users`);
      targetUsers = allUsers;
    } else {
      // For each target audience, fetch the corresponding users
      for (const audience of audiences) {
        const [users] = await connection.execute(
          `SELECT id FROM users WHERE userType = ?`,
          [audience]
        );
        
        // Add these users to our target list
        targetUsers = [...targetUsers, ...users];
      }
    }
    
    if (targetUsers.length === 0) {
      throw new Error(`No users found for the specified target audience(s)`);
    }
    
    // Create a Set to ensure we don't add duplicate notifications for the same user
    const processedUserIds = new Set();
    
    // Insert notifications for each relevant user
    for (let user of targetUsers) {
      // Skip if we've already processed this user
      if (processedUserIds.has(user.id)) continue;
      
      await connection.execute(
        `INSERT INTO notifications
          (announcement_id, userId, message, isRead, category)
         VALUES (?, ?, ?, ?, ?)`,
        [insertedAnnouncementId, user.id, message, isRead, category]
      );
      
      processedUserIds.add(user.id);
    }
    
    await connection.commit();
    
    return {
      message: 'Announcement and notifications added successfully',
      announcement_id: insertedAnnouncementId,
      notified_users_count: processedUserIds.size
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error inserting announcement and notifications:', error.message);
    throw new Error('Error inserting announcement and notifications into the database');
  } finally {
    connection.release(); // Always release the connection
  }
};

// Function to update an existing announcement in the database
exports.updateAnnouncement = async (notification_id, title, content, target_audience, status, priority = 'Medium', category = 'General', start_date = null, end_date = null) => {
  if (!notification_id) {
    throw new Error('Notification ID is required');
  }
  
  try {
    // Perform the database update query
    const [result] = await db.execute(
      `UPDATE announcements
       SET title = ?, content = ?, target_audience = ?, status = ?, 
           priority = ?, category = ?, start_date = ?, end_date = ?
       WHERE notification_id = ?`,
      [title, content, target_audience, status, priority, category, start_date, end_date, notification_id]
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