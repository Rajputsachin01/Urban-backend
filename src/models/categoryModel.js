const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
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

module.exports = mongoose.model("categories", CategorySchema);