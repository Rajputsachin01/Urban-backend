const express = require("express");
const router = express.Router();
const {createOffer} = require("../controller/offerController");


router.post("/createOffer", createOffer)

module.exports = router;