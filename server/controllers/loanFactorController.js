const {
    getAllLoanFactors,
    getLoanFactorByN,
    createLoanFactor,
    updateLoanFactor
  } = require('../models/loanFactorModel');
  
  exports.getAllLoanFactors = async (req, res) => {
    try {
      const factors = await getAllLoanFactors();
      res.json(factors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch loan factors' });
    }
  };
  
  exports.getLoanFactor = async (req, res) => {
    try {
      const n = parseInt(req.params.n, 10);
      const factor = await getLoanFactorByN(n);
      if (!factor) {
        return res.status(404).json({ error: `No term found for n=${n}` });
      }
      res.json(factor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch loan factor' });
    }
  };
  
  exports.addLoanFactor = async (req, res) => {
    try {
      const { n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 } = req.body;
      const result = await createLoanFactor({ n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 });
      res.status(201).json({ message: 'Inserted', insertId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to insert loan factor' });
    }
  };
  
  exports.updateLoanFactor = async (req, res) => {
    try {
      const n = parseInt(req.params.n, 10);
      const { factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 } = req.body;
      const result = await updateLoanFactor({ n, factor_1_00, factor_1_25, factor_1_50, factor_1_75, factor_2_00 });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `No term found for n=${n}` });
      }
      res.json({ message: 'Updated', changedRows: result.changedRows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update loan factor' });
    }
  };
  