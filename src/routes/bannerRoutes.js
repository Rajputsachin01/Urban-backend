const express = require("express");
const router = express.Router();
const { createBanner, removeBanner, listingBanner, updateBanner, deleteBanner } = require("../controller/bannerController");
// const { isAuth } = require("../utils/auth");
const upload = require("../middelware/multer")

/*--------------------------------user Routes-------------------------------*/
router.post("/createbanner", upload.array("images", 10), createBanner)
router.post("/remove", removeBanner)
router.post("/listing", listingBanner)
router.post("/update/:id", updateBanner)
router.post("/delete/:id", deleteBanner)



module.exports = router;

