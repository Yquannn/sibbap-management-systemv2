// installments.controller.js
const installmentsModel = require("../models/installmentModel");

// GET /installments/:loan_application_id
// Returns all installments for a given loan application, along with the total repaid amount and computed remaining amount.
exports.getInstallments = async (req, res) => {
  const { loan_application_id } = req.params;
  try {
    const installments = await installmentsModel.getInstallmentsWithRepayments(loan_application_id);
    // Calculate the remaining amount for each installment and update status accordingly.
    const installmentsWithCalc = installments.map(inst => {
      const amountDue = Number(inst.amount);
      const amountRepaid = Number(inst.amount_repaid);
      const remaining = amountDue - amountRepaid;
      // If remaining is less than or equal to zero, mark as "Paid", otherwise "Unpaid"
      const updatedStatus = remaining <= 0 ? "Paid" : "Unpaid";
      return {
        ...inst,
        amount: amountDue,
        amount_repaid: amountRepaid,
        remaining,
        status: updatedStatus
      };
    });
    res.json(installmentsWithCalc);
  } catch (error) {
    console.error("Error fetching installments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addRepayment = async (req, res) => {
  const { installment_id } = req.params;
  const { amount_paid, method, authorized } = req.body; // Expect these values in the request body

  try {
    const result = await installmentsModel.addRepayment(
      installment_id,
      amount_paid,
      method,
      "Paid",
      "Repayment", 
      authorized
    );
    // The result is expected to have repaymentId, transactionNumber, and status
    res.json({ 
      message: "Repayment recorded", 
      repaymentId: result.repaymentId,
      transactionNumber: result.transactionNumber,
      status: result.status
    });
  } catch (error) {
    console.error("Error recording repayment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};