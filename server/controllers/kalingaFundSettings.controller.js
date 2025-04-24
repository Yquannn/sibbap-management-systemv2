// controllers/kalingaFundSettings.controller.js
const KalingaFundSettings = require('../models/kalingaFund.model');

exports.getSettings = async (req, res) => {
  try {
    const settings = await KalingaFundSettings.getAll();
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving settings', error: err.message });
  }
};

exports.getActiveSettings = async (req, res) => {
  try {
    const settings = await KalingaFundSettings.getActive();
    if (!settings) {
      return res.status(404).json({ message: 'No active settings found' });
    }
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving active settings', error: err.message });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const { contribution_amount, death_benefit_amount, hospitalization_benefit_amount } = req.body;
    
    if (!contribution_amount || !death_benefit_amount || !hospitalization_benefit_amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const settings = {
      contribution_amount,
      death_benefit_amount,
      hospitalization_benefit_amount,
      is_active: true
    };
    
    const id = await KalingaFundSettings.create(settings);
    res.status(201).json({ message: 'Settings created successfully', id });
  } catch (err) {
    res.status(500).json({ message: 'Error creating settings', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { fund_id } = req.params;
    const result = await KalingaFundSettings.update(fund_id, req.body);
    
    if (!result) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
};