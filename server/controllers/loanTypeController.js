// controllers/loanTypeController.js
const LoanType = require('../models/loanTypeModel');

exports.getAllLoanTypes = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const loanTypes = await LoanType.getAll(includeArchived);
    res.status(200).json({ success: true, data: loanTypes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan types',
      error: error.message
    });
  }
};

exports.getLoanTypeById = async (req, res) => {
  try {
    const loanType = await LoanType.getById(req.params.id);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }
    res.status(200).json({ success: true, data: loanType });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan type',
      error: error.message
    });
  }
};

// controllers/loanTypeController.js
exports.createLoanType = async (req, res) => {
  try {
    const {
      loan_type,
      interest_rate,
      service_fee,
      penalty_fee,
      additional_savings_deposit,   // new field (optional)
      commodity_type,
      price_per_unit,
      max_units,
      loan_percentage
    } = req.body;

    // required base fields
    if (
      !loan_type ||
      interest_rate == null ||
      service_fee == null ||
      penalty_fee == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide loan_type, interest_rate, service_fee and penalty_fee'
      });
    }

    // pass everything through to the model
    const id = await LoanType.create({
      loan_type,
      interest_rate,
      service_fee,
      penalty_fee,
      additional_savings_deposit,  // will default to 0.00 if undefined
      commodity_type,
      price_per_unit,
      max_units,
      loan_percentage
    });

    res.status(201).json({
      success: true,
      message: 'Loan type created successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create loan type',
      error: error.message
    });
  }
};

exports.updateLoanType = async (req, res) => {
  try {
    const {
      loan_type,
      interest_rate,
      service_fee,
      penalty_fee,
      additional_savings_deposit,
      commodity_type,
      price_per_unit,
      max_units,
      loan_percentage
    } = req.body;
      
    // Validate required fields
    if (!loan_type || interest_rate == null || service_fee == null || penalty_fee == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide loan_type, interest_rate, service_fee and penalty_fee'
      });
    }
    
    // If additional_savings_deposit is provided but not a valid number, reject
    if (additional_savings_deposit != null && isNaN(parseFloat(additional_savings_deposit))) {
      return res.status(400).json({
        success: false,
        message: 'Additional savings deposit must be a valid number'
      });
    }
      
    const updated = await LoanType.update(req.params.id, req.body);
      
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found or no changes made'
      });
    }
      
    res.status(200).json({
      success: true,
      message: 'Loan type updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update loan type',
      error: error.message
    });
  }
 };
 

exports.archiveLoanType = async (req, res) => {
  try {
    const archived = await LoanType.archive(req.params.id);
    if (!archived) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Loan type archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to archive loan type',
      error: error.message
    });
  }
};

exports.unarchiveLoanType = async (req, res) => {
  try {
    const unarchived = await LoanType.unarchive(req.params.id);
    if (!unarchived) {
      return res.status(404).json({
        success: false,
        message: 'Loan type not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Loan type unarchived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unarchive loan type',
      error: error.message
    });
  }
};

// Add to controllers/loanTypeController.js

exports.getLoanTypeByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { exact } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a loan type name'
      });
    }
    
    const loanTypes = await LoanType.getByLoanType(name, exact === 'true');
    
    if (loanTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No loan types found matching the given name'
      });
    }
    
    res.status(200).json({
      success: true,
      data: loanTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan types by name',
      error: error.message
    });
  }
};
