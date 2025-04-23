const express = require("express");
const router = express.Router();
const partnerController = require("../controller/partnerController");
const {isAuth} = require("../utils/auth")

/*--------------------------------user Routes-------------------------------*/
router.post("/createPartner", partnerController.createPartner)
router.post("/deletePartner/:id", partnerController.deletePartner)
router.post("/removePartner/:id", partnerController.removePartner)
router.post("/verifyOtp", partnerController.verifyOTP)
router.post("/resendOtp", partnerController.resendOTP)
router.post("/loginPartner", partnerController.loginPartner)
router.post("/partnerLocation", isAuth, partnerController.getPartnerLocation)
router.post("/fetchProfile", isAuth, partnerController.fetchProfile)
router.post("/partnerListing", partnerController.partnerListing)
router.post("/partnerListingServices", isAuth, partnerController.partnerListingWithServices)




module.exports = router;