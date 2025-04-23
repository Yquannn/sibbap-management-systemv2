// controllers/loanController.js
const LoanModel        = require('../models/loanHistoryModel');
const InstallmentModel = require('../models/installmentHistoryModel');

// Helper: build an amortization schedule
const calculateInstallments = (loanData) => {
  const { loan_amount, interest, terms, disbursed_date } = loanData;
  const principal      = parseFloat(loan_amount);
  const monthlyRate    = parseFloat(interest) / 100 / 12;
  const payment = (principal * monthlyRate) /
                  (1 - Math.pow(1 + monthlyRate, -terms));

  const installments = [];
  let balance = principal;
  const startDate = disbursed_date ? new Date(disbursed_date) : new Date();

  for (let n = 1; n <= terms; n++) {
    const interestAmt   = balance * monthlyRate;
    const principalAmt  = payment - interestAmt;
    const beginBal      = balance;
    balance -= principalAmt;
    const dueDate       = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + n);

    installments.push({
      loan_application_id: null,           // to be set by controller
      installment_number:   n,
      beginning_balance:   beginBal.toFixed(2),
      amortization:        payment.toFixed(2),
      principal:           principalAmt.toFixed(2),
      interest:            interestAmt.toFixed(2),
      savings_deposit:     0,
      penalty:             0,
      ending_balance:      balance.toFixed(2),
      due_date:            dueDate.toISOString().slice(0,10)
    });
  }

  return installments;
};

exports.getAllLoans = async (req, res) => {
  try {
    const loans = await LoanModel.getAllLoans();
    res.json({ success: true, data: loans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const loan = await LoanModel.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success: true, data: loan });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getLoansByMemberId = async (req, res) => {
  try {
    const loans = await LoanModel.getLoansByMemberId(req.params.memberId);
    res.json({ success: true, data: loans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// New: loan history = loan + installments
exports.getLoanHistory = async (req, res) => {
  try {
    const loan = await LoanModel.getLoanById(req.params.id);
    if (!loan) return res.status(404).json({ success:false, message:'Not found' });

    const installments = await InstallmentModel.getInstallmentsByLoanId(req.params.id);
    res.json({ success:true, data: { loan, installments } });
  } catch (e) {
    res.status(500).json({ success:false, message: e.message });
  }
};

exports.createLoan = async (req, res) => {
  try {
    // default balance
    if (!req.body.balance) req.body.balance = req.body.loan_amount;

    const loanId = await LoanModel.createLoan(req.body);

    // generate installments if needed
    if (loanId && req.body.terms > 0) {
      const sched = calculateInstallments(req.body);
      sched.forEach(i => i.loan_application_id = loanId);
      await InstallmentModel.bulkCreateInstallments(sched);
    }

    res.status(201).json({
      success: true,
      loan_application_id: loanId
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const exists = await LoanModel.getLoanById(req.params.id);
    if (!exists) return res.status(404).json({ success:false, message:'Not found' });

    await LoanModel.updateLoan(req.params.id, req.body);
    res.json({ success: true, loan_application_id: req.params.id });
  } catch (e) {
    res.status(500).json({ success:false, message: e.message });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const exists = await LoanModel.getLoanById(req.params.id);
    if (!exists) return res.status(404).json({ success:false, message:'Not found' });

    await LoanModel.deleteLoan(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success:false, message: e.message });
  }
};
