const mongoose = require("mongoose")

const OfferSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
        // required: true
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "admin",
        // required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
                
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