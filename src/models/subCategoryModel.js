const mongoose = require("mongoose")
const SubCategorySchema = new mongoose.Schema({
    name: {
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
    isPublished: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("subCategories", SubCategorySchema);