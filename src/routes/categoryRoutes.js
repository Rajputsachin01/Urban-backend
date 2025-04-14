const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
<<<<<<< HEAD
const { createCategory, updateCategory, removeCategory, listingCategory, findCategoryById, categoriesForService } = require("../controller/categoryController")
=======
const { createCategory, updateCategory, removeCategory, listingCategory, findCategoryById } = require("../controller/categoryController")
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f

/*--------------------------------user Routes-------------------------------*/
router.post("/create", createCategory)
router.post("/update/:id", updateCategory)
router.post("/find/:id", findCategoryById)
router.post("/remove", removeCategory)
router.post("/listing", listingCategory)
<<<<<<< HEAD
router.post("/categoriesForService", categoriesForService)
=======
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f

module.exports = router;
