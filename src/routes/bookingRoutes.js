const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const {
  initiateBooking,
  // addBooking,
  removeBooking,
  updateBooking,
  fetchUserBooking,
  userBookingHistoryOrPending,
  cancelBooking,
  findBookingById,
  usersBookingListing,
  fetchTimeSlots,
  getDateAndTimeslot,
  getLocationAndAddress,
  autoAssignPartner,
  getNearbyPartners,
  assignPartnerManually,
} = require("../controller/bookingController");

/*--------------------------------user Routes-------------------------------*/
router.post("/initiateBooking", isAuth, initiateBooking);
router.post("/getDateAndTimeslot", isAuth, getDateAndTimeslot);
router.post("/location", isAuth, getLocationAndAddress);
router.post("/update/:id", isAuth, updateBooking);
router.post("/delete", isAuth, removeBooking);
router.post("/userbookings", isAuth, fetchUserBooking);
router.post("/historyOrPending", isAuth, userBookingHistoryOrPending);
router.post("/cancel/:id", isAuth, cancelBooking);
router.post("/findById/:id", isAuth, findBookingById);
router.post("/usersBookingListing", isAuth, usersBookingListing);
router.post("/fetchTimeSlots", isAuth, fetchTimeSlots);
router.post("/autoAssignPartner", isAuth, autoAssignPartner);
router.post("/fetchNearbyPartners", isAuth, getNearbyPartners);
router.post("/manualAssignPartner", isAuth, assignPartnerManually);

module.exports = router;
