// const BookingModel = require("../models/bookingModel");
// const PartnerModel = require("../models/partnerModel");
// const PartnerRequestModel = require("../models/partnerRequestModel");

// const autoAssignFromBookingId = async (bookingId, maxDistanceInKm = 20) => {
//   try {
//     const booking = await BookingModel.findById(bookingId);
//     if (!booking) {
//       return { success: false, message: "Booking not found" };
//     }

//        const location = booking.location?.coordinates;
//     const serviceId = booking.serviceId;

//     if (!location || !serviceId) {
//       return { success: false, message: "Booking location or serviceId missing" };
//     }

//     // Step 1: Try auto assign
//     const autoPartner = await PartnerModel.findOne({
//       isDeleted: false,
//       isAvailable: true,
//       autoAssign: true,
//        services: serviceId,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: location },
//           $maxDistance: maxDistanceInKm * 1000,
//         },
//       },
//     });

//     if (autoPartner) {
//       booking.partnerId = autoPartner._id;
//       booking.status = "Progress";
//       await booking.save();

//       return {
//         success: true,
//         message: "Partner auto-assigned successfully",
//         data: booking,
//       };
//     }

//     // Step 2: Send request to nearest available partner
//     const nearestPartner = await PartnerModel.findOne({
//       isDeleted: false,
//       isAvailable: true,
//       services: serviceId,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: location },
//           $maxDistance: maxDistanceInKm * 1000,
//         },
//       },
//     });

//     if (!nearestPartner) {
//       return { success: false, message: "No partner found nearby" };
//     }

//     // Create a request
//     await PartnerRequestModel.create({
//       bookingId,
//       partnerId: nearestPartner._id,
//     });

//     return {
//       success: true,
//       message: "No auto-assign partner. Request sent to nearest partner",
//       data: { partnerId: nearestPartner._id },
//     };
//   } catch (error) {
//     console.error("autoAssignFromBookingId error:", error);
//     return {
//       success: false,
//       message: "Something went wrong while assigning partner",
//     };
//   }
// };


// module.exports = { autoAssignFromBookingId };


//new one
const CartModel = require("../models/cartModel");
const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");
const PartnerRequestModel = require("../models/partnerRequestModel");

const autoAssignFromBookingId = async (bookingId, maxDistanceInKm = 20000) => {
  try {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return { success: false, message: "Booking not found" };

    const location = booking.location?.coordinates;
    if (!location) return { success: false, message: "Booking location missing" };

    const cart = await CartModel.findById(booking.cartId).populate("items.serviceId", "name");

    if (!cart || !cart.items?.length) {
      return { success: false, message: "Cart not found or empty" };
    }

    const serviceIds = cart.items.map(item => item.serviceId._id.toString());

    // ✅ Step 1: Try to find ONE partner who can do all services
    const onePartnerForAll = await PartnerModel.findOne({
      isDeleted: false,
      isAvailable: true,
      autoAssign: true,
      services: { $all: serviceIds },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location },
          $maxDistance: maxDistanceInKm,
        },
      },
    });

    if (onePartnerForAll) {
      booking.partnerId = onePartnerForAll._id;
      booking.bookingStatus = "Progress";

      // Save all services under assignedPartners with one partner
      booking.assignedPartners = serviceIds.map(serviceId => ({
        serviceId,
        partnerId: onePartnerForAll._id,
      }));

      await booking.save();

      return {
        success: true,
        message: "All services assigned to one partner",
        data: booking,
      };
    }

    // ✅ Step 2: Assign nearest individual partners for each service
    const assignedPartners = [];
    for (const serviceId of serviceIds) {
      const partner = await PartnerModel.findOne({
        isDeleted: false,
        isAvailable: true,
        services: serviceId,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: location },
            $maxDistance: maxDistanceInKm,
          },
        },
      });

      if (partner) {
        assignedPartners.push({ serviceId, partnerId: partner._id });

        // Optional: Send request or notification to the assigned partner
      } else {
        // Optional: Create partner request if not found
        await PartnerRequestModel.create({
          bookingId,
          serviceId,
        });
      }
    }

    if (assignedPartners.length === 0) {
      return {
        success: false,
        message: "No partners found for any service",
      };
    }

    booking.assignedPartners = assignedPartners;
    booking.bookingStatus = "Progress";
    await booking.save();

    return {
      success: true,
      message: "Assigned multiple partners to services",
      data: booking,
    };
  } catch (error) {
    console.error("❌ autoAssignFromBookingId error:", error);
    return {
      success: false,
      message: "Something went wrong while assigning partners",
    };
  }
};
module.exports = { autoAssignFromBookingId };

