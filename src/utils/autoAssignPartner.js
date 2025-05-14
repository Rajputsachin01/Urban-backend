const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");

const autoAssignFromBookingId = async (bookingId, maxDistanceInKm = 20) => {
  try {
    const booking = await BookingModel.findById(bookingId).populate("userId");
    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    const location = booking.location?.coordinates;
    if (!location) {
      return { success: false, message: "Booking location not found" };
    }

    const nearestPartner = await PartnerModel.findOne({
      isDeleted: false,
      isAvailable: true,
      autoAssign: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location,
          },
          $maxDistance: maxDistanceInKm * 1000,
        },
      },
    });

    if (!nearestPartner) {
      return { success: false, message: "No partner found nearby" };
    }

    // Update booking
    booking.partnerId = nearestPartner._id;
    booking.status = "assigned";
    await booking.save();

    return {
      success: true,
      message: "Partner auto-assigned successfully",
      data: booking,
    };
  } catch (error) {
    console.error("autoAssignFromBookingId error:", error);
    return {
      success: false,
      message: "Something went wrong while assigning partner",
    };
  }
};

module.exports = { autoAssignFromBookingId };
