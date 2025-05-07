const mongoose = require("mongoose")

const OfferSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
    },
    adminId:{
        type: String,
        required: true,
    },
    categoryId: {
        type: String,
    },
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
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