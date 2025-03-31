const mongoose = require("mongoose")

const PartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    phoneNo: {
        type: Number,
        required: true,
        default: "",
    },
    email: {
        type: String,
        required: true,
        default: "",
        unique: true,
        lowercase: true,
    },
    address: {
        type: String,
        required: true,
        default: "",
    },
    location: {
        type: String,
        required: true,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    idProof: {
        type: String,
        required: true,
        default: "",
    },
    vehicleImage: {
        type: String,
        required: true,
        default: "",
    },
    drivingLicence: {
        type: String,
        required: true,
        default:""
    },
    identityCard: {
        type: String,
        required: true,
        default:""
    },
    isPublish: {
        type: Boolean,
        default: false
    },
    autoAssign: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);

module.exports = mongoose.model("partner", PartnerSchema);