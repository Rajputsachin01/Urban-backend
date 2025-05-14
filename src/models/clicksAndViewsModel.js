const mongoose = require("mongoose");
const ClicksAndViewsSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Types.ObjectId,
      ref: "partner",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    activity: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
    },
    activityDate: {
      type: Date,
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClicksAnddViews", ClicksAndViewsSchema);
