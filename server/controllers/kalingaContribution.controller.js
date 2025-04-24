const KalingaContributions = require('../models/kalingaContribution.model');
const { generateTransactionNumber } = require('../utils/generateTransactionNumber'); // Import the transaction number generat


exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await KalingaContributions.getAll();
    res.status(200).json(contributions);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving contributions', error: err.message });
  }
};

// In your controller
exports.getMemberContributions = async (req, res) => {
  try {
    const { member_id } = req.params;
    console.log('Fetching contributions for member:', member_id);
    
    // If your database column is named memberId but your parameter is member_id
    const contributions = await KalingaContributions.getByMember(member_id);
    
    console.log('Found contributions:', contributions);
    res.status(200).json(contributions);
  } catch (err) {
    console.error('Error in getMemberContributions:', err);
    res.status(500).json({ message: 'Error retrieving member contributions', error: err.message });
  }
};



const generateUniqueAccountNumber = async () => {
  // For example, prefix "RS", then use the last 8 digits of Date.now()
  // and two random digits (zero-padded) to increase uniqueness.
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${timestampPart}${randomPart}`;
};



exports.createContribution = async (req, res) => {
  try {
    const { memberId, amount, payment_method, remarks } = req.body;
    let { account_number, receipt_number } = req.body;
    
    if (!memberId || !amount) {
      return res.status(400).json({ message: 'Member ID and amount are required' });
    }
    
    // Generate account number only if not provided
    if (!account_number) {
      account_number = await generateUniqueAccountNumber();
    }
    
    // Generate receipt number only if not provided
    if (!receipt_number) {
      receipt_number = await generateTransactionNumber();
    }
    
    const contribution = {
      memberId,
      account_number,
      payment_date: new Date(),
      amount,
      payment_method,
      receipt_number,
      remarks
    };
    
    const id = await KalingaContributions.create(contribution);
    res.status(201).json({ message: 'Contribution recorded successfully', id });
  } catch (err) {
    res.status(500).json({ message: 'Error recording contribution', error: err.message });
  }
};

exports.getContributionById = async (req, res) => {
  try {
    const { contribution_id } = req.params;
    const contribution = await KalingaContributions.getById(contribution_id);
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }
    
    res.status(200).json(contribution);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving contribution', error: err.message });
  }
};