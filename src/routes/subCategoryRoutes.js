const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { createSubCategory, updateSubCategory, removeSubCategory, listingSubCategory, findSubCategoryById, subCategoryByCategoryId,toggleIsPublished,findAllSubCategories } = require("../controller/subCategoryController")

/*--------------------------------SubCategory Routes-------------------------------*/
router.post("/create",isAuth, createSubCategory)
router.post("/update/:id",isAuth, updateSubCategory)
router.post("/toggleIsPublished/",isAuth, toggleIsPublished)
router.post("/findById/:id",isAuth, findSubCategoryById)
router.post("/remove",isAuth, removeSubCategory)
router.post("/listing",isAuth, listingSubCategory)
router.post("/findAll", findAllSubCategories)
router.post("/subCategoriesByCategory/:categoryId", subCategoryByCategoryId)

module.exports = router;
