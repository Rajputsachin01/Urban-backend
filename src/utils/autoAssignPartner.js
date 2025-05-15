const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");
const PartnerRequestModel = require("../models/partnerRequestModel");

const autoAssignFromBookingId = async (bookingId, maxDistanceInKm = 20) => {
  try {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    const location = booking.location?.coordinates;
    if (!location) {
      return { success: false, message: "Booking location not found" };
    }

    // Step 1: Try auto assign
    const autoPartner = await PartnerModel.findOne({
      isDeleted: false,
      isAvailable: true,
      autoAssign: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location },
          $maxDistance: maxDistanceInKm * 1000,
        },
      },
    });

    if (autoPartner) {
      booking.partnerId = autoPartner._id;
      booking.status = "Progress";
      await booking.save();

      return {
        success: true,
        message: "Partner auto-assigned successfully",
        data: booking,
      };
    }

    // Step 2: Send request to nearest available partner
    const nearestPartner = await PartnerModel.findOne({
      isDeleted: false,
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location },
          $maxDistance: maxDistanceInKm * 1000,
        },
      },
    });

    if (!nearestPartner) {
      return { success: false, message: "No partner found nearby" };
    }

    // Create a request
    await PartnerRequestModel.create({
      bookingId,
      partnerId: nearestPartner._id,
    });

    return {
      success: true,
      message: "No auto-assign partner. Request sent to nearest partner",
      data: { partnerId: nearestPartner._id },
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
