// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper");

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "bookingId is required");

    const booking = await BookingModel.findOne({ _id: bookingId, isDeleted: false })
      .populate("userId", "email")
      .select("totalPrice userId");

    if (!booking) return Helper.fail(res, "Booking not found");

    const amount = Math.round(booking.totalPrice * 100); // Convert to paise (INR)
    const email = booking.userId?.email;

    if (!email) return Helper.fail(res, "User email not found");

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Booking #${bookingId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { bookingId: bookingId.toString() },
    });

    return Helper.success(res, "Checkout session created", {
      url: session.url,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to create checkout session");
  }
};

// Stripe Webhook (same as before)
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await BookingModel.findByIdAndUpdate(bookingId, {
          paymentStatus: "paid",
          stripePaymentId: session.payment_intent,
        });
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook processing failed.", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
};
