const mongoose = require("mongoose")

const ServiceSchema = new mongoose.Schema({
<<<<<<< HEAD
=======
    icon: {
        type: String,
        default: "",
    },
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
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
<<<<<<< HEAD
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
      }],
=======
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
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