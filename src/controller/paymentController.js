const axios = require("axios");
const crypto = require("crypto");
const BookingModel = require("../models/bookingModel");
const Helper = require("../utils/helper");
const autoAssignFromBookingId = require("../utils/autoAssignPartner");

const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log(
      "[Step 1] Received initiatePayment request, bookingId:",
      bookingId
    );

    if (!bookingId) {
      console.error("[Error] Missing bookingId in request body");
      return Helper.fail(res, "Booking ID is required");
    }

    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    })
      .populate("userId", "email phoneNo")
      .select("totalPrice userId paymentLogs paymentStatus");

    if (!booking) {
      console.error(`[Error] Booking not found for bookingId: ${bookingId}`);
      return Helper.fail(res, "Booking not found");
    }

    console.log("[Step 2] Booking found:", booking._id.toString());

    const amount = parseFloat(booking.totalPrice);
    const email = booking.userId?.email;
    const phoneNo = (booking.userId?.phoneNo || "9999999999").toString();

    if (!email) {
      console.error(`[Error] User email missing for bookingId: ${bookingId}`);
      return Helper.fail(res, "User email not found");
    }

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
        return_url: `${process.env.BACKEND_URL}/v1/payment/paymentStatus?order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/v1/payment/webhook`,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      "x-api-version": "2022-01-01",
    };

    console.log(
      "[Step 3] Sending create order request to Cashfree with payload:",
      JSON.stringify(payload, null, 2)
    );
    const response = await axios.post(baseUrl, payload, { headers });
    const orderData = response.data;
   

    if (!orderData?.order_token || !orderData?.order_id) {
      console.error(
        "[Error] Missing order_token or order_id in Cashfree response"
      );
      return Helper.fail(res, "Cashfree order creation failed");
    }

    // console.log("[Step 4] Verifying order status for orderId:", orderData.order_id);
    // let orderStatusInfo;
    // try {
    //   orderStatusInfo = await verifyOrderStatus(orderData.order_id);
    //   console.log("[Step 4.1] Order status verified:", JSON.stringify(orderStatusInfo, null, 2));
    // } catch (error) {
    //   console.error("[Error] Failed to verify order status:", error.response?.data || error.message);
    //   return Helper.fail(res, "Order verification failed");
    // }

    // const cashfreeStatus = orderStatusInfo?.order_status || "UNKNOWN";
    // console.log("[Step 4.2] Cashfree order status:", cashfreeStatus);

    // let internalStatus = "pending";
    // if (cashfreeStatus === "PAID") internalStatus = "paid";
    // else if (cashfreeStatus === "ACTIVE") internalStatus = "pending";
    // else if (["FAILED", "EXPIRED", "CANCELLED"].includes(cashfreeStatus)) internalStatus = "failed";

    // console.log(`[Step 5] Mapped internal payment status: ${internalStatus}`);

    // let assignResult = { success: false, message: "Not attempted", data: null };
    // if (internalStatus === "paid") {
    //   console.log("[Step 6] Payment is PAID, attempting partner auto-assignment");
    //   try {
    //     assignResult = await autoAssignFromBookingId(bookingId);
    //     console.log("[Step 6.1] Partner auto-assignment result:", assignResult);
    //   } catch (assignError) {
    //     console.error("[Error] Auto-assign partner failed:", assignError.message);
    //     assignResult = { success: false, message: assignError.message, data: null };
    //   }
    // } else {
    //   console.log("[Step 6] Payment not PAID, skipping partner assignment");
    // }

    // console.log("[Step 7] Updating booking payment status, logs, and Cashfree orderId");

    // // 🟡 Extra Logs to Check What’s Being Updated
    // console.log("[DEBUG] Base Cashfree status:", cashfreeStatus);
    // console.log("[DEBUG] Mapping to internal paymentStatus:", internalStatus);

    // booking.cashfreeOrderId = orderId;
    // booking.paymentStatus = internalStatus;
    booking.paymentLogs.push({
      initiatedAt: new Date(),
      type: "initiate",
      cashfreeOrderId: orderId,
      requestPayload: payload,
      responsePayload: orderData,
      // verifiedStatus: cashfreeStatus,
      // autoAssignSuccess: assignResult.success,
      // autoAssignMessage: assignResult.message,
      // autoAssignData: assignResult.data || null,
    });

    await booking.save();
    console.log("[Step 7.1] Booking updated successfully");

    return Helper.success(res, "Order created, awaiting payment", {
      order_id: orderData.order_id,
      order_token: orderData.order_token,
      payment_link: orderData.payment_link,
      bookingId,
    });
  } catch (error) {
    console.error("[Error] initiatePayment failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Helper.fail(res, "Failed to create or verify Cashfree order");
  }
};

const verifyOrderStatus = async (req, res) => {
  console.log(req.query, "main Redirect");
  const orderId = req.query.order_id;
  console.log("test Redirect");
  const isSandbox = process.env.CASHFREE_ENV === "SANDBOX";
  const url = isSandbox
    ? `https://sandbox.cashfree.com/pg/orders/${orderId}`
    : `https://api.cashfree.com/pg/orders/${orderId}`;

  const headers = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
    "x-api-version": "2022-01-01",
  };

  try {
    console.log("[verifyOrderStatus] Fetching status from:", url);
    const response = await axios.get(url, { headers });
    console.log(
      "[verifyOrderStatus] Status response:",
      JSON.stringify(response.data, null, 2)
    );
    if (response?.data?.order_status == "paid") {
      return Helper.success(res, "payment success");
    } else if (response?.order_status == "Active") {
      return Helper.success(res, "payment Failed");
    }
  } catch (error) {
    console.error(
      "[verifyOrderStatus] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//not in use
const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "Booking ID is required");

    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    }).select("cashfreeOrderId paymentStatus totalPrice paymentLogs");

    if (!booking) return Helper.fail(res, "Booking not found");

    if (!booking.cashfreeOrderId) {
      return Helper.fail(res, "Cashfree Order ID not found for this booking");
    }

    const isSandbox = process.env.CASHFREE_ENV === "SANDBOX";
    const baseUrl = isSandbox
      ? "https://sandbox.cashfree.com/pg/orders/"
      : "https://api.cashfree.com/pg/orders/";

    const headers = {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      "x-api-version": "2022-01-01",
    };

    const response = await axios.get(`${baseUrl}${booking.cashfreeOrderId}`, {
      headers,
    });

    const order = response.data;

    // Push verification log
    booking.paymentLogs.push({
      verifiedAt: new Date(),
      type: "verify",
      cashfreeOrderId: booking.cashfreeOrderId,
      responsePayload: order,
    });

    if (order.order_status === "PAID") {
      booking.paymentStatus = "PAID";
      await booking.save();

      return Helper.success(res, "Payment verified successfully", {
        order_id: order.order_id,
        amount: order.order_amount,
        status: order.order_status,
      });
    } else {
      await booking.save(); // Save log even if not paid
      return Helper.fail(
        res,
        `Payment not completed. Status: ${order.order_status}`
      );
    }
  } catch (err) {
    console.error("Payment Verification Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });

    return Helper.fail(res, "Failed to verify payment");
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
module.exports = {
  initiatePayment,
  verifyPayment,
  handleCashfreeWebhook,
  verifyOrderStatus,
};
