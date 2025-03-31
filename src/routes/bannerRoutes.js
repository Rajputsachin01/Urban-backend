const express = require("express");
const router = express.Router();
const { createBanner, deleteBanner, removeBanner, getBannersWithFilters } = require("../controller/bannerController");
// const { isAuth } = require("../utils/auth");

/*--------------------------------user Routes-------------------------------*/
router.post("/createbanner", createBanner)
router.post("/deletebanner/:id", deleteBanner)
router.post("/removebanner/:id", removeBanner)
router.post("/listing", getBannersWithFilters)



module.exports = router;

