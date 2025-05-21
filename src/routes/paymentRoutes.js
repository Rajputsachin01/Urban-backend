// // routes/paymentRoutes.js
// const express = require("express");
// const router = express.Router();
// const paymentController = require("../controller/paymentController");

// // To create Stripe Checkout Session (instead of intent)
// router.post("/create-intent", paymentController.createCheckoutSession); // ✅ Replace with new controller

// // To handle Stripe webhook (raw body required)
// router.post("/webhook", express.raw({ type: "application/json" }), paymentController.stripeWebhookHandler);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { createCheckoutSession, stripeWebhookHandler } = require("../controller/paymentController");

router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", stripeWebhookHandler); // Uses raw body

module.exports = router;

