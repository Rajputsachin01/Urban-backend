const BookingModel = require("../models/bookingModel")
const PartnerModel = require("../models/partnerModel")
const Helper = require("../utils/helper")
const moment = require("moment");
// helper function  for time slot
const generateTimeSlots = (startTime, endTime, duration) => {
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
const initiateBooking = async (req, res) =>{
    try {
        const userId = req.userId
        const { serviceId, categoryId, unitQuantity } = req.body
        if(!userId){
            return Helper.fail(res, "user id is required")
        }
        if(!serviceId){
            return Helper.fail(res, "service id is required")
        }
        if(!categoryId){
            return Helper.fail(res, "category id is required")
        }
        if (!unitQuantity || unitQuantity <= 0)
            return Helper.fail(res, "Valid unit quantity is required")
        const booking = await BookingModel.create({
            userId,
            serviceId,
            categoryId,
            unitQuantity
        }) 
        if(!booking){
            return Helper.fail(res, "booking not initiate")
        }
        const categoryPrice = await BookingModel.findOne({categoryId: categoryId, _id: booking._id})
        .populate("categoryId", "price")
        const calculatePrice = categoryPrice.categoryId.price
        const finalPrice = unitQuantity*calculatePrice
        // remaining: need to fetch the discount amount
        const totalPrice = finalPrice - booking.discountAmount
        booking.totalPrice = totalPrice
        booking.price = finalPrice;
        await booking.save();
        return Helper.success(res, "booking intiated", booking)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to booking initiate")
    }
}
// get location and address
const getLocationAndAddress = async (req, res) =>{
    try {
        const { location , address, bookingId } = req.body
        if(!bookingId){
            return Helper.fail(res, "bookingId is required")
        }
        if(!location){
            return Helper.fail(res, "location is required")
        }
        if(!address){
            return Helper.fail(res, "address is required")
        }
        const setLocation = await BookingModel.findOneAndUpdate(
            { _id: bookingId, isDeleted: false },
            { $set: { location, address } },
            { new: true }
        );
        if (!setLocation) {
            return Helper.fail(res, "Booking not found or already deleted");
        }
        return Helper.success(res, "Booking location and address updated", setLocation);
    } catch (error) {
        return Helper.fail(res, "failed to add location and address")
    }

}
// update booking
const updateBooking = async (req, res) =>{
    try {
        const bookingId = req.params.id
        const { address, location, date,  timeSlot} = req.body
        const query = {}
        if(address){
            query.address = address
        }
        if(location){
            query.location = location
        }
        if(date){
            query.date = date
        }
        if(timeSlot){
            query.timeSlot = timeSlot
        }
        const update = await BookingModel.findByIdAndUpdate(bookingId, query, { new: true })
        if(!update){
            return Helper.fail(res, "failed to update")
        }
        return Helper.success(res, "booking updated successfull", update)
    } catch (error) {
        return Helper.fail(res, "failed to update")
    }
}
// soft delete booking
const removeBooking = async (req, res) =>{
   try {
    const { bookingId } = req.body
    if(!bookingId){
     return Helper.fail(res, "booking id is required")
    }
    const deleted = await BookingModel.findByIdAndUpdate({_id:bookingId}, { isDeleted: true}, { new: true})
    if(!deleted){
     return Helper.fail(res, "booking not deleted")
    }
    return Helper.success(res, "booking deleted succesfully")
   } 
   catch (error) {
    console.log(error)
    return Helper.fail(res, "failed to delete")
   }
}
// fetch the bookings for user
const fetchUserBooking = async (req, res) =>{
    try {
        const userId = req.userId
        if(!userId){
            return Helper.fail(res, "user id is required")
        }
        const userbookings = await BookingModel.find({userId, isDeleted:false })
        .select("-_id -serviceId -categoryId -paymentMode -isDeleted -createdAt -updatedAt -paymentStatus -__v")
        if(!userbookings){
            return Helper.fail(res, "no booking for the user")
        }
        return Helper.success(res, "bookings fetched successfully", userbookings)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to fetch")
    }
}
// booking history and pending 
const userBookingHistoryOrPending = async (req, res) =>{
        try {
            const userId = req.userId 
            const { type } = req.body
            if(!type){
                return Helper.fail(res, "type is required")
            }
            if(!userId){
                return Helper.fail(res, "user id is required")
            }
            let query
            if(type === "history" || type === "History"){
            // query = { isDeleted: false, bookingStatus: "Cancelled" || "Completed" }
            query = { isDeleted: false, bookingStatus: { $in: ["Cancelled", "Completed"] }}
            }
            if(type === "pending" || type === "Pending"){
                query = { isDeleted: false, bookingStatus: { $in: ["Pending", "Cancelled", "Progress"]}}
            }
            const result = await BookingModel.find({userId, ...query})
            .select("-createdAt -updatedAt -isDeleted -__v")
            .populate("userId", "email phoneNo -_id ")
            .populate("serviceId", "name price -_id")
            .populate("categoryId", "name price -_id")
            .populate("partnerId", "name phoneNo -_id")
            if(!result){
                return Helper.fail(res, "no result available")
            }
            return Helper.success(res, "result fetched", result)
    
        } catch (error) {
            console.log(error)
            return Helper.fail(res, "failed to fetch result")
        }
}
// cancel booking
const cancelBooking = async (req, res) =>{
    try {
        const bookingId  = req.params.id
        if(!bookingId){
            return Helper.fail(res, "booking id is required")
        }
        const updateBooking = await BookingModel.findByIdAndUpdate(
            bookingId, { bookingStatus: "Cancelled"}, { new: true}
        )
        if(!updateBooking || updateBooking.length === 0){
            return Helper.fail(res, "Failed to Cancel booking!")
        }
        return Helper.success(res, "booking cancelled successfully", updateBooking)
    } catch (error) {
        return Helper.fail(res, error.message)
    }

}
// find booking by id
const findBookingById = async (req, res) =>{
    try {
        const bookingId = req.params.id
        if(!bookingId){
            return Helper.fail(res, "booking id is required")
        } 
        const booking = await BookingModel.findOne({_id: bookingId, isDeleted:false})
        .select("-userId -serviceId -categoryId  -isDeleted -createdAt -updatedAt -__v")
        .populate("serviceId", "name -_id")
        .populate("categoryId", "name -_id")
        if(!booking || booking.length === 0){
            return Helper.fail(res, "booking not found")
        }
        return Helper.success(res, "booking found successfully", booking)
    } catch (error) {
        return Helper.fail(res, error.message)
    }
}
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
        
    }
    catch (error) {
            console.log(error)
            return Helper.fail(res, "failed to fetch users booking listing")
        }
}
  // set the time slot between 9:00 AM to 6:00 PM
const fetchTimeSlots = async (req, res) => {
    try {
      const { bookingId } = req.body;
  
      if (!bookingId) {
        return Helper.fail(res, "Booking ID is required");
      }
  
      // Fetch booking and populate the service to get the time
      const booking = await BookingModel.findOne({ _id: bookingId, isDeleted: false })
        .populate("serviceId", "time");
  
      if (!booking || !booking.serviceId || !booking.serviceId.time) {
        return Helper.fail(res, "Service time not found in booking");
      }
  
      const serviceTime = booking.serviceId.time; // e.g. 30 (minutes)
      const businessStart = process.env.BUSINESS_START_TIME;
      const businessEnd = process.env.BUSINESS_END_TIME;
  
      const timeSlots = generateTimeSlots(businessStart, businessEnd, serviceTime);
  
      return Helper.success(res, "Time slots generated", timeSlots);
    } catch (error) {
      console.error(error);
      return Helper.fail(res, "Failed to generate time slots");
    }
};
// get date and time slot
const getDateAndTimeslot = async (req, res) =>{
    try {
        const {date, timeSlot, bookingId } = req.body
        if(!bookingId){
            return Helper.fail(res, "bookingId is required")
        }
        if(!date){
            return Helper.fail(res, "date is required")
        }
        if(!timeSlot){
            return Helper.fail(res, "timeSlot is required")
        }
        const dateAndTime = await BookingModel.findOneAndUpdate(
            { _id: bookingId, isDeleted: false },
            { $set: { date, timeSlot } },
            { new: true }
        );
        if (!dateAndTime) {
            return Helper.fail(res, "Booking not found or already deleted");
        }
        return Helper.success(res, "Booking date and time updated", dateAndTime);
        
    } catch (error) {
        return Helper.fail(res, "failed to add date and time slot");
    }


}
// Auto-assign partner based on user's location
const autoAssignPartner = async (req, res) => {
    try {
      const { bookingId } = req.body;
      const booking = await BookingModel.findById(bookingId).populate("userId");
      if (!booking) return Helper.fail(res, "Booking not found");
  
      const user = booking.userId;
      if (!user || !user.location || !user.location.coordinates) {
        return Helper.fail(res, "User location not found");
      }
  
      const nearestPartner = await PartnerModel.findOne({
        isDeleted: false,
        autoAssign: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: user.location.coordinates,
            },
            $maxDistance: 10000 // in meters (10 km)
          }
        }
      });
  
      if (!nearestPartner) {
        return Helper.fail(res, "No auto-assign partner found nearby");
      }
  
      booking.partnerId = nearestPartner._id;
      booking.status = "assigned";
      await booking.save();
  
      return Helper.success(res, "Partner auto-assigned successfully", booking);
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
      if (!user || !user.location || !user.location.coordinates) {
        return Helper.fail(res, "User location not found");
      }
      const partners = await PartnerModel.find({
        isDeleted: false,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: user.location.coordinates
            },
            $maxDistance: 20000 //for static maximum 20 kn range
          }
        }
      });
  
      return Helper.success(res, "Nearby partners fetched successfully", partners);
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
    
module.exports = {
    initiateBooking,
    getDateAndTimeslot,
    removeBooking,
    updateBooking,
    fetchUserBooking,
    userBookingHistoryOrPending,
    cancelBooking,
    findBookingById,
    usersBookingListing,
    fetchTimeSlots,
    getLocationAndAddress,
    autoAssignPartner,
    getNearbyPartners,
    assignPartnerManually
}