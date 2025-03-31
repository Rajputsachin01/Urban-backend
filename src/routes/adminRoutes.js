const express = require("express");
const router = express.Router();
const { adminRegister, login, verifyOTP } = require("../controller/adminController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", adminRegister)
router.post("/login", login)
router.post("/verifyotp", verifyOTP)

module.exports = router;
