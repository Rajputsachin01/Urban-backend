const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, verifyOTP, updateAdmin, removeAdmin } = require("../controller/adminController");
const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/register", registerAdmin)
router.post("/login", loginAdmin)
router.post("/verifyotp", verifyOTP)
router.post("/update", isAuth, updateAdmin)
router.post("/remove", isAuth, removeAdmin)

module.exports = router;
