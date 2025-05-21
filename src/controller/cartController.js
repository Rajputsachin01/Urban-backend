const CartModel = require("../models/cartModel");
const Helper = require("../utils/Helper"); // adjust the path as per your structure

const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId, subCategoryId, serviceId, unitQuantity } = req.body;

    if (!userId) return Helper.fail(res, "User ID is required");
    if (!categoryId) return Helper.fail(res, "Category ID is required");
    if (!subCategoryId) return Helper.fail(res, "Sub-category ID is required");
    if (!serviceId) return Helper.fail(res, "Service ID is required");
    if (!unitQuantity || unitQuantity <= 0) return Helper.fail(res, "Valid unit quantity is required");

    // Check if cart exists for this user and is not purchased
    let cart = await CartModel.findOne({ userId, isPurchased: false });

    // If no cart, create a new one
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ categoryId, subCategoryId, serviceId, unitQuantity }],
      });
      return Helper.success(res, "Cart created and service added", cart);
    }

    // If cart exists, check if this service already exists
    const existingItemIndex = cart.items.findIndex(
      (item) => item.serviceId.toString() === serviceId
    );

    if (existingItemIndex > -1) {
      // Update the quantity of the existing item
      cart.items[existingItemIndex].unitQuantity = unitQuantity;
    } else {
      // Push new item
      cart.items.push({ categoryId, subCategoryId, serviceId, unitQuantity });
    }

    await cart.save();

    return Helper.success(res, "Cart updated successfully", cart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    return Helper.fail(res, "Something went wrong while adding to cart");
  }
};

module.exports = { addToCart };
