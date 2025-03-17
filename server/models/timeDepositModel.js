const db = require("../config/db");

const TimeDeposit = {
  create: async ({ memberId, amount, fixedTerm, interest, payout, maturityDate }) => {
    const sql = `
      INSERT INTO time_deposit (memberId, amount, fixedTerm, interest, payout, maturityDate, remarks)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `;
    const [result] = await db.execute(sql, [memberId, amount, fixedTerm, interest, payout, maturityDate]);
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
      ;
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};

module.exports = TimeDeposit;
