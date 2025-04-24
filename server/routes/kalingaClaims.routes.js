const express = require('express');
const router = express.Router();
const claimsController = require('../controllers/kalingaClaims.controller');

router.get('/kalinga/claims', claimsController.getAllClaims);
router.get('/kalinga/claims/:claim_id', claimsController.getClaimById);
router.get('/kalinga/claims/member/:member_id', claimsController.getMemberClaims);
router.get('/kalinga/claims/status/:status', claimsController.getClaimsByStatus);
router.post('/kalinga/claims', claimsController.createClaim);
router.put('/kalinga/claims/:claim_id/status', claimsController.updateClaimStatus);

module.exports = router;