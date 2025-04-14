const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
<<<<<<< HEAD
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
=======
const { addBooking, removeBooking, updateBooking , fetchUserBooking, userBookingHistory} = require("../controller/bookingController")
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f

/*--------------------------------user Routes-------------------------------*/
router.post("/addbooking",isAuth, addBooking)
router.post("/update/:id",isAuth, updateBooking)
router.post("/delete",isAuth, removeBooking)
router.post("/userbookings",isAuth, fetchUserBooking)
router.post("/history",isAuth, userBookingHistory)
<<<<<<< HEAD
router.post("/panding",isAuth, userBookingPanding)
router.post("/cancel/:id",isAuth, cancelBooking)
router.post("/findById/:id",isAuth, findBookingById)
=======
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f


module.exports = router;
