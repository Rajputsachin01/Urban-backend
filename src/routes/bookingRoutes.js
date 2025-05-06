const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { 
    addBooking, 
    removeBooking, 
    updateBooking , 
    fetchUserBooking, 
    userBookingHistoryOrPanding, 
    cancelBooking,
    findBookingById,
    usersBookingListing,
    fetchTimeSlots
} = require("../controller/bookingController")

/*--------------------------------user Routes-------------------------------*/
router.post("/addbooking",isAuth, addBooking)
router.post("/update/:id",isAuth, updateBooking)
router.post("/delete",isAuth, removeBooking)
router.post("/userbookings",isAuth, fetchUserBooking)
router.post("/historyOrPanding",isAuth, userBookingHistoryOrPanding)
router.post("/cancel/:id",isAuth, cancelBooking)
router.post("/findById/:id",isAuth, findBookingById)
router.post("/usersBookingListing",isAuth, usersBookingListing)
router.post("/fetchTimeSlots",isAuth, fetchTimeSlots)


module.exports = router;
