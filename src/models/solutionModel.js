const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["template", "solution"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("solution", solutionSchema);
