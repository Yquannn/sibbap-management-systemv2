const shareCapitalModel = require('../models/shareCapitalModel');

// Main transaction creation endpoint
exports.createShareCapitalTransaction = async (req, res) => {
  // try {
  //   // Generate transaction reference if needed
  //   const referenceNumber = await shareCapitalModel.generateTransactionReference();
    
  //   // Create a transaction number
  //   const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
  //   // Add the transaction number to the request body
  //   req.body.transaction_number = transactionNumber;
    
  //   // Add description if not provided
  //   if (!req.body.description) {
  //     req.body.description = `Transaction Ref: ${referenceNumber}`;
  //   }
    
  //   // Ensure authorizedBy is included
  //   if (!req.body.authorizedBy) {
  //     req.body.authorizedBy = req.session?.username || 'system';
  //   }
    
  //   const result = await shareCapitalModel.createShareCapitalTransaction(req.body);
  //   res.status(201).json(result);
  // } catch (error) {
  //   console.error("Error creating share capital transaction:", error);
  //   res.status(500).json({
  //      success: false,
  //      message: "Failed to create share capital transaction",
  //      error: error.message
  //    });
  // }
};

// Deposit endpoint
exports.createShareCapitalTransaction = async (req, res) => {
    try {
      // Generate transaction reference if needed
      const referenceNumber = await shareCapitalModel.generateTransactionReference();
      
      // Create a transaction number
      const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Add the transaction number to the request body
      req.body.transaction_number = transactionNumber;
      
      // Add description if not provided
      if (!req.body.description) {
        req.body.description = `Transaction Ref: ${referenceNumber}`;
      }
      
      // Ensure authorized_by is included
      if (!req.body.authorized_by) {
        req.body.authorized_by = req.session?.username || 'system';
      }
      
      const result = await shareCapitalModel.createShareCapitalTransaction(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating share capital transaction:", error);
      res.status(500).json({
         success: false,
         message: "Failed to create share capital transaction",
         error: error.message
       });
    }
  };
  
  // Deposit endpoint
  exports.depositShareCapital = async (req, res) => {
    try {
      const { memberCode, amount, description, authorized_by } = req.body;
      
      // Validate inputs
      if (!memberCode || !amount) {
        return res.status(400).json({
          success: false,
          message: "Member code and amount are required"
        });
      }
  
      // Generate transaction reference
      const referenceNumber = await shareCapitalModel.generateTransactionReference();
      const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Prepare transaction data
      const transactionData = {
        memberCode,
        transaction_type: 'deposit',
        amount: parseFloat(amount),
        description: description || `Share capital deposit. Ref: ${referenceNumber}`,
        transaction_number: transactionNumber,
        authorized_by: authorized_by || req.session?.username || 'system'
      };
      console.log(transactionData);
      
      const result = await shareCapitalModel.createShareCapitalTransaction(transactionData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error depositing share capital:", error);
      res.status(500).json({
         success: false,
         message: "Failed to deposit share capital",
         error: error.message
       });
    }
  };
  
  // Withdraw endpoint
  exports.withdrawShareCapital = async (req, res) => {
    try {
      const { memberCode, amount, description, authorized_by } = req.body;
      
      // Validate inputs
      if (!memberCode || !amount) {
        return res.status(400).json({
          success: false,
          message: "Member code and amount are required"
        });
      }
  
      // Generate transaction reference
      const referenceNumber = await shareCapitalModel.generateTransactionReference();
      const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Prepare transaction data
      const transactionData = {
        memberCode,
        transaction_type: 'withdraw',
        amount: parseFloat(amount),
        description: description || `Share capital withdrawal. Ref: ${referenceNumber}`,
        transaction_number: transactionNumber,
        authorized_by: authorized_by || req.session?.username || 'system'
      };
      
      const result = await shareCapitalModel.createShareCapitalTransaction(transactionData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error withdrawing share capital:", error);
      res.status(500).json({
         success: false,
         message: "Failed to withdraw share capital",
         error: error.message
       });
    }
  };
  
  // Transfer endpoint
  exports.transferShareCapital = async (req, res) => {
      try {
        const { sourceMemberCode, targetMemberCode, amount, description, authorized_by, isFullTransfer } = req.body;
        
        // Validate inputs
        if (!sourceMemberCode || !targetMemberCode || !amount) {
          return res.status(400).json({
            success: false,
            message: "Source member code, target member code, and amount are required"
          });
        }
    
        // Check if source and target are the same
        if (sourceMemberCode === targetMemberCode) {
          return res.status(400).json({
            success: false,
            message: "Cannot transfer to the same member"
          });
        }
    
        // Generate transaction reference
        const referenceNumber = await shareCapitalModel.generateTransactionReference();
        const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        // Prepare transaction data
        const transactionData = {
          memberCode: sourceMemberCode,
          transaction_type: 'transfer',
          amount: parseFloat(amount),
          transferToMemberCode: targetMemberCode,
          description: description || `Share capital transfer to member ${targetMemberCode}. Ref: ${referenceNumber}`,
          transaction_number: transactionNumber,
          authorized_by: authorized_by || req.session?.username || 'system',
          isFullTransfer: isFullTransfer || false
        };
        
        const result = await shareCapitalModel.createShareCapitalTransaction(transactionData);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error transferring share capital:", error);
        res.status(500).json({
          success: false,
          message: "Failed to transfer share capital",
          error: error.message
        });
      }
    };
exports.getShareCapitalByMemberId = async (req, res) => {
    try {
      const memberId = req.params.memberId;
      
      if (!memberId) {
        return res.status(400).json({
           success: false,
           message: "Member ID is required"
         });
      }
      
      const result = await shareCapitalModel.getShareCapitalByMemberId(memberId);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching share capital:", error);
      
      if (error.message === "Member not found") {
        return res.status(404).json({
          success: false,
          message: "Member not found"
        });
      }
      
      res.status(500).json({
         success: false,
         message: "Failed to fetch share capital data",
         error: error.message
       });
    }
  };

exports.getAllShareCapitalTransactions = async (req, res) => {
  try {
    const result = await shareCapitalModel.getAllShareCapitalTransactions();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all share capital transactions:", error);
    res.status(500).json({
       success: false,
       message: "Failed to fetch share capital transactions",
       error: error.message
     });
  }
};


exports.getMemberByCode = async (req, res) => {
    const { memberCode } = req.params;
  
    if (!memberCode) {
      return res.status(400).json({
        success: false,
        message: 'Member code is required'
      });
    }
  
    try {
      const rows = await memberModel.findByCode(memberCode);
  
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
  
      // Return the member data
      res.status(200).json({
        success: true,
        member: rows[0]
      });
    } catch (error) {
      console.error('Error retrieving member by code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve member information',
        error: error.message
      });
    }
  };