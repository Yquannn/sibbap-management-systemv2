const TimeDeposit = require("../models/timeDepositModel");
const calculateInterestRate = require("../utils/calculateInterest");

exports.createTimeDeposit = async (req, res) => {
  const {
    memberId,
    amount,
    fixedTerm,
    account_type,
    last_name,
    middle_name,
    first_name,
    extension_name,
    date_of_birth,
    place_of_birth,
    age,
    gender,
    civil_status,            // corrected from civi_status if needed
    contact_number,
    relationship_primary,    // corrected from ralationshiop_priimary if needed
    complete_address
  } = req.body;

  // Validate required fields
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

    // Ensure optional fields are not undefined by replacing with null if needed.
    const newTimeDeposit = {
      memberId,
      amount,
      fixedTerm,
      interest: interest.toFixed(2),
      payout: payout.toFixed(2),
      maturityDate,
      account_type: account_type ?? null,
      last_name: last_name ?? null,
      middle_name: middle_name ?? null,
      first_name: first_name ?? null,
      extension_name: extension_name ?? null,
      date_of_birth: date_of_birth ?? null,
      place_of_birth: place_of_birth ?? null,
      age: age ?? null,
      gender: gender ?? null,
      civil_status: civil_status ?? null,
      contact_number: contact_number ?? null,
      relationship_primary: relationship_primary ?? null,
      complete_address: complete_address ?? null
    };

    await TimeDeposit.create(newTimeDeposit);

    // Return the expected response format
    res.status(201).json({
      memberId,
      amount,
      fixedTerm,
      maturityDate,
      interest: interest.toFixed(2),
      payout: payout.toFixed(2)
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

exports.getMemberWithNoTimeDeposit = async (req, res) => {
  try {
    // Fetch members (or depositors) from the model
    const deposits = await TimeDeposit.getTimeDepositor();

    if (!deposits || deposits.length === 0) {
      return res.status(200).json({
        message: "No members found without active time deposits.",
        data: []
      });
    }

    res.status(200).json({ data: deposits });
  } catch (err) {
    console.error("Error fetching members:", err.message);
    res.status(500).json({
      error: "An error occurred while fetching members.",
      details: err.message
    });
  }
};

