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
        type: {
          type: String,
          enum: ['Point'],
          required: true,
          default: 'Point'
        },
        coordinates: {
          type: [Number], 
          required: true,
          default: [0, 0]
        }
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
    avgRating:{
        type: Number,
        default: ""
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
PartnerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("partner", PartnerSchema);