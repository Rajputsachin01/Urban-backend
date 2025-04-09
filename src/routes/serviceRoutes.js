const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");

/*--------------------------------service Routes-------------------------------*/
router.post("/createService", serviceController.createService)
router.post("/deleteService/:id", serviceController.deleteService)
router.post("/removeService/:id", serviceController.removeService)
router.post("/listingService", serviceController. listingService)
router.post("/updateService/:id", serviceController.updateService)

module.exports = router;