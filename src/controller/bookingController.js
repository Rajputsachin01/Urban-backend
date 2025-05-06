const BookingModel = require("../models/bookingModel")
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
// add booking
const addBooking = async (req, res) =>{
    try {
        const userId = req.userId
        const { serviceId, categoryId, partnerId,  address, location, date, timeSlot,  paymentMode } = req.body
        if(!serviceId || !categoryId ||  !address || !partnerId|| !location || !date || !timeSlot || !paymentMode){
            return Helper.fail(res, "All fields are required")
        }
        console.log(req.body)
        const booking = await BookingModel.create({
            userId,
            serviceId,
            categoryId,
            partnerId,
            address,
            location,
            date,
            timeSlot,
            paymentMode,
            bookingStatus: "Pending",
            price: 0,
            discountAmount: 0,
            totalPrice: 0,
            paymentStatus: "Pending"
        })
        if(!booking){
            return Helper.fail(res, "booking failed")
        }
        return Helper.success(res, "booking successfull", booking)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, error.message)
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
const userBookingHistoryOrPanding = async (req, res) =>{
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
        .select("-userId -serviceId -categoryId -bookingStatus -isDeleted -createdAt -updatedAt -__v")
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
      const businessStart = "09:00";
      const businessEnd = "18:00";
  
      const timeSlots = generateTimeSlots(businessStart, businessEnd, serviceTime);
  
      return Helper.success(res, "Time slots generated", timeSlots);
    } catch (error) {
      console.error(error);
      return Helper.fail(res, "Failed to generate time slots");
    }
};

module.exports = {
    addBooking,
    removeBooking,
    updateBooking,
    fetchUserBooking,
    userBookingHistoryOrPanding,
    cancelBooking,
    findBookingById,
    usersBookingListing,
    fetchTimeSlots
}