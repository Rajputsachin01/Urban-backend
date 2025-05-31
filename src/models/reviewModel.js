const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    serviceId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "services",
       },
    partnerId: {
        type: String,
        required: true,
         ref: "partner",
    },
    userId:{
        type:String,
        require: true,
        ref: "users",
    },
    rating: {
        type: Number,
        // required: true,
        default: 5
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
module.exports = mongoose.model("review", reviewSchema);