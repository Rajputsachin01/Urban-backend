const express = require("express");
const router = express.Router();
const { registerUser, updateUser, removeUser, fetchProfile, findUserById, loginUser, verifyOTP, resendOTP, getUserLocation, fetchReferralCode} = require("../controller/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", registerUser)
router.post("/update", isAuth, updateUser)
router.post("/remove", isAuth, removeUser)
// router.post("/remove/:id", isAuth, removeUser)
router.post("/fetchProfile", isAuth, fetchProfile)
router.post("/findById", findUserById)
router.post("/login", loginUser)
router.post("/verifyOtp", verifyOTP)
router.post("/resendOTP", resendOTP)
router.post("/location",isAuth, getUserLocation)
router.post("/referralCode",isAuth, fetchReferralCode)

module.exports = router;

