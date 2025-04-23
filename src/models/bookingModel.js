const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
    userId :{
       type: mongoose.Schema.Types.ObjectId, ref: "users",
        required: true
    },
    serviceId :{
        type: mongoose.Schema.Types.ObjectId, ref: "service",
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
        enum: ["Pending", "Cancelled", "Completed", "Progress"],
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