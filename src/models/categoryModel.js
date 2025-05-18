const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
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

module.exports = mongoose.model("categories", CategorySchema);