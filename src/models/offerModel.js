const mongoose = require("mongoose")

const OfferSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
    },
    adminId: {
        type: Number,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("offer", OfferSchema);