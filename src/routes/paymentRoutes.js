const express = require("express");
const router = express.Router();
const { initiatePayment, handleCashfreeWebhook,verifyPayment } = require("../controller/paymentController");
router.post("/initiate", initiatePayment);
router.post("/verifyPayment", verifyPayment);
router.post("/webhook", handleCashfreeWebhook);
module.exports = router;

