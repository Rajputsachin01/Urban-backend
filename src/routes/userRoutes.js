const express = require("express");
const router = express.Router();
const { registerUser, updateUser,removeUser,fetchProfile,findUserById,loginUser, verifyOTP,resendOTP, } = require("../controller/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", registerUser)
router.post("/update", updateUser)
router.post("/remove", removeUser)
router.post("/fetchProfile", fetchProfile)
router.post("/findById", findUserById)
router.post("/login", loginUser)
router.post("/verifyOtp", verifyOTP)
router.post("/resendOTP", resendOTP)

module.exports = router;

