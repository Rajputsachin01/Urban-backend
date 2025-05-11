const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    icon : {
        type : String,
        default : ""
    },
    name: {
        type: String,
        default: "",
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    serviceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
    },
    sellingType: {
        type: String,
        enum : ["sqft", "seat", "piece"],
        required : true
    },
    size: {
        type: String,
        default: ""
    },
    price:{
        type: Number,
        default: ""
    },
    seat: {
        type: Number,
        default: ""
    },
    piece: {
        type: Number,
        default: ""
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},
 { timestamps: true})

module.exports = mongoose.model("categories", CategorySchema)