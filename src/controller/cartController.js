const CartModel = require("../models/cartModel");
const Helper = require("../utils/Helper");

const addToCart = async (req, res) => {
  try {
    const userId  = req.userId;
    if (!userId) return Helper.fail(res, "User ID is required");

    const { categoryId, subCategoryId, serviceId, unitQuantity = 1 } = req.body;

    let cart = await CartModel.findOne({ userId, isPurchased: false, isDeleted: false });

    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ categoryId, subCategoryId, serviceId, unitQuantity }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        item =>
          item.categoryId.toString() === categoryId &&
          item.subCategoryId.toString() === subCategoryId &&
          item.serviceId.toString() === serviceId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].unitQuantity += unitQuantity;
      } else {
        cart.items.push({ categoryId, subCategoryId, serviceId, unitQuantity });
      }

      await cart.save();
    }

    return Helper.success(res, "Item added to cart", cart);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const listUserCartItems = async (req, res) => {
  try {
    const userId  = req.userId;
    if (!userId) return Helper.fail(res, "User ID is required");

    const { page = 1, limit = 10, search = "" } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matchQuery = {
      userId,
      isDeleted: false,
      isPurchased: false,
    };

    const cart = await CartModel.findOne(matchQuery)
      .populate({
        path: "items.serviceId",
        match: search
          ? { name: { $regex: search, $options: "i" } }
          : {},
      })
      .populate("items.categoryId", "name")
      .populate("items.subCategoryId", "name");

    if (!cart || !cart.items.length) {
      return Helper.fail(res, "Cart is empty");
    }

    const filteredItems = cart.items.filter(item => item.serviceId !== null);

    const paginatedItems = filteredItems.slice(skip, skip + parseInt(limit));

    return Helper.success(res, "Cart items fetched successfully", {
      totalItems: filteredItems.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredItems.length / parseInt(limit)),
      items: paginatedItems,
    });
  } catch (error) {
    console.error("Cart listing error:", error);
    return Helper.fail(res, error.message);
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const userId  = req.userId;
    if (!userId) return Helper.fail(res, "User ID is required");

    const { serviceId, unitQuantity } = req.body;

    const cart = await CartModel.findOne({ userId, isPurchased: false, isDeleted: false });
    if (!cart) return Helper.fail(res, "Cart not found");

    const itemIndex = cart.items.findIndex(item => item.serviceId.toString() === serviceId);
    if (itemIndex === -1) return Helper.fail(res, "Item not found in cart");

    cart.items[itemIndex].unitQuantity = unitQuantity;
    await cart.save();

    return Helper.success(res, "Cart quantity updated", cart);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId  = req.userId;
    if (!userId) return Helper.fail(res, "User ID is required");

    const { serviceId } = req.body;

    const cart = await CartModel.findOne({ userId, isPurchased: false, isDeleted: false });
    if (!cart) return Helper.fail(res, "Cart not found");

    cart.items = cart.items.filter(item => item.serviceId.toString() !== serviceId);
    await cart.save();

    return Helper.success(res, "Item removed from cart", cart);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId  = req.userId;
    console.log(req.userId);
    if (!userId) return Helper.fail(res, "User ID is required");

    const cart = await CartModel.findOneAndUpdate(
      { userId, isPurchased: false },
      { isDeleted: true },
      { new: true }
    );

    if (!cart) return Helper.fail(res, "Cart not found");

    return Helper.success(res, "Cart deleted successfully", cart);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  addToCart,
  listUserCartItems,
  updateCartItemQuantity,
  removeCartItem,
  deleteCart,
};
