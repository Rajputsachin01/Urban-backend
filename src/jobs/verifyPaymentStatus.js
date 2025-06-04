const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment");
const BookingModel = require("../models/bookingModel");
const { autoAssignFromBookingId } = require("../utils/autoAssignPartner");

// Optional helper to simplify logging
function logPaymentEvent(booking, logData) {
  booking.paymentLogs.push({
    ...logData,
    verifiedAt: logData.verifiedAt || new Date(),
  });
}

const runVerifyPaymentCron = () => {
  cron.schedule("*/100 * * * * *", async () => {
    console.log("[CRON] Running verifyPaymentStatusCron every 5 seconds");

    try {
      const today = moment().startOf("day").toDate();
      const tomorrow = moment().add(1, "day").startOf("day").toDate();

      const pendingBookings = await BookingModel.find({
        bookingStatus: { $in: ["Pending"] },
        isDeleted: false,
        date: { $gte: today, $lt: tomorrow },
        cashfreeOrderId: { $ne: null },
      });

      for (let booking of pendingBookings) {
        const orderId = booking.cashfreeOrderId;
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
          const response = await axios.get(url, { headers });
          const status = response?.data?.order_status;

          if (status === "PAID") {
            booking.paymentStatus = "paid";
            booking.bookingStatus = "Progress";
            const assignResult = await autoAssignFromBookingId(booking._id);
            console.log(`[CRON] Payment successful for ${orderId}. Auto-assigned:`, assignResult);
          } else if (["FAILED", "EXPIRED", "CANCELLED", "ACTIVE"].includes(status)) {
            booking.paymentStatus = "failed";
          }

          // Log verification details
          logPaymentEvent(booking, {
            type: "verify",
            cashfreeOrderId: orderId,
            status,
            message: `Order verification: status = ${status}`,
            requestPayload: { url },
            responsePayload: response.data,
          });

          await booking.save();
        } catch (err) {
          const errorMsg = err?.response?.data || err.message;

          logPaymentEvent(booking, {
            type: "verify",
            cashfreeOrderId: orderId,
            status: "error",
            message: `Verification error: ${errorMsg}`,
            requestPayload: { url },
            responsePayload: err?.response?.data,
          });

          console.error(`[Error] While verifying order ${orderId}:`, errorMsg);
          await booking.save(); // Save even if verification failed to store logs
        }
      }
    } catch (error) {
      console.error("[CRON ERROR] runVerifyPaymentCron:", error.message);
    }
  });
};

module.exports = runVerifyPaymentCron;
