const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const {
  initiateBooking,
  initiateBookingFromCart,
  removeBooking,
  updateBooking,
  fetchUserBooking,
  userBookingHistoryOrPending,
  cancelBooking,
  findBookingById,
  usersBookingListing,
  fetchTimeSlots,
  selectDateAndTimeslot,
  getLocationAndAddress,
  autoAssignPartner,
  getNearbyPartners,
  assignPartnerManually,
  bookingListing
} = require("../controller/bookingController");

/*--------------------------------user Routes-------------------------------*/
router.post("/initiateBooking", isAuth, initiateBookingFromCart);
router.post("/location", isAuth, getLocationAndAddress);
router.post("/fetchTimeSlots", isAuth, fetchTimeSlots);
router.post("/selectDateAndTimeslot", isAuth, selectDateAndTimeslot);
router.post("/autoAssignPartner", isAuth, autoAssignPartner);
router.post("/fetchNearbyPartners", isAuth, getNearbyPartners);
router.post("/manualAssignPartner", isAuth, assignPartnerManually);
router.post("/update/:id", isAuth, updateBooking);
router.post("/delete", isAuth, removeBooking);
router.post("/userbookings", isAuth, fetchUserBooking);
router.post("/historyOrPending", isAuth, userBookingHistoryOrPending);
router.post("/cancel/:id", isAuth, cancelBooking);
router.post("/findById/:id", isAuth, findBookingById);
router.post("/usersBookingListing", isAuth, usersBookingListing);
router.post("/bookingListing", isAuth, bookingListing);
module.exports = router;
