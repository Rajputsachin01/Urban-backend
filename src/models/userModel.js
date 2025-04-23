const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
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
      type: String,
      required: true,
      default: "",
    },
    location: {
      type: { lat: Number, lng: Number },
      required: true,
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

// For passswrod Hash
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     console.log("Password not modified, skipping hashing.");
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     console.log("Password hashed successfully.");
//     next();
//   } catch (error) {
//     console.error("Error hashing password:", error);
//     next(error);
//   }
// });

module.exports = mongoose.model("users", UserSchema);
