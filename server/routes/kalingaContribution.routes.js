// routes/kalingaContribution.routes.js
const express = require('express');
const router = express.Router();
const contributionsController = require('../controllers/kalingaContribution.controller');

router.get('/kalinga/contributions', contributionsController.getAllContributions);
// Move the more specific route before the generic parameter route
router.get('/kalinga/contributions/member/:member_id', contributionsController.getMemberContributions);
router.get('/kalinga/contributions/:contribution_id', contributionsController.getContributionById);
router.post('/kalinga/contributions', contributionsController.createContribution);

module.exports = router;