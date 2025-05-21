// routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const {isAuth} = require("../utils/auth"); // if you use JWT

router.post("/add", isAuth, cartController.addToCart);

module.exports = router;
