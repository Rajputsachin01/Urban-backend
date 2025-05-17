const mongoose = require("mongoose")
const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    time: {
        type: String,
        required: true,
        default: "",
    },
    images: {
        type:[ String ],
        default: "",
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
      categoryId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
        },
    isPublish: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("subCategories", SubCategorySchema);