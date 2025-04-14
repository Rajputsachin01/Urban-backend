const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "",
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    time: {
        type: String,
        required: true,
        default: "",
    },
    images: {
        type:[ String ],
        default: "",
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
    type: {
        type: String,
        required: true,
        default: "",
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
      }],
    isPublish: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, 
 { timestamps: true },
);

module.exports = mongoose.model("service", ServiceSchema);