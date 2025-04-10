const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    // add icon remaining
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
    isDeleted:{
        type: Boolean,
        default: false
    }
},
 { timestamps: true})

module.exports = mongoose.model("category", CategorySchema)