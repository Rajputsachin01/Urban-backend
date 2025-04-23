const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { createCategory, updateCategory, removeCategory, listingCategory, findCategoryById, categoriesForService } = require("../controller/categoryController")

/*--------------------------------user Routes-------------------------------*/
router.post("/create", createCategory)
router.post("/update/:id", updateCategory)
router.post("/find/:id", findCategoryById)
router.post("/remove", removeCategory)
router.post("/listing", listingCategory)
router.post("/categoriesForService", categoriesForService)

module.exports = router;
