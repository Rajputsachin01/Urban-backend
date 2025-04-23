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
        type: { lat: Number, lng: Number },
        required: true,
        default: {lat: 0, lng: 0},
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
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp:{
        type: String,
        default: ""
    },
    serviceId:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "service",
        },]
}, 
 { timestamps: true },
);

module.exports = mongoose.model("partner", PartnerSchema);