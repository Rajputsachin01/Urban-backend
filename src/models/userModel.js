const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
     userName: {
        type: String,
        required: true,
    },
    img:{
      type: String,
      required: true
    },
    name:{
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      default: "",
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      default: "",
    },
    phoneNo: {
      type: Number,
      required: true,
      default: "",
    },
    address: {
      type: [String],
      required: true,
      default: [],
    },
    status:{
      type:String,
      enum:["Active","InActive","Blocked"],
      default:"Active"
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0]
      }
    },
    
    referralCode: {
      type: String,
      default: "",
    },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    otp: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("users", UserSchema);
