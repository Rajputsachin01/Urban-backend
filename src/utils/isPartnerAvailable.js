// utils/partnerAvailability.js
const BookingModel = require("../models/bookingModel");

/**
 * Check if the partner is free in the given time window
 * @param {ObjectId} partnerId 
 * @param {Date} startTime 
 * @param {Date} endTime 
 * @returns {Promise<boolean>}
 */
const isPartnerAvailableInTimeWindow = async (partnerId, startTime, endTime) => {
  const overlappingBooking = await BookingModel.findOne({
    partnerId,
    isDeleted: false,
    bookingStatus: { $in: ["Pending", "Progress"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
      {
        // If any booking fully covers the new one
        startTime: { $lte: startTime },
        endTime: { $gte: endTime },
      },
    ],
  });

  return !overlappingBooking;
};

module.exports = { isPartnerAvailableInTimeWindow };
