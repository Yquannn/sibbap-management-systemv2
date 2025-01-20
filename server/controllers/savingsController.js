const { findSavingsByMemberId, updateSavingsAmount } = require('../models/savingsModel');

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
  
  