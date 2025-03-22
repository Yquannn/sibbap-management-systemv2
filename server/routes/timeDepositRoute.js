const express = require("express");
const { createTimeDeposit, getActiveTimeDeposits, getMemberWithNoTimeDeposit, getTimeDepositorById  } = require("../controllers/timeDepositController");

const router = express.Router();

router.post("/timedeposit", createTimeDeposit);
router.get("/active", getActiveTimeDeposits);
router.get('/timedepositor', getMemberWithNoTimeDeposit);
router.get("/timedepositor/:memberId", getTimeDepositorById);
// router.put("/time-deposits/update-depositors", updateTimeDepositors);




module.exports = router;
