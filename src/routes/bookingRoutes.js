const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { addBooking, removeBooking, updateBooking , fetchUserBooking, userBookingHistory} = require("../controller/bookingController")

/*--------------------------------user Routes-------------------------------*/
router.post("/addbooking",isAuth, addBooking)
router.post("/update/:id",isAuth, updateBooking)
router.post("/delete",isAuth, removeBooking)
router.post("/userbookings",isAuth, fetchUserBooking)
router.post("/history",isAuth, userBookingHistory)


module.exports = router;
