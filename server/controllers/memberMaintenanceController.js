const ContributionType = require('../models/memberMaintenanceModel');

// Get all contributions
exports.getAllContributionTypes = async (req, res) => {
    try {
        const contributions = await ContributionType.getAllContributionTypes();
        res.json(contributions);
    } catch (error) {
        console.error('Error fetching contribution types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllContributionTypesArchive = async (req, res) => {
    try {
        const contributions = await ContributionType.getAllContributionTypesArchive();
        res.json(contributions);
    } catch (error) {
        console.error('Error fetching contribution types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.handleRestore = async (req, res, next) => {
    try {
      const affected = await ContributionType.restoreArchive(req.params.id);
      if (affected) {
        res.json({ message: 'Contribution type restored.' });
      } else {
        res.status(404).json({ message: 'Not found or already active.' });
      }
    } catch (err) {
      next(err);
    }
  };


// Get single contribution by ID
exports.getContributionTypeById = async (req, res) => {
    try {
        const id = req.params.id;
        const contribution = await ContributionType.getContributionTypeById(id);

        if (!contribution) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        res.json(contribution);
    } catch (error) {
        console.error('Error fetching contribution by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add contribution
exports.addContributionType = async (req, res) => {
    try {
        const { name, amount, description } = req.body;
        const insertId = await ContributionType.addContributionType(name, amount, description);
        res.status(201).json({ message: 'Contribution added', contribution_type_id: insertId });
    } catch (error) {
        console.error('Error adding contribution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update contribution
exports.updateContributionType = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, amount, description } = req.body;

        const affectedRows = await ContributionType.updateContributionType(id, name, amount, description);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        res.json({ message: 'Contribution updated' });
    } catch (error) {
        console.error('Error updating contribution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete (deactivate) contribution
exports.archiveContributionType = async (req, res) => {
    try {
        const id = req.params.id;

        const affectedRows = await ContributionType.archiveContributionType(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        res.json({ message: 'Contribution deactivated' });
    } catch (error) {
        console.error('Error deleting contribution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
