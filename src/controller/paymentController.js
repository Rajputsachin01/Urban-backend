const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper"); // Optional: if using standardized responses

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "Booking ID is required");

    const booking = await BookingModel.findOne({ _id: bookingId, isDeleted: false })
      .populate("userId", "email")
      .select("totalPrice userId");

    if (!booking) return Helper.fail(res, "Booking not found");

    const amount = Math.round(booking.totalPrice * 100); // to paise
    const email = booking.userId?.email;

    if (!email) return Helper.fail(res, "User email not found");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        bookingId: bookingId.toString(),
      },
    });

    return Helper.success(res, "Checkout session created", { url: session.url });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    return Helper.fail(res, "Failed to create checkout session");
  }
};

// Stripe Webhook Handler (rawBody required)
const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret); // ✅ USE rawBody not body
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await BookingModel.findByIdAndUpdate(bookingId, {
        paymentStatus: "Paid",
        stripePaymentId: session.payment_intent,
        paymentDetails: {
          sessionId: session.id,
          amountPaid: session.amount_total / 100,
          method: "Stripe",
        },
      });
    }
  }

  return res.status(200).json({ received: true });
};

module.exports = {
  createCheckoutSession,
  stripeWebhookHandler,
};
