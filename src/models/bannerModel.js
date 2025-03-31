const mongoose = require("mongoose")

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "",
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
    images: {
        type: [String],
        required: true,
        default: "",
    },
    type: {
        type: String,
        required: true,
        default: "",
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);
module.exports = mongoose.model("banner", BannerSchema);