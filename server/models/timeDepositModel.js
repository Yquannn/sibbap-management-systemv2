const db = require("../config/db");

const TimeDeposit = {
  create: async ({
    memberId,
    amount,
    fixedTerm,
    interest,
    payout,
    maturityDate,
    // Co‑account holder fields (all prefixed with "co_")
    co_account_type,
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
    co_complete_address
  }) => {
    const sql = `
      INSERT INTO time_deposit (
        memberId, amount, fixedTerm, interest, payout, maturityDate, remarks,
        co_account_type, co_last_name, co_middle_name, co_first_name, co_extension_name,
        co_date_of_birth, co_place_of_birth, co_age, co_gender, co_civil_status,
        co_contact_number, co_relationship_primary, co_complete_address
      )
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      memberId,
      amount,
      fixedTerm,
      interest,
      payout,
      maturityDate,
      co_account_type,
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
      co_complete_address
    ]);
    return result;
  },

  getAllActive: async () => {
    const sql = `
      SELECT 
        td.timeDepositId, 
        td.amount, 
        td.fixedTerm, 
        td.interest, 
        td.payout, 
        td.maturityDate, 
        td.remarks, 
        m.memberId,
        m.last_name, 
        m.first_name, 
        m.memberCode
      FROM 
        time_deposit td
      INNER JOIN 
        members m ON td.memberId = m.memberId
      WHERE 
        td.remarks = 'ACTIVE'
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getTimeDepositor: async () => {
    const sql = `
      SELECT 
        memberId,
        memberCode, 
        last_name, 
        first_name, 
        contact_number, 
        barangay
      FROM 
        members
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getTimeDepositorById: async (id) => {
    const sql = `
      SELECT 
        memberId,
        memberCode, 
        last_name, 
        first_name, 
        contact_number, 
        barangay
      FROM 
        members
      WHERE memberId = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
};

module.exports = TimeDeposit;
