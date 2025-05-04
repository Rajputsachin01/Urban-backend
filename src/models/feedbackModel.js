const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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