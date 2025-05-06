const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");

const {
    createNotification,
    listingNotrification
} = require("../controller/notificationController")


/*--------------------------------user Routes-------------------------------*/
router.post("/createNotification", isAuth, createNotification)
router.post("/listingNotification", isAuth, listingNotrification)

module.exports = router