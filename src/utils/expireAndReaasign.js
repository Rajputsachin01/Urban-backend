const PartnerRequestModel = require("../models/partnerRequestModel");
const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");

const expireAndReassign = async () => {
  const expiryMinutes = 10;
  const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

  const expiredRequests = await PartnerRequestModel.find({
    status: "pending",
    createdAt: { $lte: expiryTime },
    isDeleted: false,
  });

  for (const request of expiredRequests) {
    request.status = "expired";
    await request.save();

    const booking = await BookingModel.findById(request.bookingId);
    if (!booking || booking.partnerId) continue;

    const lastPartnerId = request.partnerId;

    const nextPartner = await PartnerModel.findOne({
      _id: { $ne: lastPartnerId },
      isDeleted: false,
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: booking.location.coordinates,
          },
          $maxDistance: 20 * 1000, // 20 km
        },
      },
    });

    if (!nextPartner) {
      // No available partner
      console.log("No new partner found for booking:", booking._id);
      continue;
    }

    // Create a new request
    await PartnerRequestModel.create({
      bookingId: booking._id,
      partnerId: nextPartner._id,
    });

    console.log("New request sent to:", nextPartner._id, "for booking:", booking._id);
  }
};

module.exports = expireAndReassign;
