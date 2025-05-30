const express = require("express");
const router = express.Router();
const { initiatePayment, handleCashfreeWebhook,verifyPayment,verifyOrderStatus } = require("../controller/paymentController");
router.post("/initiate", initiatePayment);
router.get("/paymentStatus", verifyOrderStatus );
router.post("/verifyPayment", verifyPayment);
router.post("/webhook", handleCashfreeWebhook);
module.exports = router;

