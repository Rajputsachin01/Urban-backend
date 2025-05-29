// const mongoose = require("mongoose");

// const BookingSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     serviceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "service",
//       required: true,
//     },
//     partnerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "partner",
//       // required: true,
//       // default: ""
//     },
//     unitQuantity: {
//       type: Number,
//     },
//     address: {
//       type: String,
//       // required: true,
//       default: "",
//     },
//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         required: true,
//         default: "Point",
//       },
//       coordinates: {
//         type: [Number], // [longitude, latitude]
//         required: true,
//         default: [0, 0],
//       },
//     },
//     date: {
//       type: Date,
//       // required: true,
//       default: "",
//     },
//     timeSlot: {
//       type: { start: String, end: String },
//       // required: true,
//     },
//     bookingStatus: {
//       type: String,
//       enum: ["Pending", "Cancelled", "Completed", "Progress"],
//       default: "Pending",
//     },
//     price: {
//       type: Number,
//       // required: true,
//       default: 0,
//     },
//     discountAmount: {
//       type: Number,
//       default: 0,
//     },
//     totalPrice: {
//       type: Number,
//       default: 0,
//     },
//     paymentMode: {
//       type: String,
//       enum: ["cash", "upi", "card", "netbanking", "wallet"],
//       // required: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       default: "pending",
//     },
//     stripePaymentId: String,

//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );
// BookingSchema.index({ location: "2dsphere" });

// module.exports = mongoose.model("bookings", BookingSchema);
// models/BookingModel.js
const mongoose = require("mongoose");

const AssignedPartnerSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services" },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "partners" },
});

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "partners" },
    assignedPartners: [AssignedPartnerSchema],
    bookingStatus: {
      type: String,
      enum: ["Pending", "Cancelled", "Completed", "Progress"],
      default: "Pending",
    },
    address: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    date: {
      type: Date,
      // required: true,
      default: "",
    },
    timeSlot: {
      type: { start: String, end: String },
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "wallet"],
      // required: true,
    },
    paymentLogs: {
      type: [Object],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    cashfreePaymentId: String,
    cashfreeOrderId: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

BookingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Booking", BookingSchema);
