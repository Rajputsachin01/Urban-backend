const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");
const {isAuth,} = require("../utils/auth")

/*--------------------------------service Routes-------------------------------*/
router.post("/create",isAuth, serviceController.createService)
router.post("/update/:id", isAuth,serviceController.updateService)
router.post("/remove/:id",isAuth, serviceController.removeService)
router.post("/listing", serviceController.listingService)
router.post("/serviceBySubCategory/:subCategoryId", serviceController.serviceBySubCategoryId)

module.exports = router;