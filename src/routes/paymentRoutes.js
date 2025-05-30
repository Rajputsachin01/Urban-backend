const express = require("express");
const router = express.Router();
const {isAuth} = require("../utils/auth");

const { initiatePayment, handleCashfreeWebhook,verifyPayment,verifyOrderStatus,paymentListing } = require("../controller/paymentController");
router.post("/initiate", initiatePayment);
router.get("/paymentStatus", verifyOrderStatus );
router.post("/verifyPayment", verifyPayment);
router.post("/webhook", handleCashfreeWebhook);
router.post("/paymentListing",isAuth, paymentListing);
module.exports = router;

