const TimeDeposit = require("../models/timeDepositModel");
const calculateInterestRate = require("../utils/calculateInterest");

exports.createTimeDeposit = async (req, res) => {
  const { memberId, amount, fixedTerm } = req.body;

  if (!memberId || !amount || !fixedTerm) {
    return res.status(400).json({ error: "Member ID, amount, and fixed term are required." });
  }

  try {
    const termMonths = parseInt(fixedTerm, 10);
    const interestRate = calculateInterestRate(amount, termMonths);

    const interest = amount * interestRate * (termMonths / 12);
    const payout = amount + interest;
    const maturityDate = new Date(new Date().setMonth(new Date().getMonth() + termMonths))
      .toISOString()
      .slice(0, 10);

    const newTimeDeposit = {
      memberId,
      amount,
      fixedTerm,
      interest: interest.toFixed(2),
      payout: payout.toFixed(2),
      maturityDate,
    };

    await TimeDeposit.create(newTimeDeposit);

    // Return the expected response format
    res.status(201).json({
      memberId,
      amount,
      fixedTerm,
    });
  } catch (err) {
    console.error("Error creating time deposit:", err.message);
    res.status(500).json({ error: "Error creating time deposit." });
  }
};

exports.getActiveTimeDeposits = async (req, res) => {
    try {
      const deposits = await TimeDeposit.getAllActive();
      if (deposits.length === 0) {
        return res.status(404).json({ error: "No active time deposits found." });
      }
      res.status(200).json(deposits);
    } catch (err) {
      console.error("Error fetching active time deposits:", err.message);
      res.status(500).json({ error: "Error fetching active time deposits." });
    }
  };
  