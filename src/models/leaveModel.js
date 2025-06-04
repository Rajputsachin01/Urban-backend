const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "partner", 
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["hourly", "halfDay", "fullDay"],
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:mm"
  },
  endTime: {
    type: String, // Format: "HH:mm"
  },
  reason: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
