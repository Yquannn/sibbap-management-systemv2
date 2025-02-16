const { findSavingsByMemberId, updateSavingsAmount, getEarnings, createTransaction, getAllTransactions, getTransactionById } = require('../models/savingsModel');


exports.withdraw = async (req, res) => {
    const { memberId, amount } = req.body;
  
    // Input validation
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID is required' });
    }
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
  
    try {
      console.log(`Processing withdrawal for memberId=${memberId}, amount=${amount}`);
  
      // Fetch the savings record
      const savings = await findSavingsByMemberId(memberId);
  
      if (!savings) {
        return res.status(404).json({ error: 'Savings record not found for this member' });
      }
  
      console.log(`Current balance for memberId=${memberId}: ${savings.amount}`);
  
      if (savings.amount < amount) {
        return res.status(400).json({ error: 'Insufficient funds for withdrawal' });
      }
  
      const newBalance = parseFloat((savings.amount - amount).toFixed(2));
      console.log(`New balance calculated for memberId=${memberId}: ${newBalance}`);
  
      const updated = await updateSavingsAmount(memberId, newBalance);
  
      if (!updated) {
        return res.status(500).json({ error: 'Failed to update savings record' });
      }
  
      res.status(200).json({
        success: 'Withdrawal successful',
        withdrawnAmount: amount,
        newBalance,
      });
    } catch (error) {
      console.error('Error during withdrawal:', error.message);
      res.status(500).json({ error: 'An error occurred while processing the withdrawal' });
    }
  };
  

exports.deposit = async (req, res) => {
    const { memberId, amount } = req.body;
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero.' });
    }
  
    try {
      console.log(`Processing deposit: memberId=${memberId}, amount=${amount}`);
  
      const savings = await findSavingsByMemberId(memberId);
  
      if (!savings) {
        return res.status(404).json({ error: 'Savings record not found for this member.' });
      }
  
      const currentBalance = parseFloat(savings.amount); // Convert savings.amount to a number
      const depositAmount = parseFloat(amount); // Convert amount to a number
  
      console.log(`Current balance for memberId=${memberId}: ${currentBalance}`);
  
      const newBalance = parseFloat((currentBalance + depositAmount).toFixed(2)); // Calculate new balance with two decimal precision
      console.log(`New balance calculated for memberId=${memberId}: ${newBalance}`);
  
      const updated = await updateSavingsAmount(memberId, newBalance);
  
      if (!updated) {
        console.error(`Failed to update savings for memberId=${memberId}`);
        return res.status(500).json({ error: 'Failed to update savings record.' });
      }
  
      res.status(200).json({
        success: 'Deposit successful',
        depositedAmount: depositAmount,
        newBalance,
      });
    } catch (error) {
      console.error('Error during deposit:', error); // Log the full error object for debugging
      res.status(500).json({ error: 'An error occurred while processing the deposit.' });
    }
  };

  exports.getEarnings = async (req, res) => {
    const { memberId } = req.params;
  
    try {
      const earnings = await getEarnings(memberId);
      if (earnings === null) {
        return res.status(404).json({ message: `⚠ No earnings found for MemberId: ${memberId}` });
      }
  
      res.json({ memberId, earnings });
    } catch (error) {
      console.error('❌ Failed to get earnings:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  


  // async function checkAndUpdateAccounts() {
  //   let connection;
  //   try {
  //     connection = await db.getConnection();
  //     const query = `
  //       UPDATE regular_savings
  //       SET status = 'dormonth'
  //       WHERE last_updated < NOW() - INTERVAL 20 SECOND
  //       AND status <> 'dormonth';
  //     `;
  //     const [result] = await connection.query(query);
  //     console.log(`${result.affectedRows} accounts updated to dormonth due to inactivity.`);
  //   } catch (error) {
  //     console.error('❌ Failed to update accounts:', error.message);
  //   } finally {
  //     if (connection) connection.release();
  //   }
    
  //   // Run again every 20 seconds
  //   setTimeout(checkAndUpdateAccounts, 20000);
  // }
  
  // // Initialize first execution
  // checkAndUpdateAccounts();
  
  // 🏦 Function to Apply Interest (Runs Monthly)


 
exports.createTransaction = async (req, res) => {
  try {
    const { regular_savings_id, transaction_number, transaction_type, interest_amount, transaction_date_time } = req.body;
    
    if (!transaction_number || !transaction_type || !interest_amount || !transaction_date_time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTransaction = {
      regular_savings_id,
      transaction_number,
      transaction_type,
      interest_amount,
      transaction_date_time,
    };

    const result = await createTransaction(newTransaction);
    res.status(201).json({ message: 'Transaction added successfully', transactionId: result.insertId });
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await getAllTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const transaction = await getTransactionById(transactionNumber);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
