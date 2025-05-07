const mongoose = require("mongoose")

const JobStatusSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        required: true,
        default: "",
    },
    serviceId: {
        type: String,
        required: true,
        default: "",
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