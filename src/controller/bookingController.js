const BookingModel = require("../models/bookingModel");
const PartnerModel = require("../models/partnerModel");
const UserModel = require("../models/userModel");
const Helper = require("../utils/helper");
const moment = require("moment");
const { autoAssignFromBookingId } = require("../utils/autoAssignPartner");
// helper function  for time slot
const generateTimeSlots = (startTime, endTime, duration) => {
  if (
    !moment(startTime, "HH:mm", true).isValid() ||
    !moment(endTime, "HH:mm", true).isValid()
  ) {
    throw new Error("Invalid time format. Use HH:mm format.");
  }
  if (duration <= 0) {
    throw new Error("Duration must be greater than 0.");
  }

  const slots = [];
  let start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");

  while (start.clone().add(duration, "minutes").isSameOrBefore(end)) {
    const slotStart = start.format("hh:mm A");
    const slotEnd = start.clone().add(duration, "minutes").format("hh:mm A");
    slots.push(`${slotStart} - ${slotEnd}`);
    start.add(duration, "minutes");
  }

  return slots;
};
// initiate Booking
const initiateBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { serviceId, subCategoryId, unitQuantity } = req.body;

    if (!userId) return Helper.fail(res, "user id is required");
    if (!serviceId) return Helper.fail(res, "service id is required");
    if (!subCategoryId) return Helper.fail(res, "subCategoryId id is required");
    if (!unitQuantity || unitQuantity <= 0) return Helper.fail(res, "Valid unit quantity is required");

    // Step 1: Fetch user details (address[0] and location)
    const user = await UserModel.findById(userId).select("address location");
    if (!user) return Helper.fail(res, "User not found");

    const userAddress = user.address?.[0];
    if (!userAddress) return Helper.fail(res, "User has no saved address");

    const userLocation = user.location;
    if (
      !userLocation ||
      userLocation.type !== "Point" ||
      !Array.isArray(userLocation.coordinates) ||
      userLocation.coordinates.length !== 2
    ) {
      return Helper.fail(res, "Invalid user location");
    }

    // Step 2: Create booking with user's address and location
    const booking = await BookingModel.create({
      userId,
      serviceId,
      subCategoryId,
      unitQuantity,
      address: userAddress,
      location: userLocation,
    });

    if (!booking) return Helper.fail(res, "Booking not initiated");

    // Step 3: Calculate price
    const cservicePrice = await BookingModel.findOne({
      serviceId,
      _id: booking._id,
    }).populate("serviceId", "price");

    const unitPrice = servicePrice?.serviceId?.price || 0;
    const finalPrice = unitQuantity * unitPrice;
    const discountAmount = booking.discountAmount || 0;
    const totalPrice = finalPrice - discountAmount;

    booking.price = finalPrice;
    booking.totalPrice = totalPrice;

    await booking.save();

    return Helper.success(res, "Booking initiated successfully", booking);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to initiate booking");
  }
};
// get location and address
const getLocationAndAddress = async (req, res) => {
  try {
    const { location, address, bookingId } = req.body;
    if (!bookingId) {
      return Helper.fail(res, "bookingId is required");
    }
    if (!location) {
      return Helper.fail(res, "location is required");
    }
    if (!address) {
      return Helper.fail(res, "address is required");
    }
    const setLocation = await BookingModel.findOneAndUpdate(
      { _id: bookingId, isDeleted: false },
      { $set: { location, address } },
      { new: true }
    );
    if (!setLocation) {
      return Helper.fail(res, "Booking not found or already deleted");
    }
    return Helper.success(
      res,
      "Booking location and address updated",
      setLocation
    );
  } catch (error) {
    return Helper.fail(res, "failed to add location and address");
  }
};
// fetch the time slot between 9:00 AM to 6:00 PM
const fetchTimeSlots = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return Helper.fail(res, "Booking ID is required");
    }
    // Fetch booking and populate the service to get the time
    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    }).populate("serviceId", "time");

    if (!booking || !booking.serviceId || !booking.serviceId.time) {
      return Helper.fail(res, "Service time not found in booking");
    }
    const serviceTime = booking.serviceId.time; // e.g. 30 (minutes)
    const businessStart = process.env.BUSINESS_START_TIME;
    const businessEnd = process.env.BUSINESS_END_TIME;
    const timeSlots = generateTimeSlots(
      businessStart,
      businessEnd,
      serviceTime
    );
    return Helper.success(res, "Time slots generated", timeSlots);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to generate time slots");
  }
};

// select date and time slot and saved in booking

const selectDateAndTimeslot = async (req, res) => {
  try {
    const { date, timeSlot, bookingId } = req.body;
    if (!bookingId) return Helper.fail(res, "bookingId is required");
    if (!date) return Helper.fail(res, "date is required");
    if (!timeSlot) return Helper.fail(res, "timeSlot is required");

    const dateAndTime = await BookingModel.findOneAndUpdate(
      { _id: bookingId, isDeleted: false },
      { $set: { date, timeSlot } },
      { new: true }
    );

    if (!dateAndTime) {
      return Helper.fail(res, "Booking not found or already deleted");
    }
    const assignResult = await autoAssignFromBookingId(bookingId);

    if (!assignResult.success) {
      return Helper.fail(
        res,
        "Date/time updated but partner not assigned: " + assignResult.message,
        dateAndTime
      );
    }

    return Helper.success(
      res,
      "Booking date and time updated, partner auto-assigned",
      assignResult.data
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to add date and time slot");
  }
};

// find booking by id
const findBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return Helper.fail(res, "booking id is required");
    }
    const booking = await BookingModel.findOne({
      _id: bookingId,
      isDeleted: false,
    })
      .select(
        "-userId -serviceId -categoryId  -isDeleted -createdAt -updatedAt -__v"
      )
      .populate("serviceId", "name -_id")
      .populate("categoryId", "name -_id");
    if (!booking || booking.length === 0) {
      return Helper.fail(res, "booking not found");
    }
    return Helper.success(res, "booking found successfully", booking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};
// update booking
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { address, location, date, timeSlot } = req.body;
    const query = {};
    if (address) {
      query.address = address;
    }
    if (location) {
      query.location = location;
    }
    if (date) {
      query.date = date;
    }
    if (timeSlot) {
      query.timeSlot = timeSlot;
    }
    const update = await BookingModel.findByIdAndUpdate(bookingId, query, {
      new: true,
    });
    if (!update) {
      return Helper.fail(res, "failed to update");
    }
    return Helper.success(res, "booking updated successfull", update);
  } catch (error) {
    return Helper.fail(res, "failed to update");
  }
};
// soft delete booking
const removeBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return Helper.fail(res, "booking id is required");
    }
    const deleted = await BookingModel.findByIdAndUpdate(
      { _id: bookingId },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "booking not deleted");
    }
    return Helper.success(res, "booking deleted succesfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to delete");
  }
};
// fetch the bookings for user
const fetchUserBooking = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return Helper.fail(res, "user id is required");
    }
    const userbookings = await BookingModel.find({
      userId,
      isDeleted: false,
    }).select(
      "-_id -serviceId -categoryId -paymentMode -isDeleted -createdAt -updatedAt -paymentStatus -__v"
    );
    if (!userbookings) {
      return Helper.fail(res, "no booking for the user");
    }
    return Helper.success(res, "bookings fetched successfully", userbookings);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch");
  }
};
// booking history and pending
const userBookingHistoryOrPending = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.body;
    if (!type) {
      return Helper.fail(res, "type is required");
    }
    if (!userId) {
      return Helper.fail(res, "user id is required");
    }
    let query;
    if (type === "history" || type === "History") {
      // query = { isDeleted: false, bookingStatus: "Cancelled" || "Completed" }
      query = {
        isDeleted: false,
        bookingStatus: { $in: ["Cancelled", "Completed"] },
      };
    }
    if (type === "pending" || type === "Pending") {
      query = {
        isDeleted: false,
        bookingStatus: { $in: ["Pending", "Cancelled", "Progress"] },
      };
    }
    const result = await BookingModel.find({ userId, ...query })
      .select("-createdAt -updatedAt -isDeleted -__v")
      .populate("userId", "email phoneNo -_id ")
      .populate("serviceId", "name price -_id")
      .populate("subCategoryId", "name price -_id")
      .populate("partnerId", "name phoneNo -_id");
    if (!result) {
      return Helper.fail(res, "no result available");
    }
    return Helper.success(res, "result fetched", result);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch result");
  }
};
// cancel booking
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      return Helper.fail(res, "booking id is required");
    }
    const updateBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "Cancelled" },
      { new: true }
    );
    if (!updateBooking || updateBooking.length === 0) {
      return Helper.fail(res, "Failed to Cancel booking!");
    }
    return Helper.success(res, "booking cancelled successfully", updateBooking);
  } catch (error) {
    return Helper.fail(res, error.message);
  }
};

// fetch all users who have booking
const usersBookingListing = async (req, res) => {
  try {
    const { limit = 3, page = 1 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let matchStage = { isDeleted: false };
    const userBookedList = await BookingModel.find(matchStage)
      .populate("userId", "name email phoneNo ")
      .skip(skip)
      .limit(parseInt(limit));
    const totalBookedUsers = await BookingModel.countDocuments(matchStage);
    if (userBookedList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users booking found matching the criteria",
      });
    }
    const data = {
      users: userBookedList,
      pagination: {
        totalBookedUsers,
        totalPages: Math.ceil(totalBookedUsers / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };

    return Helper.success(res, "users listing fetched", data);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to fetch users booking listing");
  }
};
// Auto-assign partner based on user's location
// const autoAssignPartner = async (req, res) => {
//   try {
//     const { bookingId } = req.body;
//     const booking = await BookingModel.findById(bookingId).populate("userId");
//     if (!booking) return Helper.fail(res, "Booking not found");

//     const user = booking.userId;
//     if (!user || !user.location || !user.location.coordinates) {
//       return Helper.fail(res, "User location not found");
//     }

//     const nearestPartner = await PartnerModel.findOne({
//       isDeleted: false,
//       autoAssign: true,
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             //   coordinates: user.location.coordinates,
//             coordinates: booking.location.coordinates,
//           },
//           $maxDistance: 10000, // in meters (10 km)
//         },
//       },
//     });

//     if (!nearestPartner) {
//       return Helper.fail(res, "No auto-assign partner found nearby");
//     }

//     booking.partnerId = nearestPartner._id;
//     booking.status = "assigned";
//     await booking.save();

//     return Helper.success(res, "Partner auto-assigned successfully", booking);
//   } catch (err) {
//     console.error(err);
//     return Helper.error(res, "Something went wrong");
//   }
// };

const autoAssignPartner = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const result = await autoAssignFromBookingId(bookingId);

    if (!result.success) {
      return Helper.fail(res, result.message);
    }

    return Helper.success(res, result.message, result.data);
  } catch (err) {
    console.error(err);
    return Helper.error(res, "Something went wrong");
  }
};
// Get sorted list of nearby partners for manual assignment (admin - based on bookingId)
const getNearbyPartners = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await BookingModel.findById(bookingId).populate("userId");
    if (!booking) return Helper.fail(res, "Booking not found");

    const user = booking.userId;
    const serviceId = booking.serviceId;

    if (!user || !user.location || !user.location.coordinates) {
      return Helper.fail(res, "User location not found");
    }

    if (!serviceId) {
      return Helper.fail(res, "Service ID not found in booking");
    }

    const partners = await PartnerModel.find({
      isDeleted: false,
      services: serviceId, // 🔥 only those who provide this service
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: booking.location.coordinates, // or user.location.coordinates
          },
          $maxDistance: 20000, // 20 km
        },
      },
    });

    return Helper.success(
      res,
      "Nearby partners for the service fetched successfully",
      partners
    );
  } catch (err) {
    console.error(err);
    return Helper.error(res, "Failed to fetch partners");
  }
};
// Admin manually assigns a partner to booking
const assignPartnerManually = async (req, res) => {
  try {
    const { bookingId, partnerId } = req.body;

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return Helper.fail(res, "Booking not found");

    const partner = await PartnerModel.findById(partnerId);
    if (!partner || partner.isDeleted) {
      return Helper.fail(res, "Invalid or deleted partner");
    }

    booking.partnerId = partnerId;
    booking.status = "assigned";
    await booking.save();

    return Helper.success(res, "Partner assigned successfully", booking);
  } catch (err) {
    console.error(err);
    return Helper.error(res, "Failed to assign partner");
  }
};

const bookingListing = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", bookingStatus } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Base match
    const matchStage = {
      isDeleted: false,
    };

    if (bookingStatus) {
      matchStage.bookingStatus = bookingStatus;
    }

    // Aggregation Pipeline
    const pipeline = [
      { $match: matchStage },
      // Populate references
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "partners",
          localField: "partnerId",
          foreignField: "_id",
          as: "partner",
        },
      },
      { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    ];

    // Add search if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "category.name": { $regex: search, $options: "i" } },
            { "service.name": { $regex: search, $options: "i" } },
            { "partner.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await BookingModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitVal });

    // Final result
    const bookings = await BookingModel.aggregate(pipeline);

    return Helper.success(res, "Booking list fetched successfully", {
      total,
      page: parseInt(page),
      limit: limitVal,
      totalPages: Math.ceil(total / limitVal),
      bookings,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  initiateBooking,
  getLocationAndAddress,
  fetchTimeSlots,
  selectDateAndTimeslot,
  findBookingById,
  autoAssignPartner,
  getNearbyPartners,
  assignPartnerManually,
  removeBooking,
  updateBooking,
  fetchUserBooking,
  userBookingHistoryOrPending,
  cancelBooking,
  usersBookingListing,
bookingListing
  
};
