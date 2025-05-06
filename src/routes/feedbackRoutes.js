const express = require("express");
const router = express.Router();
const {giveFeedback, removeFeedback, listingFeedback, updateFeedback} = require("../controller/feedbackController");
const { isAuth } = require("../utils/auth");


router.post("/givefeedback", isAuth, giveFeedback)
router.post("/removeFeedback/:id", removeFeedback)
router.post("/listingFeedback", listingFeedback)
router.post("/updateFeedback/:id", updateFeedback)

module.exports = router;