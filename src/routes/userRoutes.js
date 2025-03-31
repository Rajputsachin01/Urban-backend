const express = require("express");
const router = express.Router();
const { register, login, verifyOTP } = require("../controller/userController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", register)
router.post("/login", login)
router.post("/verifyotp", verifyOTP)

module.exports = router;

