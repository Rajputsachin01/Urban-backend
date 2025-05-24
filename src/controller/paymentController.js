const axios = require("axios");
const crypto = require("crypto");
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper");
const { InventoryConfigurationFilterSensitiveLog } = require("@aws-sdk/client-s3");

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

// Signature verify helper
const verifyCashfreeSignature = (rawBody, signature, secret) => {
  const generated = crypto
    .createHmac("sha256", secret)
    .update(rawBody) // raw buffer
    .digest("base64");
  return generated === signature;
};

const handleCashfreeWebhook = async (req, res) => {
  console.log("i just hitted");
  // try {
  //   const rawBody = req.body; // raw buffer
  //   console.log(rawBody,"hello");
  //   const signature = req.headers["x-cf-signature"];

  //   const parsed = JSON.parse(rawBody.toString());

  //   const isValid = verifyCashfreeSignature(rawBody, signature, process.env.CASHFREE_CLIENT_SECRET);
  //   if (!isValid) {
  //     console.warn("Invalid Cashfree webhook signature");
  //     return Helper.fail(res, "Invalid webhook signature");
  //   }

  //   const { order_id, order_status, payment_mode, payment_group, payment_id } = parsed;

  //   if (!order_id || !payment_id) {
  //     return Helper.fail(res, "Invalid payload");
  //   }

  //   const bookingId = order_id.split("_")[1];

  //   const booking = await BookingModel.findOne({ _id: bookingId, isDeleted: false });
  //   if (!booking) {
  //     return Helper.fail(res, "Booking not found");
  //   }

  //   if (order_status === "PAID") {
  //     booking.paymentStatus = "paid";
  //     booking.paymentMode = payment_mode || payment_group;
  //     booking.cashfreePaymentId = payment_id;
  //     booking.cashfreeOrderId = order_id;
  //   } else {
  //     booking.paymentStatus = "failed";
  //   }

  //   await booking.save();

  //   console.log("✅ Webhook processed successfully");
  //   return Helper.success(res, "Webhook processed");
  // } catch (error) {
  //   console.error("❌ Webhook Error:", error.message);
  //   return Helper.error(res, "Internal Server Error");
  // }
};


module.exports = {
  initiatePayment,
  handleCashfreeWebhook,
};
