const express = require("express");
const router = express.Router();
const {createOffer, removeOffer, listingOffer} = require("../controller/offerController");
const { isAuth } = require("../utils/auth");


router.post("/createOffer", isAuth, createOffer)
router.post("/removeOffer/:id", removeOffer)
router.post("/listingOffer", listingOffer)

module.exports = router;