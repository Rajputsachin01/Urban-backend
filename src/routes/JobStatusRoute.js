const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const {createJobStatus, listingJobStatus}  = require("../controller/jobStatusController") 

/*--------------------------------user Routes-------------------------------*/
router.post("/createJobStatus",isAuth, createJobStatus)
router.post("/listingJobStatus",isAuth, listingJobStatus)

module.exports = router