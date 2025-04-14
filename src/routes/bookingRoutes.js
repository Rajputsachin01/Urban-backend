const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { 
    addBooking, 
    removeBooking, 
    updateBooking , 
    fetchUserBooking, 
    userBookingHistory, 
    userBookingPanding,
    cancelBooking,
    findBookingById
} = require("../controller/bookingController")

/*--------------------------------user Routes-------------------------------*/
router.post("/addbooking",isAuth, addBooking)
router.post("/update/:id",isAuth, updateBooking)
router.post("/delete",isAuth, removeBooking)
router.post("/userbookings",isAuth, fetchUserBooking)
router.post("/history",isAuth, userBookingHistory)
router.post("/panding",isAuth, userBookingPanding)
router.post("/cancel/:id",isAuth, cancelBooking)
router.post("/findById/:id",isAuth, findBookingById)


module.exports = router;
