const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, verifyOTP, updateAdmin, removeAdmin,fetchProfile,updateUserStatus } = require("../controller/adminController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", registerAdmin)
router.post("/login", loginAdmin)
router.post("/verifyotp", verifyOTP)
router.post("/update", isAuth, updateAdmin)
router.post("/remove", isAuth, removeAdmin)
router.post("/fetchProfile", isAuth, fetchProfile)
router.post("/changeStatus", isAuth, updateUserStatus)

module.exports = router;
