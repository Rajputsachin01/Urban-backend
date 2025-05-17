const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { createSubCategory, updateSubCategory, removeSubCategory, listingSubCategory, findSubCategoryById, subCategoryByCategoryId } = require("../controller/subCategoryController")

/*--------------------------------SubCategory Routes-------------------------------*/
router.post("/create",isAuth, createSubCategory)
router.post("/update/:id",isAuth, updateSubCategory)
router.post("/findById/:id",isAuth, findSubCategoryById)
router.post("/remove",isAuth, removeSubCategory)
router.post("/listing", listingSubCategory)
router.post("/subCategoriesByCategory", subCategoryByCategoryId)

module.exports = router;
