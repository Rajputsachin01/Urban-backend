const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
    userId :{
       type: mongoose.Schema.Types.ObjectId, ref: "users",
        required: true
    },
    serviceId :{
<<<<<<< HEAD
        type: mongoose.Schema.Types.ObjectId, ref: "service",
=======
        type: mongoose.Schema.Types.ObjectId, ref: "services",
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
        required: true
    },
    categoryId :{
       type: mongoose.Schema.Types.ObjectId, ref: "categories",
        required: true
    },
    // fullName:{
    //     type: String,
    //     required: true
    // },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId, ref: "partner",
        required: true
    }, 
    address :{
        type: String,
        required: true
    },
    // pincode :{
    //     type: String,
    //     required: true
    // },
    location: {
        type: { lat: Number, lng: Number },
        required: true,
    }, 
    date: {
        type: Date,
        required: true
    },      
    timeSlot: { 
        type: { start: String, end: String }, 
        required: true,
    },
    bookingStatus: {
        type: String,
<<<<<<< HEAD
        enum: ["Pending", "Cancelled", "Completed", "Progress"],
=======
        enum: ["Pending", "Cancelled", "Completed"],
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
        default: "Pending",
    },
    price: {
        type: Number,
        // required: true,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    totalPrice:{
        type:Number,
        default:0
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'upi', 'card', 'netbanking', 'wallet'],
        required: true,
    }, 
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },

},
{ timestamps: true})

module.exports = mongoose.model("bookings", BookingSchema)