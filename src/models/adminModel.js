const mongoose = require("mongoose")
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: "",
    },
    firstName: {
        type: String,
        required: true,
        default: "",
    },
    lastName: {
        type: String,
        required: true,
        default: "",
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
    otp: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);

//  Hash Password Before Saving
// adminSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });
module.exports = mongoose.model("admin", adminSchema);