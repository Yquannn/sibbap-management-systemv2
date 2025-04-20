const TimeDeposit = require("../models/timeDepositModel");

// Helper function: convert undefined or empty strings to null.
const safeValue = (val) => (val === undefined || val === "" ? null : val);

exports.createTimeDeposit = async (req, res) => {
  const {
    memberId,
    amount,
    fixedTerm,
    account_type,
    authorized_by,
    user_type,
    // Co-maker fields
    co_last_name,
    co_middle_name,
    co_first_name,
    co_extension_name,
    co_date_of_birth,
    co_place_of_birth,
    co_age,
    co_gender,
    co_civil_status,
    co_contact_number,
    co_relationship_primary,
    co_complete_address,
    // Time deposit fields
    interest_rate,
    interest,
    payout,
    maturityDate
  } = req.body;

  // Validate required fields.
  if (!memberId || !amount || !fixedTerm) {
    return res.status(400).json({
      error: "Member ID, amount, and fixed term are required.",
    });
  }

  try {
    // Build the time deposit record with co-maker fields included and prefixed with co_
    const timeDepositData = {
      memberId: safeValue(memberId),
      amount: safeValue(amount),
      fixedTerm: safeValue(fixedTerm),
      interest_rate: safeValue(interest_rate),
      interest: safeValue(interest),
      payout: safeValue(payout),
      maturityDate: safeValue(maturityDate),
      account_type: safeValue(account_type),
      authorized_by: safeValue(authorized_by), // Assuming req.userId is set by authentication middleware
      user_type: safeValue(user_type), // Assuming req.userType is set by authentication middleware
      // Include co-maker fields with co_ prefix
      co_last_name: safeValue(co_last_name),
      co_middle_name: safeValue(co_middle_name),
      co_first_name: safeValue(co_first_name),
      co_extension_name: safeValue(co_extension_name),
      co_date_of_birth: safeValue(co_date_of_birth),
      co_place_of_birth: safeValue(co_place_of_birth),
      co_age: safeValue(co_age),
      co_gender: safeValue(co_gender),
      co_civil_status: safeValue(co_civil_status),
      co_contact_number: safeValue(co_contact_number), 
      co_relationship_primary: safeValue(co_relationship_primary),
      co_complete_address: safeValue(co_complete_address)
    };

    // Debug: log the payload to ensure no undefined values are present.
    console.log("Creating Time Deposit with payload:", timeDepositData);

    // Create the time deposit record in the database using the model.
    const result = await TimeDeposit.create(timeDepositData);

    // Return the created record details with the insertId from the result.
    res.status(201).json({
      success: true,
      message: "Time deposit created successfully",
      data: {
        timeDepositId: result.insertId,
        memberId,
        amount,
        fixedTerm,
        maturityDate,
        interest_rate,
        interest,
        payout,
        account_status: "PRE-MATURE", // Reflecting what's set in the model
      },
    });
  } catch (err) {
    console.error("Error creating time deposit:", err.message);
    res.status(500).json({ error: "Error creating time deposit." });
  }
};

exports.getActiveTimeDeposits = async (req, res) => {
  try {
    const deposits = await TimeDeposit.getAllActive();
    
    // Return an empty array with 200 status instead of 404
    res.status(200).json({
      success: true,
      count: deposits.length,
      data: deposits || [], // Ensure we always return an array even if null is returned
    });
  } catch (err) {
    console.error("Error fetching active time deposits:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Error fetching active time deposits." 
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
    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Error retrieving time deposit record:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Removed the getMemberWithNoTimeDeposit function as there's no matching model method
