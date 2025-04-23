const db = require('../config/db');

const getAllLoanFactors = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM loan_factors ORDER BY n'
  );
  return rows;
};

const getLoanFactorByN = async (n) => {
  const [rows] = await db.execute(
    'SELECT * FROM loan_factors WHERE n = ?', 
    [n]
  );
  return rows[0];
};

const createLoanFactor = async ({ n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 }) => {
  const sql = `
    INSERT INTO loan_factors
      (n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00];
  const [result] = await db.execute(sql, params);
  return result;
};

const updateLoanFactor = async ({ n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 }) => {
  const sql = `
    UPDATE loan_factors
       SET factor_1_00 = ?,
           factor_1_25 = ?,
           factor_1_50 = ?,
           factor_1_75 = ?,
           factor_2_00 = ?
     WHERE n = ?
  `;
  const params = [factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00, n];
  const [result] = await db.execute(sql, params);
  return result;
};

module.exports = {
  getAllLoanFactors,
  getLoanFactorByN,
  createLoanFactor,
  updateLoanFactor,
};
