const express = require("express");
const router = express.Router();
const {isAuth} = require("../utils/auth");

const { fetchAnalytics } = require("../controller/analyticsController");
router.post("/fetchAnalytics", isAuth, fetchAnalytics);
module.exports = router;

