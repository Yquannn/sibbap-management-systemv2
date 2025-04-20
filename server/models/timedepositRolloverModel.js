const db = require('../config/db');
const { generateRolloverTransactionNumber } = require('../utils/generateTransactionNumber');

// Function to schedule maturity updates
const scheduleMaturityUpdate = async (timeDepositId, maturityDate, payout) => {
  try {
    // First, add an entry to a scheduled_tasks table
    await db.query(
      `INSERT INTO scheduled_tasks (task_type, entity_id, execution_date, task_data, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        'TIME_DEPOSIT_MATURITY', 
        timeDepositId,
        maturityDate,
        JSON.stringify({ timeDepositId, payout }), 
        'PENDING'
      ]
    );
    
    console.log(`Scheduled maturity update for time deposit ${timeDepositId} on ${maturityDate}`);
    return true;
  } catch (error) {
    console.error('Failed to schedule maturity update:', error);
    return false;
  }
};

// Process maturity updates - this function will be called by a scheduler
const processMaturityUpdates = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    console.log(`Processing maturity updates for ${today}`);
    
    // Get all time deposits that mature today
    const [maturingDeposits] = await db.query(
      `SELECT timeDepositId, amount, interest, payout 
       FROM time_deposit 
       WHERE maturityDate <= ? AND account_status = 'Active'`,
      [today]
    );
    
    console.log(`Found ${maturingDeposits.length} time deposits maturing today or earlier`);
    
    for (const deposit of maturingDeposits) {
      try {
        await db.query(
          `UPDATE time_deposit 
           SET account_status = 'MATURED',
               amount = payout,
               updated_at = NOW()
           WHERE timeDepositId = ?`,
          [deposit.timeDepositId]
        );
        
        console.log(`Updated time deposit ${deposit.timeDepositId} to MATURED status with principal = payout`);
      } catch (err) {
        console.error(`Error updating time deposit ${deposit.timeDepositId}:`, err);
      }
    }
    
    // Also mark scheduled tasks as completed
    const [taskResult] = await db.query(
      `UPDATE scheduled_tasks 
       SET status = 'COMPLETED', executed_at = NOW() 
       WHERE task_type = 'TIME_DEPOSIT_MATURITY' 
       AND execution_date <= ? 
       AND status = 'PENDING'`,
      [today]
    );
    
    console.log(`Marked ${taskResult.affectedRows} scheduled tasks as completed`);
    
    return {
      processed: maturingDeposits.length,
      tasksCompleted: taskResult.affectedRows
    };
  } catch (error) {
    console.error('Error processing maturity updates:', error);
    throw error;
  }
};

const Rollover = {
  create: async (rolloverData) => {
    try {
      await db.query('START TRANSACTION');
      
      const rollover_transaction_number = await generateRolloverTransactionNumber();
      
      // Ensure interest rate is properly formatted
      let interestRateValue = rolloverData.new_interest_rate;
      if (typeof interestRateValue === 'string' && interestRateValue.includes('%')) {
        interestRateValue = interestRateValue.replace('%', '');
      }
      
      const dataToInsert = {
        ...rolloverData,
        rollover_transaction_number,
        new_interest_rate: interestRateValue // Use the cleaned value
      };
      
      const [rolloverResult] = await db.query(
        'INSERT INTO time_deposit_rollovers SET ?',
        [dataToInsert]
      );
      
      // Get current rollover count
      const [currentDeposit] = await db.query(
        'SELECT rollover_count, original_deposit_date FROM time_deposit WHERE timeDepositId = ?',
        [rolloverData.timeDepositId]
      );
      
      const currentRolloverCount = currentDeposit[0]?.rollover_count || 0;
      const originalDate = currentDeposit[0]?.original_deposit_date || rolloverData.rollover_date;
      
      // Update the time deposit with rollover information
      const [updateResult] = await db.query(
        `UPDATE time_deposit SET 
          amount = ?,
          fixedTerm = ?,
          interest_rate = ?,
          interest = ?,
          payout = ?,
          maturityDate = ?,
          account_status = 'Active',
          is_rolled_over = TRUE,
          last_rollover_date = ?,
          last_rollover_id = ?,
          rollover_count = ?,
          original_deposit_date = ?,
          updated_at = NOW(),
          created_by = ?
        WHERE timeDepositId = ?`,
        [
          rolloverData.rollover_amount,
          rolloverData.new_term || rolloverData.term_months,
          interestRateValue, // Use cleaned value
          rolloverData.interest,
          rolloverData.payout,
          rolloverData.new_maturity_date,
          rolloverData.rollover_date,
          rolloverResult.insertId,
          currentRolloverCount + 1,
          originalDate,
          rolloverData.created_by || "System",
          rolloverData.timeDepositId
        ]
      );
      
      // Schedule the maturity update
      await scheduleMaturityUpdate(
        rolloverData.timeDepositId, 
        rolloverData.new_maturity_date,
        rolloverData.payout
      );
      
      await db.query('COMMIT');
      
      return {
        rollover_id: rolloverResult.insertId,
        rollover_transaction_number,
        ...rolloverData,
        time_deposit_updated: updateResult.affectedRows > 0
      };
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error during rollover process:', error);
      throw error;
    }
  },

  findById: async (rollover_id) => {
    const [rows] = await db.query(
      'SELECT * FROM time_deposit_rollovers WHERE rollover_id = ?',
      [rollover_id]
    );
    return rows[0];
  },

  findByTimeDepositId: async (timeDepositId) => {
    const [rows] = await db.query(
      'SELECT * FROM time_deposit_rollovers WHERE timeDepositId = ? ORDER BY created_at DESC',
      [timeDepositId]
    );
    return rows;
  },

  update: async (rollover_id, updateData) => {
    const [result] = await db.query(
      'UPDATE time_deposit_rollovers SET ? WHERE rollover_id = ?',
      [updateData, rollover_id]
    );
    return result.affectedRows > 0;
  },
  
  // Export the processMaturityUpdates function as part of the Rollover module
  processMaturityUpdates
};

module.exports = Rollover;