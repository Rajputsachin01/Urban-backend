const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { 
    initiateBooking,
    // addBooking, 
    removeBooking, 
    updateBooking , 
    fetchUserBooking, 
    userBookingHistoryOrPending, 
    cancelBooking,
    findBookingById,
    usersBookingListing,
    fetchTimeSlots,
    getDateAndTimeslot,
    getLocationAndAddress
} = require("../controller/bookingController")

/*--------------------------------user Routes-------------------------------*/
router.post("/initiateBooking",isAuth, initiateBooking)
router.post("/getDateAndTimeslot",isAuth, getDateAndTimeslot)
router.post("/location",isAuth, getLocationAndAddress)
// router.post("/addbooking",isAuth, addBooking)
router.post("/update/:id",isAuth, updateBooking)
router.post("/delete",isAuth, removeBooking)
router.post("/userbookings",isAuth, fetchUserBooking)
router.post("/historyOrPending",isAuth, userBookingHistoryOrPending)
router.post("/cancel/:id",isAuth, cancelBooking)
router.post("/findById/:id",isAuth, findBookingById)
router.post("/usersBookingListing",isAuth, usersBookingListing)
router.post("/fetchTimeSlots",isAuth, fetchTimeSlots)


module.exports = router;
