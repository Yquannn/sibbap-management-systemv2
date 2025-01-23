const db = require("../config/db");

const TimeDeposit = {
  create: async ({ memberId, amount, fixedTerm, interest, payout, maturityDate }) => {
    const sql = `
      INSERT INTO time_deposit (memberId, amount, fixedTerm, interest, payout, maturityDate, remarks)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
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
        m.fullNameLastName, 
        m.fullNamefirstName, 
        m.memberCode
      FROM 
        time_deposit td
      INNER JOIN 
        members m ON td.memberId = m.memberId
      WHERE 
        td.remarks = 'active'
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
  
};

module.exports = TimeDeposit;
