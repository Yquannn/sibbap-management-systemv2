const KalingaClaims = require('../models/kalingaClaims.model');

exports.getAllClaims = async (req, res) => {
  try {
    const claims = await KalingaClaims.getAll();
    res.status(200).json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving claims', error: err.message });
  }
};

exports.getMemberClaims = async (req, res) => {
  try {
    const { member_id } = req.params;
    const claims = await KalingaClaims.getByMember(member_id);
    res.status(200).json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving member claims', error: err.message });
  }
};

exports.getClaimsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const claims = await KalingaClaims.getByStatus(status);
    res.status(200).json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving claims by status', error: err.message });
  }
};

exports.createClaim = async (req, res) => {
  try {
    const { 
      member_id, claim_type, amount, beneficiary_name, 
      relationship, supporting_documents, remarks 
    } = req.body;
    
    if (!member_id || !claim_type || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const claim = {
      member_id,
      claim_date: new Date(),
      claim_type,
      amount,
      beneficiary_name,
      relationship,
      supporting_documents,
      remarks,
      status: 'Pending'
    };
    
    const id = await KalingaClaims.create(claim);
    res.status(201).json({ message: 'Claim submitted successfully', id });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting claim', error: err.message });
  }
};


// Then update the controller with better validation
exports.updateClaimStatus = async (req, res) => {
  try {
    const { claim_id } = req.params;
    const { status, approved_by } = req.body;
    
    if (!claim_id) {
      return res.status(400).json({ message: 'Claim ID is required' });
    }
    
    if (!status || !approved_by) {
      return res.status(400).json({ message: 'Status and approver are required' });
    }
    
    // Optional: Add status validation
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    try {
      const result = await KalingaClaims.updateStatus(claim_id, status, approved_by, new Date());
      
      if (!result) {
        return res.status(404).json({ message: 'Claim not found' });
      }
      
      res.status(200).json({ message: `Claim status updated to ${status}` });
    } catch (err) {
      if (err.message === 'Approver user ID does not exist') {
        return res.status(400).json({ message: 'Invalid approver ID' });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating claim status', error: err.message });
  }
};
exports.getClaimById = async (req, res) => {
  try {
    const { claim_id } = req.params;
    const claim = await KalingaClaims.getById(claim_id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.status(200).json(claim);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving claim', error: err.message });
  }
};