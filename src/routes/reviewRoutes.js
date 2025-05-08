const express = require("express")
const router = express.Router()
const {isAuth} = require("../utils/auth")

const { createReview, updateReview, deleteReview, listingReview} = require("../controller/reviewController")

/*--------------------------------Routes-------------------------------*/
router.post("/createReview", isAuth, createReview)
router.post("/updateReview", isAuth, updateReview)
router.post("/deleteReview", isAuth, deleteReview)
router.post("/listingReview", isAuth, listingReview)

module.exports = router