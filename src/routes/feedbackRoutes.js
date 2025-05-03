const express = require("express");
const router = express.Router();
const {givefeedback, removefeeback} = require("../controller/feedbackController");
const { isAuth } = require("../utils/auth");


router.post("/givefeedback", isAuth, givefeedback)
router.post("/removeFeedback/:id", removefeeback)
// router.post("/listingOffer", listingOffer)

module.exports = router;