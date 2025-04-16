// RolloverController.js
const Rollover = require('../models/timedepositRolloverModel');

const RolloverController = {
  create: async (req, res) => {
    try {
      const rolloverData = req.body;
      const result = await Rollover.create(rolloverData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create rollover' });
    }
  },
  
  getByTimeDepositId: async (req, res) => {
    try {
      const timeDepositId = req.params.timeDepositId;
      const rollovers = await Rollover.findByTimeDepositId(timeDepositId);
      res.status(200).json(rollovers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve rollovers' });
    }
  },
  
  // Add more controller methods as needed
};

module.exports = RolloverController;