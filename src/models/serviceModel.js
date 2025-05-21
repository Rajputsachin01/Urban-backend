const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({
    icon : {
        type : String,
        default : ""
    },
    name: {
        type: String,
        default: "",
        required: true
    },
   time: {
  type: Number, // instead of String
  required: true
},

    description: {
        type: String,
        default: ""
    },
    subCategoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategories",
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

module.exports = mongoose.model("services", ServiceSchema)