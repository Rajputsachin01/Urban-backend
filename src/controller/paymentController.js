const axios = require("axios");
const crypto = require("crypto");
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper");

const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "Booking ID is required");

    const booking = await BookingModel.findOne({ _id: bookingId, isDeleted: false })
      .populate("userId", "email phoneNo")
      .select("totalPrice userId");

    if (!booking) return Helper.fail(res, "Booking not found");

    const amount = parseFloat(booking.totalPrice);
    const email = booking.userId?.email;
const phoneNo = (booking.userId?.phoneNo || "9999999999").toString();

    if (!email) return Helper.fail(res, "User email not found");

    const orderId = `ORDER_${bookingId}_${Date.now()}`;

    const isSandbox = process.env.CASHFREE_ENV === "SANDBOX";
    const baseUrl = isSandbox
      ? "https://sandbox.cashfree.com/pg/orders"
      : "https://api.cashfree.com/pg/orders";

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: booking.userId._id.toString(),
        customer_email: email,
        customer_phone: phoneNo,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}?order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/v1/payment/webhook`,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      "x-api-version": "2022-01-01",
    };

    const response = await axios.post(baseUrl, payload, { headers });
    const orderData = response.data;

    if (!orderData || !orderData.order_token || orderData.order_status !== "ACTIVE") {
      return Helper.fail(res, "Cashfree order creation failed");
    }

    // Save order ID
    booking.cashfreeOrderId = orderId;
    await booking.save();

    return Helper.success(res, "Cashfree order created", {
      order_id: orderData.order_id,
      order_token: orderData.order_token,
      payment_link: orderData.payment_link,
      bookingId,
    });
  } catch (err) {
    console.error("Cashfree Order Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    return Helper.fail(res, "Failed to create Cashfree order");
  }
};

// adjust path as per your project

// Signature verification function
const verifyCashfreeSignature = (rawBody, signature, secret) => {
  if (!rawBody || !signature || !secret) return false;

  // rawBody is Buffer, pass as is
  const generated = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  return generated === signature;
};

const handleCashfreeWebhook = async (req, res) => {
  try {
    const rawBody = req.body; // should be Buffer due to express.raw()
    if (!Buffer.isBuffer(rawBody)) {
      console.warn("⚠️ Raw body is not a buffer!");
      return Helper.fail(res, "❌ Invalid raw body format");
    }

    const signature = req.headers["x-webhook-signature"];
    if (!signature) {
      return Helper.fail(res, "❌ Missing webhook signature");
    }

    const secret = process.env.CASHFREE_CLIENT_SECRET;
    if (!secret) {
      console.error("🚨 CASHFREE_CLIENT_SECRET not set in environment");
      return Helper.error(res, "🚨 Server configuration error");
    }

    // Verify signature using helper function
    const isValid = verifyCashfreeSignature(rawBody, signature, secret);

    if (!isValid) {
      console.warn("❌ Invalid webhook signature");
      console.log("Received Signature:", signature);
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("base64");
      console.log("Generated Signature:", generatedSignature);

      return Helper.fail(res, "❌ Invalid webhook signature");
    }

    // Parse the payload safely
    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf-8"));
    } catch (parseErr) {
      console.error("❌ Failed to parse webhook payload:", parseErr.message);
      return Helper.fail(res, "❌ Invalid JSON payload");
    }

    console.log("✅ Webhook verified and parsed:", payload);


    return res.status(200).send("✅ Webhook received and verified");
  } catch (error) {
    console.error("🚨 Webhook processing error:", error);
    return Helper.error(res, "🚨 Webhook Internal Error");
  }
};






// const handleCashfreeWebhook = async (req, res) => {
//   try {
//     const rawBody = req.body; // Buffer from raw parser
//     const signature = req.headers["x-webhook-signature"];
//     if (!signature) return Helper.fail(res, "Missing webhook signature");

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
//       .update(rawBody)
//       .digest("base64");

//     console.log("Received signature:", signature);
//     console.log("Generated signature:", generatedSignature);

//     if (generatedSignature !== signature) {
//       console.warn("❌ Invalid signature");
//       return Helper.fail(res, "Invalid webhook signature");
//     }

//     const parsed = JSON.parse(rawBody.toString("utf-8"));
//     console.log("Parsed payload:", parsed);

//     // rest of your logic here
//   } catch (error) {
//     console.error("Webhook error:", error);
//     return Helper.error(res, "Internal Server Error");
//   }
// };
//new one
// const handleCashfreeWebhook = async (req, res) => {
//   try {
//     const rawBody = req.body;
//     const signature = req.headers["x-webhook-signature"];

//     if (!signature) return Helper.fail(res, "Missing webhook signature");

//     // Check if rawBody is a buffer
//     if (!Buffer.isBuffer(rawBody)) {
//       console.error("Webhook raw body is not a buffer");
//       return Helper.fail(res, "Invalid payload format");
//     }

//     // Generate signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
//       .update(rawBody)
//       .digest("base64");

//     console.log("Received signature:", signature);
//     console.log("Generated signature:", generatedSignature);

//     // Verify signature
//     if (generatedSignature !== signature) {
//       console.warn("❌ Invalid signature");
//       return Helper.fail(res, "Invalid webhook signature");
//     }

//     // Parse payload
//     const parsed = JSON.parse(rawBody.toString("utf-8"));
//     console.log("✅ Webhook payload verified:", parsed);

  

//     return res.status(200).send("Webhook received");
//   } catch (error) {
//     console.error("Webhook error:", error);
//     return Helper.error(res, "Internal Server Error");
//   }
// };









module.exports = {
  initiatePayment,
  handleCashfreeWebhook,
};
