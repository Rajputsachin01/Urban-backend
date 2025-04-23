const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");

/*--------------------------------service Routes-------------------------------*/
router.post("/createService", serviceController.createService)
router.post("/updateService/:id", serviceController.updateService)
router.post("/removeService/:id", serviceController.removeService)
router.post("/listingService", serviceController.listingService)

module.exports = router;