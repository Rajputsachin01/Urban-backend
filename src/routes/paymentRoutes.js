const express = require("express");
const router = express.Router();
const { initiatePayment, handleCashfreeWebhook } = require("../controller/paymentController");
router.post("/initiate", initiatePayment);
module.exports = router;

