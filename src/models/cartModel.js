const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "categories",
          required: true,
        },
        subCategoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subCategories",
          required: true,
        },
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "services",
          required: true,
        },
        unitQuantity: {
          type: Number,
          required: true,
          default: 1,
        },
      }
    ],
    isPurchased: {
      type: Boolean,
      default: false, // Will become true once booking is done
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("carts", CartSchema);
