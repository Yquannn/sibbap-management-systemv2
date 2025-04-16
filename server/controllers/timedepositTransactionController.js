const { getTransactionsByTimeDepositId } = require('../models/timedepositTransactionModel');

async function getTransactionsByTimeDepositIdController(req, res, next) {
  try {
    const { id } = req.params;
    // Use the model function to fetch transactions
    const transactions = await getTransactionsByTimeDepositId(id);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactionsByTimeDepositId: getTransactionsByTimeDepositIdController,
};
