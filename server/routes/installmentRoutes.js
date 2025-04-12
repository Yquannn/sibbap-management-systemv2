// installments.routes.js
const express = require("express");
const router = express.Router();
const installmentsController = require("../controllers/installmentController");

// Endpoint to get installment breakdown with repayment info for a loan application.
router.get("/installment/:loan_application_id", installmentsController.getInstallments);

// Endpoint to record a repayment for an installment.
router.post("/installment/:installment_id/repay", installmentsController.addRepayment);

// router.post("loan-application/:memberId/disburse", installmentsController.disburseLoanApplication);

module.exports = router;
