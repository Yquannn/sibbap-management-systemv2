const TimeDeposit = require("../models/timeDepositModel");

// Helper function: convert undefined or empty strings to null.
const safeValue = (val) =>
  val === undefined || val === "" ? null : val;

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
    civil_status,
    contact_number,
    relationship_primary,
    complete_address,
    interest,       // Now expected to be passed in (or null)
    payout,         // Now expected to be passed in (or null)
    maturityDate    // Now expected to be passed in (or null)
  } = req.body;

  // Validate required fields.
  if (!memberId || !amount || !fixedTerm) {
    return res
      .status(400)
      .json({ error: "Member ID, amount, and fixed term are required." });
  }

  try {
    // Build the time deposit record using safeValue.
    const newTimeDeposit = {
      memberId: safeValue(memberId),
      amount: safeValue(amount),
      fixedTerm: safeValue(fixedTerm),
      interest: safeValue(interest),
      payout: safeValue(payout),
      maturityDate: safeValue(maturityDate),
      account_type: safeValue(account_type),
      co_last_name: safeValue(last_name),
      co_middle_name: safeValue(middle_name),
      co_first_name: safeValue(first_name),
      co_extension_name: safeValue(extension_name),
      co_date_of_birth: safeValue(date_of_birth),
      co_place_of_birth: safeValue(place_of_birth),
      co_age: safeValue(age),
      co_gender: safeValue(gender),
      co_civil_status: safeValue(civil_status),
      co_contact_number: safeValue(contact_number),
      co_relationship_primary: safeValue(relationship_primary),
      co_complete_address: safeValue(complete_address)
    };

    // Debug: log the payload to ensure no undefined values are present.
    console.log("Creating Time Deposit with payload:", newTimeDeposit);

    // Create the time deposit record in the database.
    await TimeDeposit.create(newTimeDeposit);

    // Return the created record details.
    res.status(201).json({
      memberId,
      amount,
      fixedTerm,
      maturityDate,
      interest,
      payout
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
    // Fetch members (or depositors) from the model.
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

exports.getTimeDepositorById = async (req, res) => {
  try {
    console.log("getTimeDepositorById: req.params =", req.params);
    // Destructure timeDepositId from req.params.
    const { timeDepositId } = req.params;
    if (!timeDepositId) {
      return res.status(400).json({ error: "Time Deposit ID is required." });
    }
    const record = await TimeDeposit.getTimeDepositorById(timeDepositId);
    if (!record) {
      return res.status(404).json({ error: "No time deposit record found." });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error("Error retrieving time deposit record:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
