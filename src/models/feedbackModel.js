const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("feedback", feedbackSchema);