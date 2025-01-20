const express = require("express");
const { createTimeDeposit, getActiveTimeDeposits  } = require("../controllers/timeDepositController");

const router = express.Router();

router.post("/timedeposit", createTimeDeposit);
router.get("/active", getActiveTimeDeposits);


module.exports = router;
