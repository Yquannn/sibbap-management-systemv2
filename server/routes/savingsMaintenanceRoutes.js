const express = require('express');
const router = express.Router();

const interestRates = require('../controllers/savingsMaintenanceController');
    // ==========================================
    // MODULES (BASE) ROUTES
    // ==========================================
    
    // Create a new Interest Rate Module
    router.post("/modules", interestRates.createModule);
  
    // Retrieve all Interest Rate Modules
    router.get("/modules", interestRates.findAllModules);
  
    // Retrieve a single Interest Rate Module
    router.get("/modules/:id", interestRates.findOneModule);
  
    // Update an Interest Rate Module
    router.put("/modules/:id", interestRates.updateModule);
  
    // Archive an Interest Rate Module
    router.put("/modules/archive/:id", interestRates.archiveModule);
  
    // Restore an archived Interest Rate Module
    router.put("/modules/restore/:id", interestRates.restoreModule);
  
    // Delete an Interest Rate Module permanently
    router.delete("/modules/:id", interestRates.deleteModule);
  
    // ==========================================
    // TIME DEPOSIT ROUTES
    // ==========================================
    
    // Create a new Time Deposit Rate
    router.post("/time-deposit", interestRates.createTimeDepositRate);
  
    // Retrieve all Time Deposit Rates for a module
    router.get("/time-deposit/:moduleId", interestRates.findTimeDepositRates);
  
    // Retrieve Time Deposit Rates for a specific term
    router.get("/time-deposit/:moduleId/:termMonths", interestRates.findTimeDepositRatesByTerm);
  
    // Update a Time Deposit Rate
    router.put("/time-deposit/:id", interestRates.updateTimeDepositRate);
  
    // Delete a Time Deposit Rate
    router.delete("/time-deposit/:id", interestRates.deleteTimeDepositRate);
  
    // ==========================================
    // SHARE CAPITAL ROUTES
    // ==========================================
    
    // Create a new Share Capital Rate
    router.post("/share-capital", interestRates.createShareCapitalRate);
  
    // Get current rate for a module
    router.get("/share-capital/current/:moduleId", interestRates.findCurrentShareCapitalRate);
  
    // Get rate history for a module
    router.get("/share-capital/history/:moduleId", interestRates.findShareCapitalRateHistory);
  
    // ==========================================
    // REGULAR SAVINGS ROUTES
    // ==========================================
    
    // Update Regular Savings Rate
    router.put("/regular-savings/:id", interestRates.updateRegularSavingsRate);
  
    // Register routes
    router.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(err.status || 500).json({
          message: err.message || 'An error occurred while processing your request.',
        });
      });
      
      module.exports = router;