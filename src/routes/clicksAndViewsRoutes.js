const express = require("express");
const router = express.Router();
const { isAuth } = require("../utils/auth");
const { createClickOrView, removeClickOrView, listClicksAndViews } = require("../controller/clicksAndViewsController")

/*--------------------------------user Routes-------------------------------*/
router.post('/create',isAuth, createClickOrView)
router.post('/remove/:id',isAuth, removeClickOrView,)
router.post('/list',isAuth, listClicksAndViews)

module.exports = router;
