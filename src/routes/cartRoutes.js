const express = require("express");
const router = express.Router();
const {isAuth} = require("../utils/auth");
const CartController = require("../controller/cartController");

router.post("/add",isAuth, CartController.addToCart);
router.post("/listingUserCarts", isAuth, CartController.listUserCartItems);
router.post("/update-quantity",isAuth, CartController.updateCartItemQuantity);
router.post("/remove-item",isAuth, CartController.removeCartItem);
router.post("/deleteCart",isAuth, CartController.deleteCart);
module.exports = router;
