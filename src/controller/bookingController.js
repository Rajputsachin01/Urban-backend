const BookingModel = require("../models/bookingModel")
const Helper = require("../utils/helper")

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
// booking history
const userBookingHistory = async (req, res) =>{
    try {
        const userId = req.userId 
        if(!userId){
            return Helper.fail(res, "user id is required")
        }
        // query = { isDeleted: false, bookingStatus: "Cancelled" || "Completed" }
        const query = { isDeleted: false, bookingStatus: { $in: ["Cancelled", "Completed"] }}
        const history = await BookingModel.find({userId, ...query})
        console.log(history)
        if(!history){
            return Helper.fail(res, "no history available")
        }
        return Helper.success(res, "history fetched",history )

    } catch (error) {
        console.log(error)
        return Helper.fail(res, "failed to fetch history")
    }
}
// booking panding
const userBookingPanding = async (req, res) =>{
    try {
        const userId  = req.userId
        if(!userId){
            return Helper.fail(res, "userId is required")
        }
        // ["Pending", "Cancelled", "Completed"]
        const query = { isDeleted: false, bookingStatus: { $in: ["Pending", "Cancelled", "Progress"]}}
        const pandingBookings = await BookingModel.find({userId, ...query})
        .select("-createdAt -updatedAt -isDeleted -__v")
        .populate("userId", "email phoneNo -_id ")
        .populate("serviceId", "name price -_id")
        .populate("categoryId", "name price -_id")
        .populate("partnerId", "name phoneNo -_id")
        if(!pandingBookings){
            return Helper.fail(res, "no any booking available")
        }
        return Helper.success(res, "user panding bookings fetched", pandingBookings)
    } catch (error) {
        console.log(error)
        return Helper.fail(res, error.message)
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
// assigning the partner
// const assignPartner = async (req, res) =>{

// }




  
  

module.exports = {
    addBooking,
    removeBooking,
    updateBooking,
    fetchUserBooking,
    userBookingHistory,
    userBookingPanding,
    cancelBooking,
    findBookingById
}