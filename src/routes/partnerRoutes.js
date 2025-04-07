const express = require("express");
const router = express.Router();
const partnerController = require("../controller/partnerController");

/*--------------------------------user Routes-------------------------------*/
router.post("/createPartner", partnerController.createPartner)
router.post("/deletePartner/:id", partnerController.deletePartner)
router.post("/removePartner/:id", partnerController.removePartner)
router.post("/verifyOtp", partnerController.verifyOTP)
router.post("/resendOtp", partnerController.resendOTP)

module.exports = router;