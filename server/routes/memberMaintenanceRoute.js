const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/memberMaintenanceController');

// GET all contributions
router.get('/contribution-type', contributionController.getAllContributionTypes);
router.get('/contribution-type/archive', contributionController.getAllContributionTypesArchive);
// GET single contribution by ID
router.get('/contribution-type/:id', contributionController.getContributionTypeById);

// POST new contribution
router.post('/contribution-type', contributionController.addContributionType);

// PUT update contribution
router.put('/contribution-type/:id', contributionController.updateContributionType);

router.put('/contribution-type/restore/:id', contributionController.handleRestore);


// DELETE contribution (soft delete)
router.put('/contribution-type/archive/:id', contributionController.archiveContributionType);

module.exports = router;
