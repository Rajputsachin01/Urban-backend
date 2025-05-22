const express = require("express");
const router = express.Router();
const { initiatePayment, handleCashfreeWebhook } = require("../controller/paymentController");
router.post("/initiate", initiatePayment);
router.post("/webhook", handleCashfreeWebhook); // Uses raw body

module.exports = router;

