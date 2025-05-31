const mongoose = require("mongoose")

const JobStatusSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
                 ref: "partners",
                 required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
                 ref: "services",
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
                 ref: "Booking",
    },
    beforeImage: {
        type: String,
        required: true,
    },
    afterImage: {
        type: String,
        required: true,
    },
    notes:{
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);
module.exports = mongoose.model("jobStatus", JobStatusSchema);