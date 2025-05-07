const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");

const {
    createNotification,
    listingNotification,
    isReadNotification
} = require("../controller/notificationController")


/*--------------------------------user Routes-------------------------------*/
router.post("/createNotification", isAuth, createNotification)
router.post("/listingNotification", isAuth, listingNotification)
router.post("/isReadNotification", isAuth, isReadNotification)

module.exports = router