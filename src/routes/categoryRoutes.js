const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { createCategory, updateCategory, removeCategory, listingCategory, findCategoryById, findAllCategories } = require("../controller/categoryController")

/*--------------------------------Category Routes-------------------------------*/
router.post("/create", isAuth,createCategory)
router.post("/update/:id",isAuth, updateCategory)
router.post("/findById/:id", isAuth,findCategoryById)
router.post("/remove",isAuth, removeCategory)
router.post("/listing", listingCategory)
router.post("/findAll", findAllCategories)

module.exports = router;
